import { ActivityRow } from '@/components/features/social/ActivityRow'
import type { ActivityWithRelations } from '@/lib/db/activity'

interface Props {
  activities: ActivityWithRelations[]
  locale: string
}

export function ProfileActivity({ activities, locale }: Props) {
  if (activities.length === 0) {
    return (
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
        {locale === 'fr' ? 'Aucune activité récente.' : 'No recent activity.'}
      </p>
    )
  }

  return (
    <div className="card" style={{ padding: '0.5rem' }}>
      {activities.map((activity) => (
        <ActivityRow key={activity.id} activity={activity} locale={locale} />
      ))}
    </div>
  )
}
