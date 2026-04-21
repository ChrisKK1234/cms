'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BackButton } from '@/components/BackButton'

type Project = {
  id: string
  title: string
  updatedAt: string
}

type Profile = {
  id: string
  name: string
  updatedAt: string
}

type WorkGlobal = {
  featuredProjects?: { id: string; title: string }[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('da-DK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: '40px 48px',
    fontFamily: 'var(--font-body)',
    color: 'var(--theme-text)',
    maxWidth: 960,
  },
  backButton: {
    display: 'inline-block',
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: '0.04em',
    color: 'var(--theme-text-secondary, #888)',
    background: 'none',
    border: 'none',
    padding: '0 0 24px 0',
    cursor: 'pointer',
    opacity: 0.5,
    transition: 'opacity 0.15s',
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
  section: {
    marginBottom: 48,
  },
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
    transition: 'opacity 0.15s',
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
}

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
          fetch('/api/profiles?limit=100&sort=-updatedAt'),
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

  const featuredCount = work?.featuredProjects?.length ?? 0

  return (
    <div style={styles.page}>
      <div className='test' style={{ padding: '0 0 32px 0' }}>
          <BackButton href="/admin" label="Dashboard" />
      </div>
      <p style={styles.heading}>Content</p>

      {/* Work – singleton */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <p style={styles.sectionTitle}>Work Page</p>
        </div>
        <div
          style={styles.singletonCard}
          onClick={() => router.push('/admin/globals/work')}
          onMouseEnter={e =>
            ((e.currentTarget as HTMLDivElement).style.background =
              'var(--theme-elevation-100, rgba(255,255,255,0.06))')
          }
          onMouseLeave={e =>
            ((e.currentTarget as HTMLDivElement).style.background =
              'var(--theme-elevation-50, rgba(255,255,255,0.03))')
          }
        >
          <div style={styles.singletonLeft}>
            <p style={styles.singletonTitle}>Work</p>
            <span style={styles.singletonMeta}>
              {loading ? '–' : `${featuredCount} featured project${featuredCount !== 1 ? 's' : ''}`}
            </span>
          </div>
          <span style={styles.editLink}>Rediger →</span>
        </div>
      </section>

      <hr style={styles.divider} />

      {/* Profiles */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <p style={styles.sectionTitle}>Profile Pages</p>
          <button
            style={styles.newButton}
            onClick={() => router.push('/admin/collections/profiles/create')}
          >
            + Ny profil
          </button>
        </div>
        {loading ? (
          <p style={styles.emptyState}>Henter...</p>
        ) : profiles.length === 0 ? (
          <p style={styles.emptyState}>Ingen profiler endnu</p>
        ) : (
          profiles.map(profile => (
            <div
              key={profile.id}
              style={styles.card}
              onClick={() => router.push(`/admin/collections/profiles/${profile.id}`)}
              onMouseEnter={e =>
                ((e.currentTarget as HTMLDivElement).style.background =
                  'var(--theme-elevation-100, rgba(255,255,255,0.06))')
              }
              onMouseLeave={e =>
                ((e.currentTarget as HTMLDivElement).style.background =
                  'var(--theme-elevation-50, rgba(255,255,255,0.03))')
              }
            >
              <div>
                <p style={styles.cardTitle}>{profile.name}</p>
                <p style={styles.cardMeta}>Opdateret {formatDate(profile.updatedAt)}</p>
              </div>
              <span style={styles.editLink}>Rediger →</span>
            </div>
          ))
        )}
      </section>

      <hr style={styles.divider} />

      {/* Projects */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <p style={styles.sectionTitle}>Project Pages ({loading ? '–' : projects.length})</p>
          <button
            style={styles.newButton}
            onClick={() => router.push('/admin/collections/projects/create')}
          >
            + Nyt projekt
          </button>
        </div>
        {loading ? (
          <p style={styles.emptyState}>Henter...</p>
        ) : projects.length === 0 ? (
          <p style={styles.emptyState}>Ingen projekter endnu</p>
        ) : (
          projects.map(project => (
            <div
              key={project.id}
              style={styles.card}
              onClick={() => router.push(`/admin/collections/projects/${project.id}`)}
              onMouseEnter={e =>
                ((e.currentTarget as HTMLDivElement).style.background =
                  'var(--theme-elevation-100, rgba(255,255,255,0.06))')
              }
              onMouseLeave={e =>
                ((e.currentTarget as HTMLDivElement).style.background =
                  'var(--theme-elevation-50, rgba(255,255,255,0.03))')
              }
            >
              <div>
                <p style={styles.cardTitle}>{project.title}</p>
                <p style={styles.cardMeta}>Opdateret {formatDate(project.updatedAt)}</p>
              </div>
              <span style={styles.editLink}>Rediger →</span>
            </div>
          ))
        )}
      </section>
    </div>
  )
}