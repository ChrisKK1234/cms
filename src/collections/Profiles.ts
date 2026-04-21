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
    defaultColumns: ['name', 'title', 'updatedAt'],
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
  fields: [
    // ── Meta ──
    {
      name: 'name',
      type: 'text',
      label: 'Navn',
      required: true,
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
      label: 'Hero type',
      admin: { hidden: true },
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
      name: 'hero',
      type: 'ui',
      label: 'Hero',
      admin: {
        components: {
          Field: '@/components/fields/MediaOrMuxField#MediaOrMuxField',
        },
      },
    },
  ],
}