const STATUS_LABELS: Record<string, { fr: string; en: string }> = {
  READING: { fr: 'En cours', en: 'Reading' },
  COMPLETED: { fr: 'Terminé', en: 'Completed' },
  PLAN_TO_READ: { fr: 'À lire', en: 'Plan to Read' },
  ON_HOLD: { fr: 'En pause', en: 'On Hold' },
  DROPPED: { fr: 'Abandonné', en: 'Dropped' },
  REREADING: { fr: 'Relecteur', en: 'Rereading' },
}

interface Props {
  stats: Record<string, number>
  locale: string
}

export function ProfileLibraryStats({ stats, locale }: Props) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {Object.entries(stats).map(([status, count]) => {
        if (count === 0) return null
        return (
          <div
            key={status}
            className="card"
            style={{ padding: '0.75rem 1rem', textAlign: 'center', minWidth: 80 }}
          >
            <p style={{ margin: '0 0 2px', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{count}</p>
            <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {STATUS_LABELS[status]?.[locale as 'fr' | 'en'] ?? status}
            </p>
          </div>
        )
      })}
    </div>
  )
}
