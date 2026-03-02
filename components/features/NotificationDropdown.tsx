'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { markNotificationReadAction, markAllNotificationsReadAction } from '@/lib/actions/notification'
import { NotificationItem } from './NotificationItem'
import type { NotificationRow } from '@/lib/db/notification'

interface NotificationDropdownProps {
  locale: string
  onClose: () => void
  onRead: () => void
}

export function NotificationDropdown({ locale, onClose, onRead }: NotificationDropdownProps) {
  const t = useTranslations('notifications')
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    fetch('/api/notifications?limit=20')
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data.notifications)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsReadAction()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      onRead()
    })
  }

  function handleMarkRead(id: string) {
    startTransition(async () => {
      await markNotificationReadAction(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      )
      onRead()
    })
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-elevated shadow-xl z-50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-text-primary">{t('title')}</h3>
        <button
          onClick={handleMarkAllRead}
          disabled={isPending}
          className="text-xs text-crystal-blue hover:underline disabled:opacity-50"
        >
          {t('markAllRead')}
        </button>
      </div>

      {/* Body */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-text-muted">{t('loading')}</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-text-muted">{t('empty')}</span>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              locale={locale}
              onMarkRead={() => handleMarkRead(n.id)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <Link
        href={`/${locale}/notifications`}
        onClick={onClose}
        className="block border-t border-border px-4 py-2.5 text-center text-xs font-medium text-crystal-blue hover:bg-surface transition-colors rounded-b-xl"
      >
        {t('viewAll')}
      </Link>
    </div>
  )
}
