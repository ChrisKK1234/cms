'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDocumentInfo } from '@payloadcms/ui'

type Props = {
  collectionSlug?: string
  backHref: string
  backLabel: string
}

export function DeleteAction({ collectionSlug, backHref, backLabel }: Props) {
  const router = useRouter()
  const { id } = useDocumentInfo()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (!id) return null

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true)
      return
    }
    setDeleting(true)
    try {
      await fetch(`/api/${collectionSlug}/${id}`, { method: 'DELETE' })
      router.push(backHref)
    } catch (e) {
      console.error('Delete failed', e)
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      onMouseLeave={() => setConfirming(false)}
      style={{
        fontSize: 13,
        fontWeight: 500,
        color: confirming ? '#fff' : '#ef4444',
        background: confirming ? '#ef4444' : 'transparent',
        border: '1px solid #ef4444',
        borderRadius: 4,
        padding: '6px 14px',
        cursor: deleting ? 'not-allowed' : 'pointer',
        opacity: deleting ? 0.6 : 1,
        transition: 'all 0.15s',
        whiteSpace: 'nowrap' as const,
      }}
    >
      {deleting ? 'Sletter...' : confirming ? 'Er du sikker?' : 'Slet'}
    </button>
  )
}