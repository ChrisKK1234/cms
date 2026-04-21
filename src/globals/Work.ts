import type { GlobalConfig } from 'payload'

export const Work: GlobalConfig = {
  slug: 'work',
  admin: {
    components: {
      views: {
        edit: {
          default: {
            Component: '@/views/work/WorkEditView#WorkEditView',
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
      name: 'featuredProjects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      admin: {
        description: 'Vælg hvilke projekter der vises på work-siden',
      },
    },
    // Components tilføjes her
  ],
}