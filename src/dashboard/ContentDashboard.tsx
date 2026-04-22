'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type Project = {
  id: string
  title: string
  updatedAt: string
}

type Profile = {
  id: string
  name: string
  color?: string
  updatedAt: string
  profileImage?: { cloudinary?: { secure_url?: string }; url?: string }
}

type WorkGlobal = {
  name?: string
  color?: string
  featuredProjects?: { id: string; title: string }[]
  profileOrder?: OrderItem[]
}

type OrderItem = {
  type: 'profile' | 'work'
  id?: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('da-DK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getAvatarUrl(profile: Profile) {
  return profile.profileImage?.cloudinary?.secure_url ?? profile.profileImage?.url ?? null
}

// ── Profile Order Component ───────────────────────────────────────────────────

function ProfileOrder({
  profiles,
  work,
  onSave,
}: {
  profiles: Profile[]
  work: WorkGlobal
  onSave: (order: OrderItem[]) => Promise<void>
}) {
  const dragIndex = useRef<number | null>(null)
  const dragOverIndex = useRef<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Byg initial liste
  function buildInitialItems(): OrderItem[] {
    const existing = work.profileOrder ?? []
    if (existing.length > 0) {
      const validIds = new Set(profiles.map(p => p.id))
      const filtered = existing.filter(
        item => item.type === 'work' || (item.id && validIds.has(item.id))
      )
      const listedIds = new Set(filtered.filter(i => i.type === 'profile').map(i => i.id))
      const newProfiles = profiles
        .filter(p => !listedIds.has(p.id))
        .map(p => ({ type: 'profile' as const, id: p.id }))
      return [...filtered, ...newProfiles]
    }
    return [
      { type: 'work' },
      ...profiles.map(p => ({ type: 'profile' as const, id: p.id })),
    ]
  }

  const [items, setItems] = useState<OrderItem[]>(buildInitialItems)

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
  }

  async function handleSave() {
    setSaving(true)
    await onSave(items)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function getProfile(id?: string) {
    return profiles.find(p => p.id === id)
  }

  return (
    <div>
      <div style={s.orderList}>
        {items.map((item, index) => {
          const profile = item.type === 'profile' ? getProfile(item.id) : null
          const name = item.type === 'work' ? (work.name ?? 'Future Boss') : (profile?.name ?? '?')
          const color = item.type === 'work' ? (work.color ?? '#33FF57') : (profile?.color ?? '#888')
          const avatarUrl = profile ? getAvatarUrl(profile) : null

          return (
            <div
              key={item.type === 'work' ? 'work' : item.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={e => e.preventDefault()}
              style={s.orderItem}
            >
              <span style={s.dragHandle}>⠿</span>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: avatarUrl ? 'transparent' : color,
                overflow: 'hidden',
                flexShrink: 0,
                border: '1px solid var(--theme-border-color, rgba(255,255,255,0.1))',
              }}>
                {avatarUrl && (
                  <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <span style={s.orderItemName}>{name}</span>
              {item.type === 'work' && (
                <span style={s.workBadge}>Work</span>
              )}
              <span style={s.orderIndex}>#{index + 1}</span>
            </div>
          )
        })}
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          ...s.saveOrderBtn,
          color: saved ? '#22c55e' : 'var(--theme-text)',
        }}
      >
        {saving ? 'Gemmer...' : saved ? 'Gemt ✓' : 'Gem rækkefølge'}
      </button>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export const ContentDashboard: React.FC = () => {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [work, setWork] = useState<WorkGlobal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [projRes, profRes, workRes] = await Promise.all([
          fetch('/api/projects?limit=100&sort=-updatedAt'),
          fetch('/api/profiles?limit=100&sort=-updatedAt&depth=1'),
          fetch('/api/globals/work'),
        ])
        const [projData, profData, workData] = await Promise.all([
          projRes.json(),
          profRes.json(),
          workRes.json(),
        ])
        setProjects(projData.docs ?? [])
        setProfiles(profData.docs ?? [])
        setWork(workData)
      } catch (e) {
        console.error('Content dashboard fetch error', e)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  async function saveOrder(order: OrderItem[]) {
    await fetch('/api/globals/work', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileOrder: order }),
    })
    setWork(prev => prev ? { ...prev, profileOrder: order } : prev)
  }

  const featuredCount = work?.featuredProjects?.length ?? 0

  return (
    <div style={s.page}>
      <button
        style={s.backButton}
        onClick={() => router.push('/admin')}
        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.5')}
      >
        ← Dashboard
      </button>
      <p style={s.heading}>Content</p>

      {/* Nav */}
      <section style={s.section}>
        <div style={s.sectionHeader}>
          <p style={s.sectionTitle}>Navigation menu</p>
        </div>
        <div
          style={s.singletonCard}
          onClick={() => router.push('/admin/globals/nav')}
          onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = 'var(--theme-elevation-100, rgba(255,255,255,0.06))')}
          onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = 'var(--theme-elevation-50, rgba(255,255,255,0.03))')}
        >
          <div style={s.singletonLeft}>
            <p style={s.singletonTitle}>Nav</p>
            <span style={s.singletonMeta}>Logo og kontaktoplysninger</span>
          </div>
          <span style={s.editLink}>Rediger →</span>
        </div>
      </section>

      <hr style={s.divider} />

      {/* Work */}
      <section style={s.section}>
        <div style={s.sectionHeader}>
          <p style={s.sectionTitle}>Work Page</p>
        </div>
        <div
          style={s.singletonCard}
          onClick={() => router.push('/admin/globals/work')}
          onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = 'var(--theme-elevation-100, rgba(255,255,255,0.06))')}
          onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = 'var(--theme-elevation-50, rgba(255,255,255,0.03))')}
        >
          <div style={s.singletonLeft}>
            <p style={s.singletonTitle}>Work</p>
            <span style={s.singletonMeta}>
              {loading ? '–' : `${featuredCount} featured project${featuredCount !== 1 ? 's' : ''}`}
            </span>
          </div>
          <span style={s.editLink}>Rediger →</span>
        </div>
      </section>

      <hr style={s.divider} />

      {/* Profiles */}
      <section style={s.section}>
        <div style={s.sectionHeader}>
          <p style={s.sectionTitle}>Profile Pages</p>
          <button style={s.newButton} onClick={() => router.push('/admin/collections/profiles/create')}>
            + Ny profil
          </button>
        </div>
        {loading ? (
          <p style={s.emptyState}>Henter...</p>
        ) : profiles.length === 0 ? (
          <p style={s.emptyState}>Ingen profiler endnu</p>
        ) : (
          profiles.map(profile => (
            <div
              key={profile.id}
              style={s.card}
              onClick={() => router.push(`/admin/collections/profiles/${profile.id}`)}
              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = 'var(--theme-elevation-100, rgba(255,255,255,0.06))')}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = 'var(--theme-elevation-50, rgba(255,255,255,0.03))')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: getAvatarUrl(profile) ? 'transparent' : (profile.color ?? '#888'),
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '1px solid var(--theme-border-color, rgba(255,255,255,0.1))',
                }}>
                  {getAvatarUrl(profile) && (
                    <img src={getAvatarUrl(profile)!} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <div>
                  <p style={s.cardTitle}>{profile.name}</p>
                  <p style={s.cardMeta}>Opdateret {formatDate(profile.updatedAt)}</p>
                </div>
              </div>
              <span style={s.editLink}>Rediger →</span>
            </div>
          ))
        )}
      </section>

      <hr style={s.divider} />

      {/* Forside rækkefølge */}
      <section style={s.section}>
        <div style={s.sectionHeader}>
          <p style={s.sectionTitle}>Forside rækkefølge</p>
        </div>
        {loading ? (
          <p style={s.emptyState}>Henter...</p>
        ) : (
          <ProfileOrder
            profiles={profiles}
            work={work ?? {}}
            onSave={saveOrder}
          />
        )}
      </section>

      <hr style={s.divider} />

      {/* Projects */}
      <section style={s.section}>
        <div style={s.sectionHeader}>
          <p style={s.sectionTitle}>Project Pages ({loading ? '–' : projects.length})</p>
          <button style={s.newButton} onClick={() => router.push('/admin/collections/projects/create')}>
            + Nyt projekt
          </button>
        </div>
        {loading ? (
          <p style={s.emptyState}>Henter...</p>
        ) : projects.length === 0 ? (
          <p style={s.emptyState}>Ingen projekter endnu</p>
        ) : (
          projects.map(project => (
            <div
              key={project.id}
              style={s.card}
              onClick={() => router.push(`/admin/collections/projects/${project.id}`)}
              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = 'var(--theme-elevation-100, rgba(255,255,255,0.06))')}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = 'var(--theme-elevation-50, rgba(255,255,255,0.03))')}
            >
              <div>
                <p style={s.cardTitle}>{project.title}</p>
                <p style={s.cardMeta}>Opdateret {formatDate(project.updatedAt)}</p>
              </div>
              <span style={s.editLink}>Rediger →</span>
            </div>
          ))
        )}
      </section>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    padding: '40px 48px',
    fontFamily: 'var(--font-body)',
    color: 'var(--theme-text)',
    maxWidth: 960,
  },
  backButton: {
//     display: 'inline-block',
//     fontSize: 12,
//     fontWeight: 500,
//     letterSpacing: '0.04em',
//     color: 'var(--theme-text-secondary, #888)',
//     background: 'none',
//     border: 'none',
//     padding: '0 0 24px 0',
//     cursor: 'pointer',
//     opacity: 0.5,
//     transition: 'opacity 0.15s',
//   },
// {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--theme-text)',
    background: 'var(--theme-elevation-50)',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: 4,
    padding: '6px 14px',
    marginBottom: '24px',
    cursor: 'pointer',
    opacity: 0.45,
    transition: 'opacity 0.15s',
    whiteSpace: 'nowrap',
},
  heading: {
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: 'var(--theme-text-secondary, #888)',
    marginBottom: 24,
    marginTop: 0,
  },
  section: { marginBottom: 48 },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: 'var(--theme-text-secondary, #888)',
    margin: 0,
  },
  newButton: {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--theme-text)',
    background: 'none',
    border: '1px solid var(--theme-border-color, rgba(255,255,255,0.15))',
    borderRadius: 4,
    padding: '4px 12px',
    cursor: 'pointer',
    letterSpacing: '0.04em',
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 18px',
    border: '1px solid var(--theme-border-color, rgba(255,255,255,0.1))',
    borderRadius: 6,
    marginBottom: 8,
    background: 'var(--theme-elevation-50, rgba(255,255,255,0.03))',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 500,
    margin: 0,
    color: 'var(--theme-text)',
  },
  cardMeta: {
    fontSize: 12,
    color: 'var(--theme-text-secondary, #888)',
    margin: 0,
    marginTop: 2,
  },
  editLink: {
    fontSize: 12,
    color: 'var(--theme-text-secondary, #888)',
    letterSpacing: '0.04em',
  },
  singletonCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 18px',
    border: '1px solid var(--theme-border-color, rgba(255,255,255,0.1))',
    borderRadius: 6,
    background: 'var(--theme-elevation-50, rgba(255,255,255,0.03))',
    cursor: 'pointer',
  },
  singletonLeft: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  },
  singletonTitle: {
    fontSize: 14,
    fontWeight: 500,
    margin: 0,
    color: 'var(--theme-text)',
  },
  singletonMeta: {
    fontSize: 12,
    color: 'var(--theme-text-secondary, #888)',
  },
  emptyState: {
    fontSize: 13,
    color: 'var(--theme-text-secondary, #888)',
    padding: '14px 18px',
    border: '1px dashed var(--theme-border-color, rgba(255,255,255,0.1))',
    borderRadius: 6,
    textAlign: 'center' as const,
  },
  divider: {
    border: 'none',
    borderTop: '1px solid var(--theme-border-color, rgba(255,255,255,0.08))',
    margin: '0 0 48px 0',
  },
  orderList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
    marginBottom: 12,
  },
  orderItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 14px',
    border: '1px solid var(--theme-border-color, rgba(255,255,255,0.1))',
    borderRadius: 6,
    background: 'var(--theme-elevation-50, rgba(255,255,255,0.03))',
    cursor: 'grab',
    userSelect: 'none' as const,
  },
  dragHandle: {
    color: 'var(--theme-text-secondary, #888)',
    fontSize: 14,
    flexShrink: 0,
  },
  orderItemName: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--theme-text)',
    flex: 1,
  },
  workBadge: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    color: 'var(--theme-text-secondary, #888)',
    border: '1px solid var(--theme-border-color, rgba(255,255,255,0.15))',
    borderRadius: 3,
    padding: '2px 6px',
  },
  orderIndex: {
    fontSize: 11,
    color: 'var(--theme-text-secondary, #888)',
  },
  saveOrderBtn: {
    fontSize: 12,
    fontWeight: 500,
    background: 'none',
    border: '1px solid var(--theme-border-color, rgba(255,255,255,0.15))',
    borderRadius: 4,
    padding: '5px 14px',
    cursor: 'pointer',
    transition: 'color 0.15s',
  },
}