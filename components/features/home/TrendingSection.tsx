'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { ManhwaCardPopupData } from '@/lib/db/manhwa'
import { getAnilistCover } from '@/lib/utils/anilist-image'
import { formatScore } from '@/lib/utils/formatScore'

interface Props {
  manhwas: ManhwaCardPopupData[]
  locale: string
}

// Fan carousel positions — 7 visible slots centred on index 3
const FAN_POSITIONS = [
  { x: -52, scale: 0.55, opacity: 0.25, zIndex: 1,  rotate: -18 },
  { x: -34, scale: 0.65, opacity: 0.40, zIndex: 2,  rotate: -12 },
  { x: -20, scale: 0.78, opacity: 0.60, zIndex: 3,  rotate:  -6 },
  { x:   0, scale: 1.00, opacity: 1.00, zIndex: 10, rotate:   0 }, // active
  { x:  20, scale: 0.78, opacity: 0.60, zIndex: 3,  rotate:   6 },
  { x:  34, scale: 0.65, opacity: 0.40, zIndex: 2,  rotate:  12 },
  { x:  52, scale: 0.55, opacity: 0.25, zIndex: 1,  rotate:  18 },
]

export function TrendingSection({ manhwas, locale }: Props) {
  const [active, setActive] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const count = manhwas.length

  const advance = useCallback(() => {
    setActive(prev => (prev + 1) % count)
  }, [count])

  const goTo = (idx: number) => setActive((idx + count) % count)

  useEffect(() => {
    if (isHovered) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(advance, 4500)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isHovered, advance])

  if (!manhwas.length) return null

  const current = manhwas[active]
  const title = locale === 'fr' ? (current.title_fr || current.title_en) : current.title_en
  const synopsis = locale === 'fr' ? (current.synopsis_fr || current.synopsis_en) : current.synopsis_en
  const score = current.display_score ?? current.ext_score_composite ?? current.score_avg
  const genres = current.genre_links.slice(0, 3)

  // Build 7-slot window
  const window7 = FAN_POSITIONS.map((_, i) => {
    const offset = i - 3
    return manhwas[(active + offset + count * 10) % count]
  })

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: 'var(--bg-void)', minHeight: '480px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Blurred background from active cover */}
      <div
        key={`bg-${active}`}
        className="absolute inset-0 transition-opacity duration-700"
        style={{ zIndex: 0 }}
        aria-hidden
      >
        {current.cover_url && (
          <Image
            src={getAnilistCover(current.cover_url, 'hero')}
            alt=""
            fill
            className="object-cover opacity-20 blur-2xl scale-110"
            sizes="100vw"
            priority
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, var(--bg-void) 0%, var(--bg-void) 15%, transparent 45%, var(--bg-void) 80%, var(--bg-void) 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, var(--bg-void) 92%)',
          }}
        />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Fan carousel */}
        <div
          className="flex items-end justify-center"
          style={{ height: '340px', paddingTop: '32px', position: 'relative' }}
        >
          {window7.map((manhwa, i) => {
            const pos = FAN_POSITIONS[i]
            const isCenter = i === 3
            const slotIndex = (active + (i - 3) + count * 10) % count

            return (
              <button
                key={`${slotIndex}-${i}`}
                onClick={() => goTo(slotIndex)}
                className="absolute"
                style={{
                  left: `calc(50% + ${pos.x}%)`,
                  transform: `translateX(-50%) scale(${pos.scale}) rotate(${pos.rotate}deg)`,
                  transformOrigin: 'bottom center',
                  zIndex: pos.zIndex,
                  opacity: pos.opacity,
                  transition: 'all 0.55s cubic-bezier(0.34, 1.2, 0.64, 1)',
                  cursor: isCenter ? 'default' : 'pointer',
                  bottom: 0,
                  width: '160px',
                  height: '240px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: isCenter
                    ? '0 24px 64px rgba(0,0,0,0.7), 0 0 0 2px var(--accent)'
                    : '0 8px 24px rgba(0,0,0,0.5)',
                  outline: 'none',
                }}
                tabIndex={isCenter ? -1 : 0}
                aria-label={isCenter ? undefined : `Go to ${locale === 'fr' ? (manhwa.title_fr || manhwa.title_en) : manhwa.title_en}`}
              >
                {manhwa.cover_url ? (
                  <Image
                    src={getAnilistCover(manhwa.cover_url, 'card')}
                    alt={locale === 'fr' ? (manhwa.title_fr || manhwa.title_en) : manhwa.title_en}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                ) : (
                  <div style={{ background: 'var(--bg-elevated)', width: '100%', height: '100%' }} />
                )}

                {/* Score badge on active */}
                {isCenter && score != null && (
                  <div
                    className="absolute top-2 left-2 flex items-center gap-1"
                    style={{
                      background: 'rgba(0,0,0,0.75)',
                      backdropFilter: 'blur(6px)',
                      borderRadius: '8px',
                      padding: '4px 8px',
                    }}
                  >
                    <span style={{ color: 'var(--star)', fontSize: '11px' }}>★</span>
                    <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>
                      {formatScore(score)}
                    </span>
                  </div>
                )}

                {/* Gradient overlay on active */}
                {isCenter && (
                  <div
                    className="absolute bottom-0 left-0 right-0"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                      borderBottomLeftRadius: '8px',
                      borderBottomRightRadius: '8px',
                      height: '64px',
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Info panel below carousel */}
        <div
          className="mx-auto px-4 pb-10 pt-5"
          style={{ maxWidth: '680px', textAlign: 'center' }}
        >
          {/* Genres */}
          <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
            {genres.map(gl => (
              <Link
                key={gl.genre.slug}
                href={`/${locale}/genre/${gl.genre.slug}`}
                className="text-xs px-3 py-1 rounded-full transition-colors"
                style={{
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                {locale === 'fr' ? gl.genre.name_fr : gl.genre.name_en}
              </Link>
            ))}
          </div>

          {/* Title */}
          <Link href={`/${locale}/manhwa/${current.slug}`}>
            <h2
              className="font-display mb-2 hover:opacity-80 transition-opacity"
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                color: 'var(--text-primary)',
                lineHeight: 1.15,
              }}
            >
              {title}
            </h2>
          </Link>

          {/* Synopsis */}
          {synopsis && (
            <p
              className="mx-auto mb-5"
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
                lineHeight: '1.6',
                maxWidth: '520px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {synopsis}
            </p>
          )}

          {/* CTA */}
          <Link
            href={`/${locale}/manhwa/${current.slug}`}
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-all hover:scale-105"
            style={{
              background: 'var(--accent)',
              color: 'var(--accent-text)',
            }}
          >
            {locale === 'fr' ? 'Voir la fiche →' : 'View title →'}
          </Link>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {manhwas.slice(0, 10).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
                style={{
                  width: i === active ? '20px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: i === active ? 'var(--accent)' : 'var(--border-strong)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
