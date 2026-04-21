'use client'

import React from 'react'
import { DefaultListView } from '@payloadcms/ui'
import { BackButton } from '@/components/BackButton'

export function MediaListView(props: any) {
  return (
    <div>
      <div style={{ padding: '32px 60px 32px' }}>
        <BackButton href="/admin" label="Dashboard" />
      </div>
      <DefaultListView {...props} />
    </div>
  )
}