import { ActivityRow } from '@/components/features/social/ActivityRow'
import type { ActivityWithRelations } from '@/lib/db/activity'

interface Props {
  activities: ActivityWithRelations[]
  locale: string
}

export function ActivityFeed({ activities, locale }: Props) {
  if (activities.length === 0) return null

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {locale === 'fr' ? 'Activité récente' : 'Recent Activity'}
      </h2>
      <div className="card" style={{ padding: '0.5rem' }}>
        {activities.map((activity) => (
          <ActivityRow key={activity.id} activity={activity} locale={locale} />
        ))}
      </div>
    </div>
  )
}
