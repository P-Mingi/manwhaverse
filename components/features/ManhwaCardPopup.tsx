'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import type { ManhwaCardPopupData } from '@/lib/db/manhwa'
import { getRankFromScore } from '@/lib/scores/ranks'
import { RankBadge } from '@/components/features/RankBadge'
import { formatScore } from '@/lib/utils/formatScore'

interface ManhwaCardPopupProps {
  manhwa: ManhwaCardPopupData
  locale: string
  children: React.ReactNode
}

export function ManhwaCardPopup({ manhwa, locale, children }: ManhwaCardPopupProps) {
  const [visible, setVisible] = useState(false)
  const [side, setSide] = useState<'right' | 'left'>('right')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasHover, setHasHover] = useState(false)
  const t = useTranslations('manhwa')

  useEffect(() => {
    setHasHover(window.matchMedia('(hover: hover)').matches)
  }, [])

  const handleMouseEnter = useCallback(() => {
    if (!hasHover) return
    timeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        setSide(rect.left + rect.width + 320 > viewportWidth ? 'left' : 'right')
      }
      setVisible(true)
    }, 100)
  }, [hasHover])

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setVisible(false)
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const title = locale === 'fr' ? (manhwa.title_fr ?? manhwa.title_en) : manhwa.title_en
  const synopsis = locale === 'fr' ? (manhwa.synopsis_fr ?? manhwa.synopsis_en) : manhwa.synopsis_en
  const displayScore = manhwa.display_score
  const rank = getRankFromScore(displayScore, manhwa.score_count)
  const genres = manhwa.genre_links.map((gl) =>
    locale === 'fr' ? gl.genre.name_fr : gl.genre.name_en
  )

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {visible && (
        <div
          className={`absolute top-0 z-50 w-72 rounded-xl border border-border bg-surface p-4 shadow-xl transition-opacity duration-150 ${
            side === 'right' ? 'left-full ml-2' : 'right-full mr-2'
          }`}
        >
          {/* Title */}
          <h4 className="mb-2 line-clamp-2 text-sm font-bold text-text-primary">{title}</h4>

          {/* Status + Chapters + Year */}
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded bg-elevated px-1.5 py-0.5 text-[10px] font-medium text-text-secondary">
              {t(`status.${manhwa.status}`)}
            </span>
            {manhwa.chapter_count != null && manhwa.chapter_count > 0 && (
              <span className="text-[10px] text-text-muted">
                {manhwa.chapter_count} ch.
              </span>
            )}
            {manhwa.release_year && (
              <span className="text-[10px] text-text-muted">
                {manhwa.release_year}{manhwa.end_year ? `–${manhwa.end_year}` : ''}
              </span>
            )}
          </div>

          {/* Score + Rank */}
          {displayScore && (
            <div className="mb-2 flex items-center gap-1.5">
              <span className="text-sm text-yellow-400">★</span>
              <span className="font-mono text-sm font-bold text-text-primary">
                {formatScore(displayScore)}
              </span>
              {rank && <RankBadge rank={rank} compact />}
              <span className="text-[10px] text-text-muted">
                ({manhwa.score_count})
              </span>
            </div>
          )}

          {/* Genres */}
          {genres.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {genres.map((g) => (
                <span key={g} className="rounded-full bg-crystal-blue/10 px-2 py-0.5 text-[10px] font-medium text-crystal-blue">
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Synopsis */}
          {synopsis && (
            <p className="mb-2 line-clamp-3 text-xs leading-relaxed text-text-secondary">
              {synopsis}
            </p>
          )}

          {/* Tropes */}
          {manhwa.trope_links.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {manhwa.trope_links.map((tl) => (
                <span key={tl.trope.slug} className="rounded-full bg-elevated px-2 py-0.5 text-[10px] text-text-muted">
                  {tl.trope.name}
                </span>
              ))}
            </div>
          )}

          {/* Readers */}
          {manhwa.reader_count > 0 && (
            <div className="text-[10px] text-text-muted">
              {manhwa.reader_count.toLocaleString()} readers
            </div>
          )}
        </div>
      )}
    </div>
  )
}
