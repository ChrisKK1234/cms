'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useField } from '@payloadcms/ui'

type Profile = {
  id: string
  name: string
  color?: string
  profileImage?: { cloudinary?: { secure_url?: string }; url?: string }
}

type OrderItem = {
  type: 'profile' | 'work'
  id?: string
}

type Props = {
  path: string
}

export function ProfileOrderField({ path }: Props) {
  const { value, setValue } = useField<OrderItem[]>({ path })
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const dragIndex = useRef<number | null>(null)
  const dragOverIndex = useRef<number | null>(null)

  useEffect(() => {
    fetch('/api/profiles?limit=100&sort=name&depth=1')
      .then(r => r.json())
      .then(d => {
        const docs: Profile[] = d.docs ?? []
        setProfiles(docs)

        // Byg initial liste fra gemt værdi eller default rækkefølge
        if (value && value.length > 0) {
          // Filtrer væk profiler der ikke længere eksisterer
          const validIds = new Set(docs.map(p => p.id))
          const filtered = value.filter(
            item => item.type === 'work' || (item.id && validIds.has(item.id))
          )
          // Tilføj nye profiler der ikke er i listen endnu
          const listedIds = new Set(filtered.filter(i => i.type === 'profile').map(i => i.id))
          const newProfiles = docs
            .filter(p => !listedIds.has(p.id))
            .map(p => ({ type: 'profile' as const, id: p.id }))
          setItems([...filtered, ...newProfiles])
        } else {
          // Default: work først, derefter profiler
          setItems([
            { type: 'work' },
            ...docs.map(p => ({ type: 'profile' as const, id: p.id })),
          ])
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function handleDragStart(index: number) {
    dragIndex.current = index
  }

  function handleDragEnter(index: number) {
    dragOverIndex.current = index
  }

  function handleDragEnd() {
    if (dragIndex.current === null || dragOverIndex.current === null) return
    if (dragIndex.current === dragOverIndex.current) return

    const next = [...items]
    const [moved] = next.splice(dragIndex.current, 1)
    next.splice(dragOverIndex.current, 0, moved)

    dragIndex.current = null
    dragOverIndex.current = null

    setItems(next)
    setValue(next)
  }

  function getProfile(id?: string) {
    return profiles.find(p => p.id === id)
  }

  function getAvatarUrl(profile: Profile) {
    return profile.profileImage?.cloudinary?.secure_url ?? profile.profileImage?.url ?? null
  }

  if (loading) {
    return <p style={{ fontSize: 13, color: 'var(--theme-elevation-500)' }}>Henter profiler...</p>
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--theme-text)', marginBottom: 4 }}>
        Rækkefølge
      </label>
      <p style={{ fontSize: 12, color: 'var(--theme-elevation-500)', marginBottom: 12, marginTop: 0 }}>
        Træk for at ændre rækkefølge på forsiden
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((item, index) => {
          const profile = item.type === 'profile' ? getProfile(item.id) : null
          const name = item.type === 'work' ? 'Work (Future Boss)' : (profile?.name ?? 'Ukendt profil')
          const color = item.type === 'work' ? '#33FF57' : (profile?.color ?? '#888')
          const avatarUrl = profile ? getAvatarUrl(profile) : null

          return (
            <div
              key={item.type === 'work' ? 'work' : item.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={e => e.preventDefault()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                border: '1px solid var(--theme-elevation-150)',
                borderRadius: 6,
                background: 'var(--theme-elevation-50)',
                cursor: 'grab',
                userSelect: 'none',
              }}
            >
              {/* Drag handle */}
              <span style={{ color: 'var(--theme-elevation-400)', fontSize: 14, flexShrink: 0 }}>⠿</span>

              {/* Avatar / color dot */}
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: avatarUrl ? 'transparent' : color,
                overflow: 'hidden',
                flexShrink: 0,
                border: '1px solid var(--theme-elevation-150)',
              }}>
                {avatarUrl && (
                  <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>

              {/* Name */}
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--theme-text)', flex: 1 }}>
                {name}
              </span>

              {/* Index badge */}
              <span style={{ fontSize: 11, color: 'var(--theme-elevation-400)' }}>
                #{index + 1}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}