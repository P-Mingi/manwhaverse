import type { ManhwaWithRelations } from '@/lib/db/manhwa'
import { getDisplayScore } from '@/lib/scoring/engine'

const BASE_URL = 'https://manhwaverse.com'

export function generateManhwaJsonLd(
  manhwa: ManhwaWithRelations,
  locale: string
) {
  const title = locale === 'fr' ? (manhwa.title_fr ?? manhwa.title_en) : manhwa.title_en
  const { value: displayScoreValue } = getDisplayScore(manhwa)

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

  if (displayScoreValue && manhwa.score_count > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: displayScoreValue,
      bestRating: 10,
      worstRating: 0,
      ratingCount: manhwa.score_count,
    }
  }

  return jsonLd
}

export function generateNewsArticleJsonLd(
  article: {
    slug: string
    title_en: string
    title_fr: string | null
    excerpt_en: string | null
    excerpt_fr: string | null
    cover_image_url: string | null
    author_name: string | null
    published_at: Date | null
    created_at: Date
  },
  locale: string
) {
  const title = locale === 'fr' && article.title_fr ? article.title_fr : article.title_en
  const description =
    locale === 'fr' && article.excerpt_fr ? article.excerpt_fr : article.excerpt_en

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description: description ?? undefined,
    image: article.cover_image_url ?? undefined,
    url: `${BASE_URL}/${locale}/news/${article.slug}`,
    datePublished: article.published_at?.toISOString() ?? article.created_at.toISOString(),
    dateModified: article.created_at.toISOString(),
    author: article.author_name
      ? { '@type': 'Person', name: article.author_name }
      : { '@type': 'Organization', name: 'ManhwaVerse' },
    publisher: {
      '@type': 'Organization',
      name: 'ManhwaVerse',
      url: BASE_URL,
    },
  }
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
