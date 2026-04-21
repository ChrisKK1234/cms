'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function MuxNavLink() {
  const pathname = usePathname()
  const isActive = pathname?.includes('/mux-videos')

  return (
    <div style={s.wrapper}>
      <Link
        href="/admin/mux-videos"
        style={{
          ...s.link,
          ...(isActive ? s.active : {}),
        }}
      >
        <span style={s.icon}>🎬</span>
        <span>Mux Videos</span>
      </Link>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  wrapper: {
    paddingInline: '16px',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    borderRadius: '4px',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--theme-text)',
    transition: 'background 0.15s',
  },
  active: {
    background: 'var(--theme-elevation-100)',
    color: 'var(--theme-text)',
  },
  icon: {
    fontSize: '14px',
  },
}
