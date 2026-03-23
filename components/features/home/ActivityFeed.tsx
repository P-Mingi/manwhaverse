import Link from 'next/link'
import Image from 'next/image'
import type { ActivityWithContext } from '@/lib/db/activity'
import { getAnilistCover } from '@/lib/utils/anilist-image'
import { timeAgo } from '@/lib/utils/time'

interface Props {
  activities: ActivityWithContext[]
  locale: string
  maxItems?: number
}

// Group & deduplicate: keep only the latest RATED event per (user, manhwa) pair
function deduplicateActivities(activities: ActivityWithContext[]): ActivityWithContext[] {
  const seen = new Set<string>()
  const result: ActivityWithContext[] = []

  for (const activity of activities) {
    if (activity.type === 'RATED' && activity.manhwa_id) {
      const day = activity.created_at.toISOString().slice(0, 10)
      const key = `RATED-${activity.user_id}-${activity.manhwa_id}-${day}`
      if (seen.has(key)) continue
      seen.add(key)
    }

    if (
      (activity.type === 'STARTED_READING' || activity.type === 'ADDED_TO_LIBRARY') &&
      activity.manhwa_id
    ) {
      const key = `${activity.type}-${activity.user_id}-${activity.manhwa_id}`
      if (seen.has(key)) continue
      seen.add(key)
    }

    result.push(activity)
  }

  return result
}

function activityLabel(activity: ActivityWithContext, locale: string): string {
  const manhwaTitle = activity.manhwa
    ? (locale === 'fr' ? activity.manhwa.title_fr || activity.manhwa.title_en : activity.manhwa.title_en)
    : null

  const meta = activity.metadata as Record<string, unknown> | null
  const isFr = locale === 'fr'

  switch (activity.type) {
    case 'RATED':
      return isFr ? `a noté ${manhwaTitle ?? '—'} · ${meta?.score}/10` : `rated ${manhwaTitle ?? '—'} · ${meta?.score}/10`
    case 'COMPLETED':
      return isFr ? `a terminé ${manhwaTitle ?? '—'}` : `completed ${manhwaTitle ?? '—'}`
    case 'STARTED_READING':
      return isFr ? `a commencé ${manhwaTitle ?? '—'}` : `started reading ${manhwaTitle ?? '—'}`
    case 'ADDED_TO_LIBRARY':
      return isFr ? `a ajouté ${manhwaTitle ?? '—'}` : `added ${manhwaTitle ?? '—'}`
    case 'REVIEWED':
      return isFr ? `a écrit une review sur ${manhwaTitle ?? '—'}` : `reviewed ${manhwaTitle ?? '—'}`
    case 'FAVORITED':
      return isFr ? `a mis en favori ${manhwaTitle ?? '—'}` : `favorited ${manhwaTitle ?? '—'}`
    case 'FOLLOWED_USER':
      return isFr ? `suit un nouvel utilisateur` : `followed someone`
    case 'CREATED_LIST':
      return isFr ? `a créé une liste` : `created a list`
    default:
      return isFr ? `a interagi avec ${manhwaTitle ?? '—'}` : `interacted with ${manhwaTitle ?? '—'}`
  }
}

function activityIcon(type: string): string {
  switch (type) {
    case 'RATED':            return '★'
    case 'COMPLETED':        return '✓'
    case 'STARTED_READING':  return '▶'
    case 'ADDED_TO_LIBRARY': return '+'
    case 'REVIEWED':         return '✎'
    case 'FAVORITED':        return '♥'
    case 'FOLLOWED_USER':    return '→'
    case 'CREATED_LIST':     return '☰'
    default:                 return '·'
  }
}

function activityColor(type: string): string {
  switch (type) {
    case 'RATED':            return 'var(--star)'
    case 'COMPLETED':        return '#22c55e'
    case 'REVIEWED':         return 'var(--accent)'
    case 'FAVORITED':        return '#f43f5e'
    default:                 return 'var(--text-muted)'
  }
}

export function ActivityFeed({ activities, locale, maxItems = 8 }: Props) {
  const deduped = deduplicateActivities(activities).slice(0, maxItems)

  if (!deduped.length) {
    return (
      <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '16px 0' }}>
        {locale === 'fr' ? 'Aucune activité récente.' : 'No recent activity.'}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {deduped.map(activity => {
        const label = activityLabel(activity, locale)
        const icon = activityIcon(activity.type)
        const color = activityColor(activity.type)
        const user = activity.user
        const avatarUrl = user.avatar_url

        return (
          <div
            key={activity.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 10px',
              borderRadius: '8px',
              transition: 'background 0.15s',
            }}
            className="group hover:bg-[var(--bg-elevated)]"
          >
            {/* Icon pill */}
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--bg-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color,
                flexShrink: 0,
              }}
            >
              {icon}
            </div>

            {/* Avatar */}
            <Link href={`/${locale}/profile/${user.username}`} style={{ flexShrink: 0 }}>
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={user.username}
                  width={28}
                  height={28}
                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'var(--accent-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--accent)',
                  }}
                >
                  {(user.display_name || user.username).charAt(0).toUpperCase()}
                </div>
              )}
            </Link>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.4,
                }}
              >
                <Link
                  href={`/${locale}/profile/${user.username}`}
                  style={{ color: 'var(--text-primary)', fontWeight: 500 }}
                >
                  {user.display_name || user.username}
                </Link>
                {' '}
                <span>{label}</span>
              </p>
            </div>

            {/* Manhwa cover thumbnail */}
            {activity.manhwa?.cover_url && (
              <Link
                href={`/${locale}/manhwa/${activity.manhwa.slug}`}
                style={{ flexShrink: 0 }}
              >
                <Image
                  src={getAnilistCover(activity.manhwa.cover_url, 'thumb')}
                  alt=""
                  width={28}
                  height={40}
                  style={{ borderRadius: '4px', objectFit: 'cover' }}
                />
              </Link>
            )}

            {/* Time */}
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                flexShrink: 0,
                minWidth: '36px',
                textAlign: 'right',
              }}
            >
              {timeAgo(activity.created_at)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
