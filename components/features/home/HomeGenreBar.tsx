'use client'

import Link from 'next/link'

const GENRE_PILLS = [
  { emoji: '⚔️', label: 'Action', slug: 'action' },
  { emoji: '🔄', label: 'Regression', slug: 'regression' },
  { emoji: '💕', label: 'Romance', slug: 'romance' },
  { emoji: '🏯', label: 'Murim', slug: 'murim' },
  { emoji: '🎮', label: 'System', slug: 'system' },
  { emoji: '🌀', label: 'Isekai', slug: 'isekai' },
  { emoji: '👑', label: 'Villainess', slug: 'villainess' },
  { emoji: '✅', label: 'Completed', slug: null, queryParam: 'status=COMPLETED' },
  { emoji: '🗡️', label: 'Dark & Mature', slug: 'dark-and-mature' },
]

interface HomeGenreBarProps {
  locale: string
}

export function HomeGenreBar({ locale }: HomeGenreBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none px-4 py-3">
      {GENRE_PILLS.map((pill) => {
        const href = pill.slug
          ? `/${locale}/genre/${pill.slug}`
          : `/${locale}/explore?${pill.queryParam}`
        return (
          <Link
            key={pill.label}
            href={href}
            className="flex-none flex items-center gap-1.5 rounded-full border border-electric-border bg-card px-3 py-1.5 text-xs text-text-muted transition-all hover:border-electric hover:text-electric hover:bg-electric-glow"
          >
            <span>{pill.emoji}</span>
            <span className="whitespace-nowrap">{pill.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
