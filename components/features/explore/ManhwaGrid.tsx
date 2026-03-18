import { ManhwaCard } from '@/components/features/manhwa/ManhwaCard'
import type { ManhwaCardData } from '@/lib/db/manhwa'

interface Props {
  manhwas: ManhwaCardData[]
  locale: string
}

export function ManhwaGrid({ manhwas, locale }: Props) {
  if (manhwas.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)', fontSize: '14px' }}>
        {locale === 'fr' ? 'Aucun résultat.' : 'No results found.'}
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: '1rem',
      }}
    >
      {manhwas.map((manhwa, i) => (
        <ManhwaCard key={manhwa.id} manhwa={manhwa} locale={locale} priority={i < 4} />
      ))}
    </div>
  )
}
