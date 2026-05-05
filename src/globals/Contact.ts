import type { GlobalConfig } from 'payload'
import { triggerNetlifyRebuild } from '@/lib/netlifyRebuild'

export const Contact: GlobalConfig = {
  slug: 'contact',
  label: 'Contact',
  access: {
    read: () => true,
  },
  admin: {
  components: {
    views: {
      edit: { default: { Component: '@/views/contact/ContactEditView#ContactEditView' } },
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
      name: 'chris',
      type: 'group',
      label: 'Chris',
      fields: [
        {
          name: 'linkedin',
          type: 'text',
          label: 'LinkedIn URL',
        },
        {
          name: 'instagram',
          type: 'text',
          label: 'Instagram URL',
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email',
        },
      ],
    },
    {
      name: 'oscar',
      type: 'group',
      label: 'Oscar',
      fields: [
        {
          name: 'linkedin',
          type: 'text',
          label: 'LinkedIn URL',
        },
        {
          name: 'instagram',
          type: 'text',
          label: 'Instagram URL',
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email',
        },
      ],
    },
    {
      name: 'recognitions',
      type: 'array',
      label: 'Recognitions',
      fields: [
        {
          name: 'text',
          type: 'text',
          label: 'Text',
          required: true,
        },
      ],
    },
  ],
}