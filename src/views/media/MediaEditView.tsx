'use client'

import React from 'react'
import { EditViewWrapper } from '@/components/EditViewWrapper'

export function MediaEditView(props: any) {
  return (
    <EditViewWrapper
      backHref="/admin/collections/media"
      backLabel="Media"
      collectionSlug="media"
      payloadProps={props}
    />
  )
}