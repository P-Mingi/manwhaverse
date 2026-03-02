'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface FilterOption {
  slug: string
  name: string
}

interface HomeFilterBarProps {
  locale: string
  genres: FilterOption[]
  tropes: FilterOption[]
}

export function HomeFilterBar({ locale, genres, tropes }: HomeFilterBarProps) {
  const router = useRouter()
  const t = useTranslations('filter')
  const [query, setQuery] = useState('')

  function navigate(params: Record<string, string>) {
    const sp = new URLSearchParams(params)
    router.push(`/${locale}/search?${sp.toString()}`)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (q) navigate({ q })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search input */}
      <form onSubmit={handleSubmit} className="relative min-w-[200px] flex-1">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full rounded-lg border border-border bg-surface px-4 py-2 pl-9 text-sm text-text-primary placeholder:text-text-muted focus:border-crystal-blue focus:outline-none focus:ring-1 focus:ring-crystal-blue"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </form>

      {/* Genre dropdown */}
      <select
        onChange={(e) => {
          if (e.target.value) navigate({ genre: e.target.value })
        }}
        defaultValue=""
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-crystal-blue focus:outline-none"
      >
        <option value="" disabled>{t('allGenres')}</option>
        {genres.map((g) => (
          <option key={g.slug} value={g.slug}>{g.name}</option>
        ))}
      </select>

      {/* Trope dropdown */}
      <select
        onChange={(e) => {
          if (e.target.value) navigate({ trope: e.target.value })
        }}
        defaultValue=""
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-crystal-blue focus:outline-none"
      >
        <option value="" disabled>{t('allTropes')}</option>
        {tropes.map((tr) => (
          <option key={tr.slug} value={tr.slug}>{tr.name}</option>
        ))}
      </select>

      {/* Year dropdown */}
      <select
        onChange={(e) => {
          if (e.target.value) navigate({ year: e.target.value, sort: 'popularity' })
        }}
        defaultValue=""
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-crystal-blue focus:outline-none"
      >
        <option value="" disabled>{t('allYears')}</option>
        {Array.from({ length: 7 }, (_, i) => {
          const y = new Date().getFullYear() - i
          return <option key={y} value={y}>{y}</option>
        })}
      </select>
    </div>
  )
}
