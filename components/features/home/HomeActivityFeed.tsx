import Image from 'next/image'
import Link from 'next/link'
import { getPublicFeed } from '@/lib/db/activity'
import type { ActivityWithContext } from '@/lib/db/activity'

interface HomeActivityFeedProps {
  locale: string
}

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000)
  if (secs < 60) return `${secs}s`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

function activityBadge(activity: ActivityWithContext): string {
  const score =
    activity.type === 'RATED' && activity.metadata
      ? (activity.metadata as Record<string, unknown>).score as number | undefined
      : undefined
  if (score != null) return `★ ${score.toFixed(1)}`
  switch (activity.type) {
    case 'COMPLETED':    return '★'
    case 'REVIEWED':     return '✍️'
    case 'CREATED_LIST': return '📋'
    default:             return '+📚'
  }
}

function activityVerb(type: string, locale: string): string {
  if (locale === 'fr') {
    switch (type) {
      case 'RATED':        return 'a noté'
      case 'COMPLETED':    return 'a terminé'
      case 'REVIEWED':     return 'a reviewé'
      case 'CREATED_LIST': return 'a créé une liste'
      default:             return 'a ajouté'
    }
  }
  switch (type) {
    case 'RATED':        return 'rated'
    case 'COMPLETED':    return 'completed'
    case 'REVIEWED':     return 'reviewed'
    case 'CREATED_LIST': return 'created a list'
    default:             return 'added'
  }
}

export async function HomeActivityFeed({ locale }: HomeActivityFeedProps) {
  let activities: ActivityWithContext[] = []
  try {
    const result = await getPublicFeed(1, 6)
    activities = result.activities
  } catch {
    return null
  }

  if (activities.length === 0) return null

  return (
    <div className="activity-feed">
      {activities.map((activity) => {
        const username = activity.user.display_name ?? activity.user.username ?? '?'
        const profileHref = `/${locale}/profile/${activity.user.username}`
        const badge = activityBadge(activity)
        const verb = activityVerb(activity.type, locale)
        const manhwaTitle = activity.manhwa
          ? (locale === 'fr' ? activity.manhwa.title_fr ?? activity.manhwa.title_en : activity.manhwa.title_en)
          : null

        return (
          <div key={activity.id} className="activity-item">
            {/* Avatar */}
            <Link href={profileHref} className="activity-avatar">
              {activity.user.avatar_url ? (
                <Image
                  src={activity.user.avatar_url}
                  alt={username}
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-electric uppercase">{username[0]}</span>
              )}
            </Link>

            {/* Text */}
            <div>
              <p className="activity-text">
                <Link href={profileHref} className="activity-username">{username}</Link>
                {' '}{verb}{' '}
                {activity.manhwa && manhwaTitle ? (
                  <Link href={`/${locale}/manhwa/${activity.manhwa.slug}`} className="activity-manhwa">
                    {manhwaTitle}
                  </Link>
                ) : null}
              </p>
              <p className="activity-time">{timeAgo(activity.created_at)}</p>
            </div>

            {/* Badge */}
            <span className="activity-score">{badge}</span>
          </div>
        )
      })}
    </div>
  )
}
