'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'

interface Props {
  user: {
    username?: string | null
    display_name?: string | null
    avatar_url?: string | null
  }
  locale: string
}

export function AvatarDropdown({ user, locale }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((p) => !p)}
        aria-label="User menu"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
      >
        <Avatar src={user.avatar_url} username={user.username} size={32} />
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 199 }}
            onClick={() => setOpen(false)}
          />
          <div
            className="card"
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              zIndex: 200,
              minWidth: 180,
              padding: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)', marginBottom: '0.25rem' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {user.display_name ?? user.username}
              </div>
              {user.username && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{user.username}</div>
              )}
            </div>

            {[
              { href: `/${locale}/profile/${user.username}`, label: 'Profile' },
              { href: `/${locale}/library`, label: 'Library' },
              { href: `/${locale}/settings`, label: 'Settings' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                style={{
                  padding: '0.5rem 0.75rem',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  borderRadius: 6,
                  textDecoration: 'none',
                  display: 'block',
                }}
              >
                {label}
              </Link>
            ))}

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.25rem 0' }} />

            <button
              onClick={() => signOut({ redirectTo: `/${locale}` })}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem 0.75rem',
                fontSize: '13px',
                color: 'var(--danger)',
                borderRadius: 6,
                textAlign: 'left',
                width: '100%',
              }}
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
