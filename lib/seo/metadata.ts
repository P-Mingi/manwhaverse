import type { Metadata } from 'next'
import type { ManhwaWithRelations } from '@/lib/db/manhwa'
import { formatScore } from '@/lib/utils/formatScore'
import { getDisplayScore } from '@/lib/scoring/engine'

const BASE_URL = 'https://manhwaverse.com'

export function generateManhwaMetadata(
  manhwa: ManhwaWithRelations,
  locale: string
): Metadata {
  const title = locale === 'fr' ? (manhwa.title_fr ?? manhwa.title_en) : manhwa.title_en
  const synopsis = locale === 'fr'
    ? (manhwa.synopsis_fr ?? manhwa.synopsis_en)
    : manhwa.synopsis_en

  const { value: displayScoreValue } = getDisplayScore(manhwa)
  const scoreText = displayScoreValue ? `${formatScore(displayScoreValue)}/10` : ''

  const genres = manhwa.genre_links
    .map((g) => g.genre[locale === 'fr' ? 'name_fr' : 'name_en'])
    .slice(0, 3)
    .join(', ')

  const descriptionParts = [
    scoreText && `Score: ${scoreText}`,
    genres && genres,
    synopsis?.slice(0, 120),
  ].filter(Boolean)

  const description = descriptionParts.join(' · ') || `${title} on ManhwaVerse`

  const seoTitle = `${title} — Review, Score & Recommendations`

  return {
    title: seoTitle,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/manhwa/${manhwa.slug}`,
      languages: {
        en: `${BASE_URL}/en/manhwa/${manhwa.slug}`,
        fr: `${BASE_URL}/fr/manhwa/${manhwa.slug}`,
      },
    },
    openGraph: {
      title: seoTitle,
      description,
      type: 'book',
      url: `${BASE_URL}/${locale}/manhwa/${manhwa.slug}`,
      siteName: 'ManhwaVerse',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description,
    },
  }
}
