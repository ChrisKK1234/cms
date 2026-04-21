import type { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'updatedAt'],
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
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    // Components tilføjes her
  ],
}