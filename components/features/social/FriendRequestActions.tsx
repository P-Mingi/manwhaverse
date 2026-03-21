'use client'

import { useState, useTransition } from 'react'
import { acceptFriendRequestAction, declineFriendRequestAction } from '@/lib/actions/friendRequest'

interface Props {
  requestId: string
  locale: string
}

const strings = {
  en: { accept: 'Accept', decline: 'Decline', accepted: 'Accepted ✓', declined: 'Declined' },
  fr: { accept: 'Accepter', decline: 'Refuser', accepted: 'Accepté ✓', declined: 'Refusé' },
}

export function FriendRequestActions({ requestId, locale }: Props) {
  const lang = locale === 'fr' ? strings.fr : strings.en
  const [state, setState] = useState<'idle' | 'accepted' | 'declined'>('idle')
  const [isPending, startTransition] = useTransition()

  if (state === 'accepted') {
    return (
      <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', display: 'inline-block' }}>
        {lang.accepted}
      </span>
    )
  }
  if (state === 'declined') {
    return (
      <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', display: 'inline-block' }}>
        {lang.declined}
      </span>
    )
  }

  return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
      <button
        onClick={() => {
          setState('accepted')
          startTransition(async () => {
            await acceptFriendRequestAction(requestId)
          })
        }}
        disabled={isPending}
        style={{
          padding: '4px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 500,
          cursor: 'pointer',
          border: 'none',
          background: '#16a34a',
          color: '#fff',
          opacity: isPending ? 0.6 : 1,
        }}
      >
        {lang.accept}
      </button>
      <button
        onClick={() => {
          setState('declined')
          startTransition(async () => {
            await declineFriendRequestAction(requestId)
          })
        }}
        disabled={isPending}
        style={{
          padding: '4px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 500,
          cursor: 'pointer',
          border: 'none',
          background: 'var(--bg-elevated)',
          color: 'var(--text-secondary)',
          opacity: isPending ? 0.6 : 1,
        }}
      >
        {lang.decline}
      </button>
    </div>
  )
}
