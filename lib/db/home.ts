import { unstable_cache } from 'next/cache'
import { prisma } from './client'
import { manhwaCardWithPopupSelect, type ManhwaCardPopupData } from './manhwa'

const published = { is_published: true, deleted_at: null } as const

export function getTrendingManhwas(locale: string, limit = 10): Promise<ManhwaCardPopupData[]> {
  return unstable_cache(
    async () => {
      const trendingField = locale === 'fr' ? 'trending_fr' : 'trending_en'
      return prisma.manhwa.findMany({
        where: published,
        select: manhwaCardWithPopupSelect,
        orderBy: [{ [trendingField]: 'desc' }, { reader_count: 'desc' }],
        take: limit,
      })
    },
    [`trending-manhwas-${locale}-${limit}`],
    { revalidate: 300, tags: ['trending'] }
  )()
}

export async function getPopularThisYear(limit = 10): Promise<ManhwaCardPopupData[]> {
  const currentYear = new Date().getFullYear()
  return prisma.manhwa.findMany({
    where: { ...published, release_year: currentYear },
    select: manhwaCardWithPopupSelect,
    orderBy: { reader_count: 'desc' },
    take: limit,
  })
}

export async function getTopRated(limit = 10): Promise<ManhwaCardPopupData[]> {
  return prisma.manhwa.findMany({
    where: {
      ...published,
      display_score: { not: null },
      display_score_confidence: { gte: 0.3 },
    },
    select: manhwaCardWithPopupSelect,
    orderBy: { display_score: 'desc' },
    take: limit,
  })
}

export function getRecentManhwas(limit = 10): Promise<ManhwaCardPopupData[]> {
  return unstable_cache(
    async () => {
      return prisma.manhwa.findMany({
        where: published,
        select: manhwaCardWithPopupSelect,
        orderBy: { created_at: 'desc' },
        take: limit,
      })
    },
    [`recent-manhwas-${limit}`],
    { revalidate: 300, tags: ['recent'] }
  )()
}

export async function getPopularManhwas(limit = 10): Promise<ManhwaCardPopupData[]> {
  return prisma.manhwa.findMany({
    where: { ...published, display_popularity: { gt: 0 } },
    select: manhwaCardWithPopupSelect,
    orderBy: { display_popularity: 'desc' },
    take: limit,
  })
}

export async function getTopRatedManhwas(limit = 10): Promise<ManhwaCardPopupData[]> {
  return prisma.manhwa.findMany({
    where: {
      ...published,
      display_score: { not: null },
    },
    select: manhwaCardWithPopupSelect,
    orderBy: [{ display_score: 'desc' }, { display_popularity: 'desc' }],
    take: limit,
  })
}

export function getHiddenGems(limit = 10): Promise<ManhwaCardPopupData[]> {
  return unstable_cache(
    async () => {
      return prisma.manhwa.findMany({
        where: {
          ...published,
          display_score: { gte: 7.5 },
          display_popularity: { lt: 1000 },
        },
        select: manhwaCardWithPopupSelect,
        orderBy: { display_score: 'desc' },
        take: limit,
      })
    },
    [`hidden-gems-${limit}`],
    { revalidate: 3600, tags: ['hidden-gems'] }
  )()
}

export async function getPopularTropes(limit = 8) {
  return prisma.trope.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
      _count: { select: { manhwa_links: true } },
    },
    orderBy: { manhwa_links: { _count: 'desc' } },
    take: limit,
  })
}

export const getStats = unstable_cache(
  async () => {
    const [manhwaCount, genreCount, tropeCount, userCount, reviewCount] = await Promise.all([
      prisma.manhwa.count({ where: { is_published: true } }),
      prisma.genre.count(),
      prisma.trope.count(),
      prisma.user.count({ where: { is_seed: false } }),
      prisma.review.count({ where: { deleted_at: null } }),
    ])
    return { manhwaCount, genreCount, tropeCount, userCount, reviewCount }
  },
  ['site-stats'],
  { revalidate: 3600, tags: ['stats'] }
)
