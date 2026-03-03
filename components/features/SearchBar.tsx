'use client'

import { useRouter } from 'next/navigation'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'

interface FilterOption {
  slug: string
  name: string
}

interface SearchBarProps {
  defaultValue: string
  locale: string
  basePath?: string
  currentStatus?: string
  currentType?: string
  currentSort?: string
  currentGenre?: string
  currentTrope?: string
  currentYear?: string
  genres?: FilterOption[]
  tropes?: FilterOption[]
}

const STATUSES = ['ONGOING', 'COMPLETED', 'HIATUS', 'CANCELLED'] as const
const TYPES = ['MANHWA', 'MANHUA'] as const
const SORTS = ['relevance', 'score', 'popularity', 'recent'] as const
const YEARS = Array.from({ length: 7 }, (_, i) => String(new Date().getFullYear() - i))

export function SearchBar({
  defaultValue,
  locale,
  basePath = 'search',
  currentStatus,
  currentType,
  currentSort,
  currentGenre,
  currentTrope,
  currentYear,
  genres = [],
  tropes = [],
}: SearchBarProps) {
  const router = useRouter()
  const t = useTranslations('search')
  const tStatus = useTranslations('manhwa.status')
  const tFilter = useTranslations('filter')
  const [value, setValue] = useState(defaultValue)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams()
    const q = 'q' in overrides ? overrides.q : value.trim()
    if (q) params.set('q', q)

    const status = 'status' in overrides ? overrides.status : currentStatus
    if (status) params.set('status', status)

    const type = 'type' in overrides ? overrides.type : currentType
    if (type) params.set('type', type)

    const genre = 'genre' in overrides ? overrides.genre : currentGenre
    if (genre) params.set('genre', genre)

    const trope = 'trope' in overrides ? overrides.trope : currentTrope
    if (trope) params.set('trope', trope)

    const year = 'year' in overrides ? overrides.year : currentYear
    if (year) params.set('year', year)

    const sort = 'sort' in overrides ? overrides.sort : currentSort
    if (sort && sort !== 'relevance') params.set('sort', sort)

    const qs = params.toString()
    return `/${locale}/${basePath}${qs ? `?${qs}` : ''}`
  }

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      router.push(buildUrl({ q: value.trim() }))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, locale, router, currentStatus, currentType, currentSort, currentGenre, currentTrope, currentYear],
  )

  function handleFilter(key: string, val: string | undefined) {
    router.push(buildUrl({ [key]: val }))
  }

  return (
    <div className="space-y-3">
      {/* Search input */}
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="search"
          value={value}
          onChange={(e) => {
            const v = e.target.value
            setValue(v)
            if (debounceRef.current) clearTimeout(debounceRef.current)
            debounceRef.current = setTimeout(() => {
              router.push(buildUrl({ q: v.trim() || undefined }))
            }, 300)
          }}
          placeholder={t('placeholder')}
          className="w-full rounded-lg border border-[rgba(0,255,255,0.12)] bg-[#0d0d16] px-4 py-3 pl-10 text-sm text-[#e8e8f0] placeholder:text-[#6b6b88] focus:border-[rgba(0,255,255,0.4)] focus:outline-none focus:ring-1 focus:ring-[rgba(0,255,255,0.2)]"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00ffff]"
          width="16"
          height="16"
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

      {/* Filter rows */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {/* Status */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip
            active={!currentStatus}
            onClick={() => handleFilter('status', undefined)}
          >
            {t('all')}
          </Chip>
          {STATUSES.map((s) => (
            <Chip
              key={s}
              active={currentStatus === s}
              onClick={() =>
                handleFilter('status', currentStatus === s ? undefined : s)
              }
            >
              {tStatus(s)}
            </Chip>
          ))}
        </div>

        <span className="hidden text-border sm:inline">|</span>

        {/* Type */}
        <div className="flex items-center gap-1.5">
          <Chip
            active={!currentType}
            onClick={() => handleFilter('type', undefined)}
          >
            {t('all')}
          </Chip>
          {TYPES.map((tp) => (
            <Chip
              key={tp}
              active={currentType === tp}
              onClick={() =>
                handleFilter('type', currentType === tp ? undefined : tp)
              }
            >
              {t(`type${tp.charAt(0)}${tp.slice(1).toLowerCase()}` as 'typeManhwa' | 'typeManhua')}
            </Chip>
          ))}
        </div>

        <span className="hidden text-border sm:inline">|</span>

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          {SORTS.map((s) => (
            <Chip
              key={s}
              active={(currentSort ?? 'relevance') === s}
              onClick={() => handleFilter('sort', s)}
            >
              {t(`sort${s.charAt(0).toUpperCase()}${s.slice(1)}` as 'sortRelevance' | 'sortScore' | 'sortPopularity' | 'sortRecent')}
            </Chip>
          ))}
        </div>
      </div>

      {/* Dropdowns row */}
      {(genres.length > 0 || tropes.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {/* Genre dropdown */}
          {genres.length > 0 && (
            <select
              value={currentGenre ?? ''}
              onChange={(e) => handleFilter('genre', e.target.value || undefined)}
              className="rounded-lg border border-[rgba(0,255,255,0.12)] bg-[#0d0d16] px-3 py-1.5 text-xs text-[#e8e8f0] focus:border-[rgba(0,255,255,0.4)] focus:outline-none"
            >
              <option value="">{tFilter('allGenres')}</option>
              {genres.map((g) => (
                <option key={g.slug} value={g.slug}>{g.name}</option>
              ))}
            </select>
          )}

          {/* Trope dropdown */}
          {tropes.length > 0 && (
            <select
              value={currentTrope ?? ''}
              onChange={(e) => handleFilter('trope', e.target.value || undefined)}
              className="rounded-lg border border-[rgba(0,255,255,0.12)] bg-[#0d0d16] px-3 py-1.5 text-xs text-[#e8e8f0] focus:border-[rgba(0,255,255,0.4)] focus:outline-none"
            >
              <option value="">{tFilter('allTropes')}</option>
              {tropes.map((tr) => (
                <option key={tr.slug} value={tr.slug}>{tr.name}</option>
              ))}
            </select>
          )}

          {/* Year dropdown */}
          <select
            value={currentYear ?? ''}
            onChange={(e) => handleFilter('year', e.target.value || undefined)}
            className="rounded-lg border border-[rgba(0,255,255,0.12)] bg-[#0d0d16] px-3 py-1.5 text-xs text-[#e8e8f0] focus:border-[rgba(0,255,255,0.4)] focus:outline-none"
          >
            <option value="">{tFilter('allYears')}</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? 'bg-[rgba(0,255,255,0.08)] border border-[rgba(0,255,255,0.2)] text-[#00ffff]'
          : 'border border-white/10 bg-white/[0.03] text-[#9999b8] hover:bg-[rgba(0,255,255,0.08)] hover:border-[rgba(0,255,255,0.3)] hover:text-[#00ffff]'
      }`}
    >
      {children}
    </button>
  )
}
