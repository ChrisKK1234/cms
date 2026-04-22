'use client'

import React from 'react'
import { DefaultEditView } from '@payloadcms/ui'
import { BackButton } from '@/components/BackButton'
import { SaveButton } from '@/components/SaveButton'

export function NavEditView(props: any) {
  return (
    <div>
      <style>{`
        .doc-header__title,
        .doc-header .render-title {
          display: none !important;
        }
        .doc-controls,
        [class*="doc-controls"] {
          display: none !important;
        }
        .doc-header__actions .popup,
        .doc-header__actions .popup-button,
        button[aria-label="Open document controls"],
        [class*="kebab"] {
          display: none !important;
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '32px 32px 0',
        }}
      >
        <BackButton href="/admin/content" label="Content" />
        <SaveButton />
      </div>

      <DefaultEditView {...props} />
    </div>
  )
}