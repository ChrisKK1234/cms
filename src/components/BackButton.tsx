'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  href: string
  label: string
}

export function BackButton({ href, label }: Props) {
  const router = useRouter()
  const [hovered, setHovered] = React.useState(false)

  return (
    <button
      onClick={() => router.push(href)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--theme-text)',
        background: 'var(--theme-elevation-50)',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 4,
        padding: '6px 14px',
        cursor: 'pointer',
        opacity: hovered ? 1 : 0.45,
        transition: 'opacity 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {'←'} {label}
    </button>
  )
}