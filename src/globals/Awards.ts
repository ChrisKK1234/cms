import type { GlobalConfig } from 'payload'
import { triggerNetlifyRebuild } from '@/lib/netlifyRebuild'

export const Awards: GlobalConfig = {
  slug: 'awards',
  label: 'Awards',
  access: {
    read: () => true,
  },
  admin: {
    components: {
        views: {
        edit: { default: { Component: '@/views/awards/AwardsEditView#AwardsEditView' } },
        },
    },
    },
  hooks: {
    afterChange: [
      async () => { await triggerNetlifyRebuild() },
    ],
  },
  fields: [
    {
      name: 'types',
      type: 'array',
      label: 'Award typer',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Navn',
          required: true,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Billede (klistermærke)',
          required: true,
        },
      ],
    },
  ],
}