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
  const days = Math.floor(hours / 24)
  return `${days}d`
}

function activityLabel(activity: ActivityWithContext, locale: string): string {
  const title = activity.manhwa
    ? (locale === 'fr' ? activity.manhwa.title_fr ?? activity.manhwa.title_en : activity.manhwa.title_en)
    : null
  switch (activity.type) {
    case 'RATED':         return title ? `rated ${title}` : 'rated a manhwa'
    case 'COMPLETED':     return title ? `completed ${title}` : 'completed a manhwa'
    case 'REVIEWED':      return title ? `reviewed ${title}` : 'wrote a review'
    case 'CREATED_LIST':  return 'created a list'
    default:              return title ? `added ${title}` : 'added to library'
  }
}

export async function HomeActivityFeed({ locale }: HomeActivityFeedProps) {
  let activities: ActivityWithContext[] = []
  try {
    const result = await getPublicFeed(1, 12)
    activities = result.activities
  } catch {
    return null
  }

  if (activities.length === 0) return null

  return (
    <div className="flex flex-col divide-y divide-electric-border">
      {activities.map((activity) => {
        const label = activityLabel(activity, locale)
        const username = activity.user.display_name ?? activity.user.username ?? '?'
        const score = activity.type === 'RATED' && activity.metadata
          ? (activity.metadata as Record<string, unknown>).score as number | undefined
          : undefined
        const profileHref = `/${locale}/profile/${activity.user.username}`

        return (
          <div key={activity.id} className="grid grid-cols-[36px_1fr_auto] items-start gap-3 py-3 px-1">
            {/* Avatar */}
            <Link href={profileHref} className="flex-shrink-0">
              {activity.user.avatar_url ? (
                <Image
                  src={activity.user.avatar_url}
                  alt={username ?? ''}
                  width={36}
                  height={36}
                  className="rounded-full object-cover ring-1 ring-electric-border"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-elevated flex items-center justify-center text-xs font-bold text-electric uppercase">
                  {username[0]}
                </div>
              )}
            </Link>

            {/* Text */}
            <div className="min-w-0">
              <p className="text-xs leading-snug text-text-secondary line-clamp-2">
                <Link href={profileHref} className="font-semibold text-text-primary hover:text-electric transition-colors">
                  {username}
                </Link>
                {' '}
                {activity.manhwa ? (
                  <>
                    {activity.type === 'RATED' ? 'rated ' : activity.type === 'COMPLETED' ? 'completed ' : activity.type === 'REVIEWED' ? 'reviewed ' : 'added '}
                    <Link href={`/${locale}/manhwa/${activity.manhwa.slug}`} className="text-electric hover:underline">
                      {locale === 'fr' ? activity.manhwa.title_fr ?? activity.manhwa.title_en : activity.manhwa.title_en}
                    </Link>
                  </>
                ) : label}
              </p>
            </div>

            {/* Time + score */}
            <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
              <span className="text-[10px] text-text-muted">{timeAgo(activity.created_at)}</span>
              {score != null && (
                <span className="font-mono text-[11px] font-bold text-gold">★{score.toFixed(1)}</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
