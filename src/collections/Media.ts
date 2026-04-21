import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  admin: {
    components: {
      views: {
        list: {
          Component: '@/views/media/MediaListView#MediaListView',
        },
        edit: {
          default: {
            Component: '@/views/media/MediaEditView#MediaEditView',
          },
        },
      },
    },
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}