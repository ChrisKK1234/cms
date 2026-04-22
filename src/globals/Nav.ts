import type { GlobalConfig, Block } from 'payload'
import { triggerNetlifyRebuild } from '@/lib/netlifyRebuild'

const ContactItemBlock: Block = {
  slug: 'contactItem',
  labels: { singular: 'Kontakt element', plural: 'Kontakt elementer' },
  fields: [
    {
      name: 'label',
      type: 'text',
      label: 'Label',
      required: true,
      admin: {
        description: 'Fx "Email", "Telefon", "Instagram"',
      },
    },
    {
      name: 'type',
      type: 'select',
      label: 'Type',
      required: true,
      defaultValue: 'link',
      options: [
        { label: 'Link (URL)', value: 'link' },
        { label: 'Email', value: 'email' },
        { label: 'Telefon', value: 'phone' },
      ],
    },
    {
      name: 'value',
      type: 'text',
      label: 'Værdi',
      required: true,
      admin: {
        description: 'URL, email-adresse eller telefonnummer',
      },
    },
  ],
}

export const Nav: GlobalConfig = {
  slug: 'nav',
  label: 'Nav',
  admin: {
    components: {
      views: {
        edit: {
          default: {
            Component: '@/views/nav/NavEditView#NavEditView',
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
    {
      name: 'contact',
      type: 'blocks',
      label: 'Kontaktoplysninger',
      blocks: [ContactItemBlock],
    },
  ],
}