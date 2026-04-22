import type { CollectionConfig, Block } from 'payload'
import {
  lexicalEditor,
  BoldFeature,
  ItalicFeature,
  HeadingFeature,
  FixedToolbarFeature,
} from '@payloadcms/richtext-lexical'

const richTextEditor = lexicalEditor({
  features: [
    FixedToolbarFeature(),
    BoldFeature(),
    ItalicFeature(),
    HeadingFeature({ enabledHeadingSizes: ['h3'] }),
  ],
})

const ContextTextBlock: Block = {
  slug: 'contextText',
  labels: { singular: 'Context Text', plural: 'Context Text' },
  fields: [
    {
      name: 'columns',
      type: 'select',
      label: 'Antal kolonner',
      required: true,
      defaultValue: '1',
      options: [
        { label: '1 kolonne', value: '1' },
        { label: '2 kolonner', value: '2' },
        { label: '3 kolonner', value: '3' },
      ],
    },
    {
      name: 'col1',
      type: 'richText',
      label: 'Kolonne 1',
      editor: richTextEditor,
    },
    {
      name: 'col2',
      type: 'richText',
      label: 'Kolonne 2',
      editor: richTextEditor,
      admin: {
        condition: (_, siblingData) => ['2', '3'].includes(siblingData?.columns),
      },
    },
    {
      name: 'col3',
      type: 'richText',
      label: 'Kolonne 3',
      editor: richTextEditor,
      admin: {
        condition: (_, siblingData) => siblingData?.columns === '3',
      },
    },
  ],
}

const SimpleMediaBlock: Block = {
  slug: 'simpleMedia',
  labels: { singular: 'Medie', plural: 'Medier' },
  fields: [
    {
      name: 'mediaType',
      type: 'text',
      label: 'Medie',
      defaultValue: 'media',
      admin: {
        components: {
          Field: '@/components/fields/SimpleMediaField#SimpleMediaField',
        },
      },
    },
    {
      name: 'mediaMedia',
      type: 'upload',
      label: 'Billede',
      relationTo: 'media',
      admin: { hidden: true },
    },
    {
      name: 'mediaMux',
      type: 'relationship',
      label: 'Video',
      relationTo: 'mux-videos',
      admin: { hidden: true },
    },
    {
      name: 'mediaMuted',
      type: 'checkbox',
      label: 'Video muted',
      defaultValue: true,
      admin: { hidden: true },
    },
  ],
}

const MultipleImagesBlock: Block = {
  slug: 'multipleImages',
  labels: { singular: 'Flere billeder', plural: 'Flere billeder' },
  fields: [
    {
      name: 'images',
      type: 'array',
      label: 'Billeder',
      minRows: 2,
      fields: [
        {
          name: 'image',
          type: 'upload',
          label: 'Billede',
          relationTo: 'media',
          required: true,
        },
      ],
    },
  ],
}

const CreditsBlock: Block = {
  slug: 'credits',
  labels: { singular: 'Credits', plural: 'Credits' },
  fields: [
    {
      name: 'recognitions',
      type: 'array',
      label: 'Recognitions',
      admin: { description: 'Listepunkter i plain text' },
      fields: [
        {
          name: 'text',
          type: 'text',
          label: 'Tekst',
          required: true,
        },
      ],
    },
    {
      name: 'creditsList',
      type: 'array',
      label: 'Credits',
      fields: [
        {
          name: 'role',
          type: 'text',
          label: 'Rolle',
          required: true,
        },
        {
          name: 'name',
          type: 'text',
          label: 'Navn',
          required: true,
        },
      ],
    },
  ],
}

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    components: {
      views: {
        list: {
          Component: '@/views/projects/ProjectsListView#ProjectsListView',
        },
        edit: {
          default: {
            Component: '@/views/projects/ProjectEditView#ProjectEditView',
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
        if (data.title && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
        }
        return data
      },
    ],
  },
  fields: [
    // ── Meta ──
    {
      name: 'title',
      type: 'text',
      label: 'Titel',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      unique: true,
      admin: {
        description: 'Auto-genereret fra titel. URL: /projects/[slug]',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      label: 'Thumbnail',
      relationTo: 'media',
      required: true,
    },

    // ── Background media ──
    {
      name: 'backgroundType',
      type: 'text',
      label: 'Background media',
      defaultValue: 'media',
      required: true,
      admin: {
        components: {
          Field: '@/components/fields/BackgroundMediaField#BackgroundMediaField',
        },
      },
    },
    {
      name: 'backgroundMedia',
      type: 'upload',
      label: 'Background billede',
      relationTo: 'media',
      admin: { hidden: true },
    },
    {
      name: 'backgroundMux',
      type: 'relationship',
      label: 'Background video',
      relationTo: 'mux-videos',
      admin: { hidden: true },
    },
    {
      name: 'backgroundMuted',
      type: 'checkbox',
      label: 'Background video muted',
      defaultValue: true,
      admin: { hidden: true },
    },

    // ── Field bank ──
    {
      name: 'fields',
      type: 'blocks',
      label: 'Indhold',
      blocks: [
        ContextTextBlock,
        SimpleMediaBlock,
        MultipleImagesBlock,
        CreditsBlock,
      ],
    },
  ],
}