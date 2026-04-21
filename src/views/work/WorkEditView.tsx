'use client'

import React from 'react'
import { EditViewWrapper } from '@/components/EditViewWrapper'

export function WorkEditView(props: any) {
  return (
    <EditViewWrapper
      backHref="/admin/content"
      backLabel="Content"
      // Ingen collectionSlug – Work er en global og kan ikke slettes
      payloadProps={props}
    />
  )
}