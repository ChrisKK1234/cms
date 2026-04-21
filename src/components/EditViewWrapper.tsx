'use client'

import React from 'react'
import { DefaultEditView } from '@payloadcms/ui'
import { BackButton } from '@/components/BackButton'
import { SaveButton } from '@/components/SaveButton'
import { DeleteAction } from '@/components/DeleteAction'

type Props = {
  backHref: string
  backLabel: string
  collectionSlug?: string
  payloadProps: any
}

export function EditViewWrapper({ backHref, backLabel, collectionSlug, payloadProps }: Props) {
  return (
    <div>
      <style>{`
        /* Hide native title */
        .doc-header__title,
        .doc-header .render-title {
          display: none !important;
        }

        /* Hide entire doc-controls bar (save, timestamps, kebab) */
        .doc-controls,
        [class*="doc-controls"] {
          display: none !important;
        }

        /* Hide kebab popup as fallback */
        .doc-header__actions .popup,
        .doc-header__actions .popup-button,
        button[aria-label="Open document controls"],
        [class*="kebab"] {
          display: none !important;
        }
      `}</style>

      {/* Top bar: back | save + delete */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '32px 60px 0',
        }}
      >
        <BackButton href={backHref} label={backLabel} />
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <SaveButton />
          {collectionSlug && (
            <DeleteAction
              collectionSlug={collectionSlug}
              backHref={backHref}
              backLabel={backLabel}
            />
          )}
        </div>
      </div>

      <DefaultEditView {...payloadProps} />
    </div>
  )
}