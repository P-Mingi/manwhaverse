'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'

interface Genre {
  slug: string
  name_en: string
  name_fr: string
}

interface Props {
  genres: Genre[]
  locale: string
}

const TYPE_OPTS = [
  { value: '', label: { en: 'All types', fr: 'Tous les types' } },
  { value: 'MANHWA', label: { en: 'Manhwa', fr: 'Manhwa' } },
  { value: 'MANHUA', label: { en: 'Manhua', fr: 'Manhua' } },
]

const STATUS_OPTS = [
  { value: '', label: { en: 'All statuses', fr: 'Tous les statuts' } },
  { value: 'ONGOING', label: { en: 'Ongoing', fr: 'En cours' } },
  { value: 'COMPLETED', label: { en: 'Completed', fr: 'Terminé' } },
  { value: 'HIATUS', label: { en: 'Hiatus', fr: 'En pause' } },
]

const SORT_OPTS = [
  { value: 'popular', label: { en: 'Most popular', fr: 'Plus populaire' } },
  { value: 'score', label: { en: 'Highest score', fr: 'Meilleur score' } },
  { value: 'recent', label: { en: 'Most recent', fr: 'Plus récent' } },
  { value: 'chapters', label: { en: 'Most chapters', fr: 'Plus de chapitres' } },
]

const selectStyle = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  color: 'var(--text-secondary)',
  borderRadius: 6,
  padding: '0.5rem 0.625rem',
  fontSize: '12px',
  cursor: 'pointer',
  flex: '1 1 auto',
  minWidth: '120px',
}

export function FilterPanel({ genres, locale }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    startTransition(() => router.replace(`${pathname}?${params.toString()}`))
  }

  const l = locale as 'fr' | 'en'

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', opacity: isPending ? 0.7 : 1 }}>
      <select
        value={searchParams.get('type') ?? ''}
        onChange={(e) => update('type', e.target.value)}
        style={selectStyle}
      >
        {TYPE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label[l]}</option>)}
      </select>

      <select
        value={searchParams.get('status') ?? ''}
        onChange={(e) => update('status', e.target.value)}
        style={selectStyle}
      >
        {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label[l]}</option>)}
      </select>

      <select
        value={searchParams.get('genre') ?? ''}
        onChange={(e) => update('genre', e.target.value)}
        style={selectStyle}
      >
        <option value="">{locale === 'fr' ? 'Tous les genres' : 'All genres'}</option>
        <option value="__adult__">18+</option>
        {genres.map((g) => (
          <option key={g.slug} value={g.slug}>{locale === 'fr' ? g.name_fr : g.name_en}</option>
        ))}
      </select>

      <select
        value={searchParams.get('sort') ?? 'popular'}
        onChange={(e) => update('sort', e.target.value)}
        style={selectStyle}
      >
        {SORT_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label[l]}</option>)}
      </select>
    </div>
  )
}
