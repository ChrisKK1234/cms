import type { GlobalConfig } from 'payload'
import { triggerNetlifyRebuild } from '@/lib/netlifyRebuild'

export const Work: GlobalConfig = {
  slug: 'work',
  label: 'Work',
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
  hooks: {
    afterChange: [
      async () => { await triggerNetlifyRebuild() },
    ],
  },
  fields: [
    // ── Future Boss identity ──
    {
      name: 'name',
      type: 'text',
      label: 'Navn (Future Boss)',
      defaultValue: 'Future Boss',
      required: true,
    },
    {
      name: 'color',
      type: 'text',
      label: 'Farve',
      admin: {
        description: 'Farve til Future Boss profil-kortet på forsiden',
        components: {
          Field: '@/components/fields/ColorPickerField#ColorPickerField',
        },
      },
    },

    // ── Forside rækkefølge (styres fra Content Dashboard) ──
    {
      name: 'profileOrder',
      type: 'json',
      label: 'Forside rækkefølge',
      admin: { hidden: true },
    },

    // ── Featured projekter ──
    {
      name: 'featuredProjects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      label: 'Featured projekter',
      admin: {
        components: {
          Field: '@/components/fields/FeaturedProjectsField#FeaturedProjectsField',
        },
      },
    },
  ],
}