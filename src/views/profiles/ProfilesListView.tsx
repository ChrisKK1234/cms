'use client'

import React from 'react'
import { DefaultListView } from '@payloadcms/ui'
import { BackButton } from '@/components/BackButton'

export function ProfilesListView(props: any) {
  return (
    <div>
      <div style={{ padding: '32px 32px 0' }}>
        <BackButton href="/admin/content" label="Content" />
      </div>
      <DefaultListView {...props} />
    </div>
  )
}