import type { ManhwaWithRelations } from '@/lib/db/manhwa'
import { getDisplayScore } from '@/lib/scores/display'

const BASE_URL = 'https://manhwaverse.com'

export function generateManhwaJsonLd(
  manhwa: ManhwaWithRelations,
  locale: string
) {
  const title = locale === 'fr' ? (manhwa.title_fr ?? manhwa.title_en) : manhwa.title_en
  const { primaryScore } = getDisplayScore(manhwa)

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: title,
    url: `${BASE_URL}/${locale}/manhwa/${manhwa.slug}`,
    image: manhwa.cover_url,
    author: manhwa.creator_links
      .filter((c) => c.role === 'AUTHOR' || c.role === 'BOTH')
      .map((c) => ({
        '@type': 'Person',
        name: c.creator.name,
      })),
    genre: manhwa.genre_links.map((g) =>
      locale === 'fr' ? g.genre.name_fr : g.genre.name_en
    ),
    numberOfPages: manhwa.chapter_count,
    inLanguage: manhwa.origin_country === 'KR' ? 'ko' : 'zh',
  }

  if (primaryScore && manhwa.score_count > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: primaryScore,
      bestRating: 10,
      worstRating: 0,
      ratingCount: manhwa.score_count,
    }
  }

  return jsonLd
}

export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  }
}
