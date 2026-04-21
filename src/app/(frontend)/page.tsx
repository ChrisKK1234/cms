import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <main
      style={{
        margin: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: '#0a0a0a',
        color: '#fff',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>
          Creative Barrow CMS
        </h1>
        <p style={{ color: '#666', marginBottom: '32px', fontSize: '14px' }}>
          {user ? `Logget ind som ${user.email}` : 'Indholdsstyring til creativebarrow.dk'}
        </p>
        <a
          href={payloadConfig.routes?.admin ?? '/admin'}
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: '#fff',
            color: '#000',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          Gå til admin panel
        </a>
      </div>
    </main>
  )
}
