import type { Endpoint } from 'payload'
import type { MuxPluginOptions } from '../plugin'
import { getMuxClient } from '../lib/muxClient'
import { requireAuth } from '../../lib/requireAuth'

export const muxSyncEndpoint = ({
  options,
  collectionSlug,
}: {
  options: MuxPluginOptions
  collectionSlug: string
}): Endpoint => ({
  path: '/mux-sync',
  method: 'post',
  handler: async (req) => {
    const authError = await requireAuth(req)
    if (authError) return authError

    try {
      const mux = getMuxClient(options)
      const response = await mux.video.assets.list({ limit: 100 })
      let created = 0
      let updated = 0

      for (const asset of response.data) {
        const playbackId = asset.playback_ids?.find((p) => p.policy === 'public')?.id ?? null
        const title = asset.passthrough || 'Ingen titel'
        const existing = await req.payload.find({
          collection: collectionSlug as any,
          where: { muxAssetId: { equals: asset.id } },
          limit: 1,
          overrideAccess: true,
        })

        if (existing.docs.length > 0) {
          await req.payload.update({
            collection: collectionSlug as any,
            id: existing.docs[0].id,
            overrideAccess: true,
            data: {
              title,
              playbackId: playbackId ?? '',
              status: asset.status,
              duration: asset.duration ?? null,
              aspectRatio: asset.aspect_ratio ?? null,
              thumbnailUrl: playbackId
                ? `https://image.mux.com/${playbackId}/thumbnail.jpg?width=400&time=2`
                : null,
            },
          })
          updated++
          continue
        }

        await req.payload.create({
          collection: collectionSlug as any,
          overrideAccess: true,
          data: {
            title,
            muxAssetId: asset.id,
            playbackId: playbackId ?? '',
            status: asset.status,
            duration: asset.duration ?? null,
            aspectRatio: asset.aspect_ratio ?? null,
            thumbnailUrl: playbackId
              ? `https://image.mux.com/${playbackId}/thumbnail.jpg?width=400&time=2`
              : null,
          },
        })
        created++
      }

      return Response.json({ ok: true, created, updated })
    } catch (err) {
      console.error('[Mux] Sync failed:', err)
      return Response.json({ error: 'Sync failed' }, { status: 500 })
    }
  },
})
