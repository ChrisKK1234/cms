import type { CollectionConfig } from 'payload'

export const Profiles: CollectionConfig = {
  slug: 'profiles',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'updatedAt'],
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
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    // Components tilføjes her
  ],
}