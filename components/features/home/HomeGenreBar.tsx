'use client'

import Link from 'next/link'

const GENRE_PILLS = [
  { emoji: '🌟', label: 'All', slug: null, queryParam: null, isAll: true },
  { emoji: '⚔️', label: 'Action', slug: 'action' },
  { emoji: '💕', label: 'Romance', slug: 'romance' },
  { emoji: '🔄', label: 'Regression', slug: 'regression' },
  { emoji: '🌀', label: 'Isekai', slug: 'isekai' },
  { emoji: '🏯', label: 'Murim', slug: 'murim' },
  { emoji: '🎮', label: 'System', slug: 'system' },
  { emoji: '👑', label: 'Villainess', slug: 'villainess' },
  { emoji: '🎭', label: 'Fantasy', slug: 'fantasy' },
  { emoji: '🎬', label: 'Drama', slug: 'drama' },
  { emoji: '😂', label: 'Comedy', slug: 'comedy' },
  { emoji: '🧠', label: 'Psychological', slug: 'psychological' },
  { emoji: '🗡️', label: 'Dark & Mature', slug: 'dark-and-mature' },
  { emoji: '✅', label: 'Completed', slug: null, queryParam: 'status=COMPLETED' },
] as const

interface HomeGenreBarProps {
  locale: string
}

export function HomeGenreBar({ locale }: HomeGenreBarProps) {
  return (
    <div className="genres-scroll px-4 py-3">
      {GENRE_PILLS.map((pill) => {
        let href: string
        if ('isAll' in pill && pill.isAll) {
          href = `/${locale}/explore`
        } else if (pill.slug) {
          href = `/${locale}/genre/${pill.slug}`
        } else if ('queryParam' in pill && pill.queryParam) {
          href = `/${locale}/explore?${pill.queryParam}`
        } else {
          href = `/${locale}/explore`
        }
        return (
          <Link key={pill.label} href={href} className="genre-pill">
            <span>{pill.emoji}</span>
            {' '}
            <span>{pill.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
