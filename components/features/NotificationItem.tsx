'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { getRelativeTime } from '@/lib/utils/time'
import type { NotificationRow } from '@/lib/db/notification'

interface NotificationItemProps {
  notification: NotificationRow
  locale: string
  onMarkRead: () => void
}

export function NotificationItem({ notification, locale, onMarkRead }: NotificationItemProps) {
  const t = useTranslations('notifications')
  const data = notification.data as Record<string, unknown>
  const isUnread = !notification.read

  function getContent() {
    switch (notification.type) {
      case 'new_follower':
        return {
          avatar: data.follower_avatar_url as string | null,
          href: `/${locale}/profile/${data.follower_username}`,
          message: t('newFollower', {
            name: (data.follower_display_name || data.follower_username || 'Someone') as string,
          }),
        }
      case 'review_liked':
        return {
          avatar: null,
          href: `/${locale}/manhwa/${data.manhwa_slug}`,
          message: t('reviewLiked', {
            name: (data.liker_display_name || data.liker_username || 'Someone') as string,
            title: data.manhwa_title as string,
          }),
        }
      case 'new_chapter':
        return {
          avatar: null,
          href: `/${locale}/manhwa/${data.manhwa_slug}`,
          message: t('newChapter', {
            title: data.manhwa_title as string,
            chapter: data.chapter_number as number,
          }),
        }
      default:
        return { avatar: null, href: '#', message: '' }
    }
  }

  const { avatar, href, message } = getContent()
  const timeAgo = getRelativeTime(new Date(notification.created_at), locale)

  return (
    <Link
      href={href}
      onClick={isUnread ? onMarkRead : undefined}
      className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface ${
        isUnread ? 'bg-crystal-blue/5' : ''
      }`}
    >
      {/* Avatar / Icon */}
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-elevated text-xs text-text-muted overflow-hidden">
        {avatar ? (
          <img src={avatar} alt="" className="h-full w-full rounded-full object-cover" />
        ) : (
          <NotifTypeIcon type={notification.type} />
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="text-sm text-text-secondary">{message}</p>
        <p className="mt-0.5 text-xs text-text-muted">{timeAgo}</p>
      </div>

      {/* Unread dot */}
      {isUnread && (
        <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-crystal-blue" />
      )}
    </Link>
  )
}

function NotifTypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'new_follower':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
      )
    case 'review_liked':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      )
    case 'new_chapter':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
      )
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
      )
  }
}
