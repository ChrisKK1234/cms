'use client'

import React from 'react'
import { EditViewWrapper } from '@/components/EditViewWrapper'

export function ProfileEditView(props: any) {
  return (
    <EditViewWrapper
      backHref="/admin/content"
      backLabel="Back"
      collectionSlug="profiles"
      payloadProps={props}
    />
  )
}