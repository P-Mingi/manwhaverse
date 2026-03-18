import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import type { ActivityWithRelations } from '@/lib/db/activity'

interface Props {
  activity: ActivityWithRelations
  locale: string
}

const ACTION_LABELS: Record<string, { fr: string; en: string }> = {
  COMPLETED: { fr: 'a terminé', en: 'completed' },
  STARTED_READING: { fr: 'a commencé', en: 'started reading' },
  DROPPED: { fr: 'a abandonné', en: 'dropped' },
  ON_HOLD: { fr: 'a mis en pause', en: 'put on hold' },
  PLAN_TO_READ: { fr: 'veut lire', en: 'plans to read' },
  REREADING: { fr: 'relit', en: 'is rereading' },
  RATED: { fr: 'a noté', en: 'rated' },
  REVIEWED: { fr: 'a critiqué', en: 'reviewed' },
}

export function ActivityRow({ activity, locale }: Props) {
  const user = activity.user
  const manhwaTitle = activity.manhwa
    ? locale === 'fr' && activity.manhwa.title_fr
      ? activity.manhwa.title_fr
      : activity.manhwa.title_en
    : null
  const action = ACTION_LABELS[activity.type]?.[locale as 'fr' | 'en'] ?? activity.type.toLowerCase()
  const timeAgo = formatTimeAgo(activity.created_at, locale)
  const meta = activity.metadata as Record<string, unknown> | null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem' }}>
      <Link href={`/${locale}/profile/${user.username}`}>
        <Avatar src={user.avatar_url} username={user.username} size={28} />
      </Link>
      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', flex: 1, lineHeight: 1.4 }}>
        <Link href={`/${locale}/profile/${user.username}`} style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}>
          {user.display_name ?? user.username}
        </Link>
        {' '}{action}{' '}
        {activity.manhwa && manhwaTitle && (
          <Link href={`/${locale}/manhwa/${activity.manhwa.slug}`} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            {manhwaTitle}
          </Link>
        )}
        {typeof meta?.score === 'number' && ` · ${meta.score}/10`}
      </p>
      <span style={{ fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0 }}>{timeAgo}</span>
    </div>
  )
}

function formatTimeAgo(date: Date, locale: string): string {
  const now = Date.now()
  const diff = Math.floor((now - new Date(date).getTime()) / 1000)

  if (diff < 60) return locale === 'fr' ? 'à l\'instant' : 'just now'
  if (diff < 3600) {
    const m = Math.floor(diff / 60)
    return locale === 'fr' ? `il y a ${m}m` : `${m}m ago`
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600)
    return locale === 'fr' ? `il y a ${h}h` : `${h}h ago`
  }
  const d = Math.floor(diff / 86400)
  return locale === 'fr' ? `il y a ${d}j` : `${d}d ago`
}
