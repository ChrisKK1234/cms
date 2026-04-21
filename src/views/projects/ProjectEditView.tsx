'use client'

import React from 'react'
import { EditViewWrapper } from '@/components/EditViewWrapper'

export function ProjectEditView(props: any) {
  return (
    <EditViewWrapper
      backHref="/admin/content"
      backLabel="Back"
      collectionSlug="projects"
      payloadProps={props}
    />
  )
}