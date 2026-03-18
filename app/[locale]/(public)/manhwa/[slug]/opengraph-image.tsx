import { ImageResponse } from 'next/og'
import { getManhwaBySlug } from '@/lib/db/manhwa'
import { getDisplayScore } from '@/lib/scoring/engine'
import { formatScore } from '@/lib/utils/formatScore'

export const alt = 'ManhwaVerse'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const manhwa = await getManhwaBySlug(slug)

  if (!manhwa) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a0a0f',
            color: '#ffffff',
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          ManhwaVerse
        </div>
      ),
      size,
    )
  }

  const title = locale === 'fr' ? (manhwa.title_fr ?? manhwa.title_en) : manhwa.title_en
  const { value: primaryScore } = getDisplayScore(manhwa)
  const genres = manhwa.genre_links
    .slice(0, 3)
    .map((g) => (locale === 'fr' ? g.genre.name_fr : g.genre.name_en))
  const status = manhwa.status

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #0a0a0f 0%, #141420 50%, #0a0a0f 100%)',
          padding: 48,
          gap: 48,
        }}
      >
        {/* Cover */}
        {manhwa.cover_url && (
          <div
            style={{
              display: 'flex',
              flexShrink: 0,
              width: 340,
              height: 534,
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={manhwa.cover_url}
              alt={title}
              width={340}
              height={534}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </div>
        )}

        {/* Info */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            gap: 20,
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: '#ffffff',
              lineClamp: 3,
              overflow: 'hidden',
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>

          {/* Score + Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {primaryScore && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  padding: '8px 16px',
                }}
              >
                <span style={{ fontSize: 28, color: '#f5c518', fontWeight: 700 }}>
                  {formatScore(primaryScore)}
                </span>
                <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)' }}>/10</span>
              </div>
            )}
            <div
              style={{
                fontSize: 18,
                color: 'rgba(255,255,255,0.6)',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 12,
                padding: '8px 16px',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              {status}
            </div>
          </div>

          {/* Genres */}
          {genres.length > 0 && (
            <div style={{ display: 'flex', gap: 10 }}>
              {genres.map((genre) => (
                <div
                  key={genre}
                  style={{
                    fontSize: 16,
                    color: 'rgba(255,255,255,0.7)',
                    background: 'rgba(99,145,255,0.15)',
                    border: '1px solid rgba(99,145,255,0.3)',
                    borderRadius: 20,
                    padding: '6px 16px',
                  }}
                >
                  {genre}
                </div>
              ))}
            </div>
          )}

          {/* Branding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginTop: 'auto',
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: 2,
              }}
            >
              MANHWAVERSE
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  )
}
