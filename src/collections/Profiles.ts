import type { CollectionConfig } from 'payload'
import {
  lexicalEditor,
  BoldFeature,
  ItalicFeature,
  HeadingFeature,
  FixedToolbarFeature,
} from '@payloadcms/richtext-lexical'

export const Profiles: CollectionConfig = {
  slug: 'profiles',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'title', 'slug', 'updatedAt'],
    components: {
      views: {
        list: {
          Component: '@/views/profiles/ProfilesListView#ProfilesListView',
        },
        edit: {
          default: {
            Component: '@/views/profiles/ProfileEditView#ProfileEditView',
          },
        },
      },
    },
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.name && (!data.slug || data.slug === '')) {
          data.slug = data.name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return doc
        try {
          const work = await req.payload.findGlobal({
            slug: 'work',
            overrideAccess: true,
          })
          const currentOrder = (work.profileOrder as any[]) ?? []
          const alreadyInOrder = currentOrder.some(
            (item: any) => item.type === 'profile' && item.id === doc.id
          )
          if (!alreadyInOrder) {
            await req.payload.updateGlobal({
              slug: 'work',
              overrideAccess: true,
              data: {
                profileOrder: [
                  ...currentOrder,
                  { type: 'profile', id: doc.id },
                ],
              },
            })
          }
        } catch (e) {
          console.error('[Profiles] afterChange: kunne ikke opdatere profileOrder', e)
        }
        return doc
      },
    ],
  },
  fields: [
    // ── Meta ──
    {
      name: 'name',
      type: 'text',
      label: 'Navn',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      unique: true,
      admin: {
        description: 'Auto-genereret fra navn. URL: /profiles/[slug]',
      },
    },
    {
      name: 'color',
      type: 'text',
      label: 'Farve',
      admin: {
        description: 'Vælg en farve til profilen',
        components: {
          Field: '@/components/fields/ColorPickerField#ColorPickerField',
        },
      },
    },

    // ── Tekst ──
    {
      name: 'title',
      type: 'text',
      label: 'Titel',
    },
    {
      name: 'bio',
      type: 'richText',
      label: 'Bio',
      editor: lexicalEditor({
        features: [
          FixedToolbarFeature(),
          BoldFeature(),
          ItalicFeature(),
          HeadingFeature({ enabledHeadingSizes: ['h3'] }),
        ],
      }),
    },

    // ── Billeder ──
    {
      name: 'profileImage',
      type: 'upload',
      label: 'Profilbillede (avatar)',
      relationTo: 'media',
    },

    // Hero – media eller mux
    {
      name: 'heroType',
      type: 'text',
      label: 'Hero media',
      defaultValue: 'media',
      admin: {
        components: {
          Field: '@/components/fields/HeroMediaField#HeroMediaField',
        },
      },
    },
    {
      name: 'heroMedia',
      type: 'upload',
      label: 'Hero billede',
      relationTo: 'media',
      admin: { hidden: true },
    },
    {
      name: 'heroMux',
      type: 'relationship',
      label: 'Hero video',
      relationTo: 'mux-videos',
      admin: { hidden: true },
    },
    {
      name: 'heroMuted',
      type: 'checkbox',
      label: 'Hero video muted',
      defaultValue: true,
      admin: { hidden: true },
    },
  ],
}