'use client'

import { useState } from 'react'
import { LibraryEntry } from './LibraryEntry'
import type { Prisma } from '@prisma/client'

type LibraryWithManhwa = Prisma.UserLibraryGetPayload<{
  include: {
    manhwa: {
      select: {
        slug: true
        title_en: true
        title_fr: true
        cover_url: true
        chapter_count: true
        display_score: true
        score_count: true
        genre_links: { include: { genre: { select: { name_en: true; name_fr: true } } }; take: 3 }
      }
    }
  }
}>

const STATUS_ORDER = ['READING', 'COMPLETED', 'PLAN_TO_READ', 'ON_HOLD', 'DROPPED', 'REREADING']

const STATUS_LABELS: Record<string, { fr: string; en: string }> = {
  ALL: { fr: 'Tout', en: 'All' },
  READING: { fr: 'En cours', en: 'Reading' },
  COMPLETED: { fr: 'Terminé', en: 'Completed' },
  PLAN_TO_READ: { fr: 'À lire', en: 'Plan to Read' },
  ON_HOLD: { fr: 'En pause', en: 'On Hold' },
  DROPPED: { fr: 'Abandonné', en: 'Dropped' },
  REREADING: { fr: 'Relecteur', en: 'Rereading' },
}

interface Props {
  library: LibraryWithManhwa[]
  locale: string
}

export function LibraryGrid({ library, locale }: Props) {
  const [filter, setFilter] = useState('ALL')
  const [sort, setSort] = useState<'title' | 'score' | 'updated'>('updated')

  const statuses = ['ALL', ...STATUS_ORDER.filter((s) => library.some((e) => e.status === s))]

  const filtered = library
    .filter((e) => filter === 'ALL' || e.status === filter)
    .sort((a, b) => {
      if (sort === 'title') {
        const ta = locale === 'fr' && a.manhwa.title_fr ? a.manhwa.title_fr : a.manhwa.title_en
        const tb = locale === 'fr' && b.manhwa.title_fr ? b.manhwa.title_fr : b.manhwa.title_en
        return ta.localeCompare(tb)
      }
      if (sort === 'score') return (b.score ?? 0) - (a.score ?? 0)
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })

  return (
    <div style={{ maxWidth: 1024, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: '0.375rem 0.75rem',
                fontSize: '12px',
                fontWeight: filter === s ? 700 : 500,
                background: filter === s ? 'var(--accent-muted)' : 'var(--bg-elevated)',
                color: filter === s ? 'var(--accent)' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              {STATUS_LABELS[s]?.[locale as 'fr' | 'en'] ?? s}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          style={{
            marginLeft: 'auto',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            borderRadius: 6,
            padding: '0.375rem 0.5rem',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          <option value="updated">{locale === 'fr' ? 'Récemment modifié' : 'Last updated'}</option>
          <option value="title">{locale === 'fr' ? 'Titre' : 'Title'}</option>
          <option value="score">{locale === 'fr' ? 'Score' : 'Score'}</option>
        </select>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        {filtered.length} {locale === 'fr' ? 'titres' : 'titles'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filtered.map((entry) => (
          <LibraryEntry key={entry.id} entry={entry} locale={locale} />
        ))}
      </div>
    </div>
  )
}
