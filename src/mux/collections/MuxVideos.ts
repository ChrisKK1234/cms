import type { CollectionConfig } from 'payload'
import type { MuxPluginOptions } from '../plugin'
import { getMuxClient } from '../lib/muxClient'

interface Options {
  slug: string
  options: MuxPluginOptions
}

let isSyncing = false

export const MuxVideosCollection = ({ slug, options }: Options): CollectionConfig => ({
  slug,
  access: {
    read: () => true,
  },
  labels: {
    singular: 'Mux Video',
    plural: 'Mux Videos',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'thumbnail', 'status', 'duration'],
    description: 'Videoer synkroniseret fra Mux.',
    components: {
      edit: {
        SaveButton: '@/mux/plugin/components/MuxHiddenSaveButton#MuxHiddenSaveButton',
      },
      views: {
        list: { Component: '@/views/mux/MuxVideosListView#MuxVideosListView' },
        edit: { default: { Component: '@/views/mux/MuxVideoEditView#MuxVideoEditView' } },
      },
    },
  },
  fields: [
    // Kun disse to gemmes i MongoDB — resten hentes fra Mux via afterRead
    {
      name: 'muxAssetId',
      type: 'text',
      label: 'Mux Asset ID',
      admin: { readOnly: true },
    },
    {
      name: 'playbackId',
      type: 'text',
      label: 'Playback ID',
      admin: { readOnly: true },
    },
    // Virtuelle felter — ikke gemt, kun til visning
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { label: 'Waiting', value: 'waiting' },
        { label: 'Preparing', value: 'preparing' },
        { label: 'Ready', value: 'ready' },
        { label: 'Errored', value: 'errored' },
      ],
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'duration',
      type: 'number',
      label: 'Varighed (sek)',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'aspectRatio',
      type: 'text',
      label: 'Aspect Ratio',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'thumbnailUrl',
      type: 'text',
      label: 'Thumbnail URL',
      admin: { readOnly: true },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Titel',
      admin: {
        readOnly: false,
      },
    },
    {
      name: 'renameField',
      type: 'ui',
      label: 'Omdøb',
      admin: {
        condition: (data) => Boolean(data?.muxAssetId),
        components: {
          Field: '@/mux/plugin/components/MuxRenameField#MuxRenameField',
        },
      },
    },
    {
      name: 'thumbnail',
      type: 'ui',
      label: 'Thumbnail',
      admin: {
        components: {
          Cell: '@/mux/plugin/components/MuxThumbnailCell#MuxThumbnailCell',
        },
      },
    },
    {
      name: 'uploadField',
      type: 'ui',
      label: 'Upload Video',
      admin: {
        components: {
          Field: '@/mux/plugin/components/MuxUploadField#MuxUploadField',
        },
      },
    },
    {
      name: 'deleteField',
      type: 'ui',
      label: 'Slet video',
      admin: {
        condition: (data) => Boolean(data?.muxAssetId),
        components: {
          Field: '@/mux/plugin/components/MuxDeleteField#MuxDeleteField',
        },
      },
    },
  ],

  hooks: {
    afterRead: [
      async ({ doc }) => {
        if (!doc?.muxAssetId) return doc
        try {
          const mux = getMuxClient(options)
          const asset = await mux.video.assets.retrieve(doc.muxAssetId)
          const playbackId =
            asset.playback_ids?.find((p) => p.policy === 'public')?.id ?? doc.playbackId
          return {
            ...doc,
            title: asset.passthrough || 'Ingen titel',
            status: asset.status,
            duration: asset.duration ?? null,
            aspectRatio: asset.aspect_ratio ?? null,
            playbackId,
            thumbnailUrl: playbackId
              ? `https://image.mux.com/${playbackId}/thumbnail.jpg?width=400&time=2`
              : null,
          }
        } catch {
          return doc
        }
      },
    ],

    afterDelete: [
      async ({ doc }) => {
        if (!doc?.muxAssetId) return
        try {
          const mux = getMuxClient(options)
          await mux.video.assets.delete(doc.muxAssetId)
        } catch {
          // Asset er måske allerede slettet i Mux
        }
      },
    ],

    afterChange: [
      async ({ doc }) => {
        if (!doc?.muxAssetId) return doc
        try {
          const mux = getMuxClient(options)
          await mux.video.assets.update(doc.muxAssetId, {
            passthrough: doc.title ?? '',
          })
        } catch (err) {
          console.error('[Mux] Title sync fejlede:', err)
        }
        return doc
      },
    ],

    afterOperation: [
      async ({ operation, result, req }) => {
        if (operation !== 'find') return result
        if (isSyncing || !req?.payload) return result

        isSyncing = true
        try {
          const mux = getMuxClient(options)
          const response = await mux.video.assets.list({ limit: 100 })
          const muxIds = new Set(response.data.map((a) => a.id))

          const existing = await req.payload.find({
            collection: slug as any,
            limit: 100,
            overrideAccess: true,
            pagination: false,
          })

          for (const doc of existing.docs) {
            if (doc.muxAssetId && !muxIds.has(doc.muxAssetId as string)) {
              await req.payload.delete({
                collection: slug as any,
                id: doc.id,
                overrideAccess: true,
              })
            }
          }

          const existingMuxIds = new Set(existing.docs.map((d) => d.muxAssetId))
          for (const asset of response.data) {
            if (existingMuxIds.has(asset.id)) continue
            const playbackId = asset.playback_ids?.find((p) => p.policy === 'public')?.id ?? null
            await req.payload.create({
              collection: slug as any,
              overrideAccess: true,
              data: {
                muxAssetId: asset.id,
                playbackId: playbackId ?? '',
              },
            })
          }
        } catch (err) {
          console.error('[Mux] Auto-sync fejlede:', err)
        } finally {
          isSyncing = false
        }

        return result
      },
    ],
  },
})
