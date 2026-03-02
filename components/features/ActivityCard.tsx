import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { ActivityWithContext } from '@/lib/db/activity'
import { getRelativeTime } from '@/lib/utils/time'

interface ActivityCardProps {
  activity: ActivityWithContext
  locale: string
}

export function ActivityCard({ activity, locale }: ActivityCardProps) {
  const t = useTranslations('feed')
  const user = activity.user
  const manhwa = activity.manhwa
  const title = manhwa
    ? locale === 'fr'
      ? manhwa.title_fr ?? manhwa.title_en
      : manhwa.title_en
    : null

  const metadata = activity.metadata as Record<string, unknown> | null

  function getActionText() {
    const titleLink = manhwa ? (
      <Link
        href={`/${locale}/manhwa/${manhwa.slug}`}
        className="font-medium text-text-primary hover:text-crystal-blue"
      >
        {title}
      </Link>
    ) : null

    switch (activity.type) {
      case 'STARTED_READING':
        return <>{t('startedReading')} {titleLink}</>
      case 'COMPLETED':
        return <>{t('completed')} {titleLink}</>
      case 'RATED':
        return (
          <>
            {t('rated')} {titleLink}{' '}
            {metadata?.score && (
              <span className="font-mono text-crystal-blue">
                {String(metadata.score)}/10
              </span>
            )}
          </>
        )
      case 'REVIEWED':
        return <>{t('reviewed')} {titleLink}</>
      case 'FAVORITED':
        return <>{t('favorited')} {titleLink}</>
      case 'ADDED_TO_LIBRARY':
        return <>{t('addedToLibrary')} {titleLink}</>
      default:
        return <>{t('addedToLibrary')} {titleLink}</>
    }
  }

  const timeAgo = getRelativeTime(activity.created_at, locale)

  return (
    <div className="flex items-start gap-3 rounded-lg bg-surface p-3">
      <Link
        href={`/${locale}/profile/${user.username}`}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-elevated text-xs text-text-muted"
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.username ?? ''}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          (user.username ?? '?').charAt(0).toUpperCase()
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-text-secondary">
          <Link
            href={`/${locale}/profile/${user.username}`}
            className="font-medium text-text-primary hover:text-crystal-blue"
          >
            {user.display_name ?? user.username}
          </Link>{' '}
          {getActionText()}
        </p>
        <p className="mt-0.5 text-xs text-text-muted">{timeAgo}</p>
      </div>
      {manhwa?.cover_url && (
        <Link href={`/${locale}/manhwa/${manhwa.slug}`} className="flex-shrink-0">
          <img
            src={manhwa.cover_url}
            alt={title ?? ''}
            className="h-12 w-8 rounded object-cover"
          />
        </Link>
      )}
    </div>
  )
}

