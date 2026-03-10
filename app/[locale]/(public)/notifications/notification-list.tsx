'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { markNotificationReadAction, markAllNotificationsReadAction } from '@/lib/actions/notification'
import { NotificationItem } from '@/components/features/NotificationItem'
import type { NotificationRow } from '@/lib/db/notification'

interface NotificationListProps {
  notifications: NotificationRow[]
  locale: string
  currentPage: number
  totalPages: number
}

export function NotificationList({
  notifications: initial,
  locale,
  currentPage,
  totalPages,
}: NotificationListProps) {
  const t = useTranslations('notifications')
  const [notifications, setNotifications] = useState(initial)
  const [isPending, startTransition] = useTransition()

  const hasUnread = notifications.some((n) => !n.read)

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsReadAction()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    })
  }

  function handleMarkRead(id: string) {
    startTransition(async () => {
      await markNotificationReadAction(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      )
    })
  }

  if (notifications.length === 0) {
    return (
      <p className="py-20 text-center text-sm text-text-muted">{t('empty')}</p>
    )
  }

  return (
    <>
      {hasUnread && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="text-sm text-crystal-blue hover:underline disabled:opacity-50"
          >
            {t('markAllRead')}
          </button>
        </div>
      )}

      <div className="divide-y divide-border rounded-lg border border-border bg-elevated overflow-hidden">
        {notifications.map((n) => (
          <NotificationItem
            key={n.id}
            notification={n}
            locale={locale}
            onMarkRead={() => handleMarkRead(n.id)}
          />
        ))}
      </div>

      {totalPages > 1 && (() => {
          const _ws = 10
          let _s = Math.max(1, currentPage - Math.floor(_ws / 2))
          let _e = _s + _ws - 1
          if (_e > totalPages) { _e = totalPages; _s = Math.max(1, _e - _ws + 1) }
          const _pages = Array.from({ length: _e - _s + 1 }, (_, i) => _s + i)
          return (
        <div className="mt-6 flex justify-center gap-2">
          {_pages.map((p) => (
              <a
                key={p}
                href={`/${locale}/notifications?page=${p}`}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  p === currentPage
                    ? 'bg-crystal-blue text-white'
                    : 'bg-elevated text-text-secondary hover:bg-border'
                }`}
              >
                {p}
              </a>
          ))}
        </div>
          )
      })()}
    </>
  )
}
