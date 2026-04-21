'use client'

import React from 'react'
import { EditViewWrapper } from '@/components/EditViewWrapper'

export function MuxVideoEditView(props: any) {
  return (
    <EditViewWrapper
      backHref="/admin/collections/mux-videos"
      backLabel="Video"
      collectionSlug="mux-videos"
      payloadProps={props}
    />
  )
}