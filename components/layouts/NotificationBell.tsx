'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NotificationBell({ locale }: { locale: string }) {
  const [unread, setUnread] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/notifications/unread-count')
      .then((r) => r.json())
      .then((d) => setUnread(d.count ?? 0))
      .catch(() => {})
  }, [pathname])

  return (
    <Link
      href={`/${locale}/notifications`}
      aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
      style={{ position: 'relative', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
    >
      <span style={{ fontSize: '18px' }}>🔔</span>
      {unread > 0 && (
        <span
          style={{
            position: 'absolute',
            top: -4,
            right: -6,
            background: 'var(--danger)',
            color: '#fff',
            fontSize: '9px',
            fontWeight: 700,
            padding: '1px 4px',
            borderRadius: 10,
            lineHeight: 1.4,
            minWidth: 14,
            textAlign: 'center',
          }}
        >
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </Link>
  )
}
