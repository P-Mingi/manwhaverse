import { prisma } from './client'
import { manhwaCardWithPopupSelect, type ManhwaCardPopupData } from './manhwa'

const published = { is_published: true, deleted_at: null } as const

export async function getTrendingManhwas(locale: string, limit = 10): Promise<ManhwaCardPopupData[]> {
  const trendingField = locale === 'fr' ? 'trending_fr' : 'trending_en'
  return prisma.manhwa.findMany({
    where: published,
    select: manhwaCardWithPopupSelect,
    orderBy: [{ [trendingField]: 'desc' }, { reader_count: 'desc' }],
    take: limit,
  })
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

export async function getRecentManhwas(limit = 10): Promise<ManhwaCardPopupData[]> {
  return prisma.manhwa.findMany({
    where: published,
    select: manhwaCardWithPopupSelect,
    orderBy: { created_at: 'desc' },
    take: limit,
  })
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

export async function getHiddenGems(limit = 10): Promise<ManhwaCardPopupData[]> {
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

export async function getStats() {
  const [manhwaCount, genreCount, tropeCount] = await Promise.all([
    prisma.manhwa.count({ where: { is_published: true } }),
    prisma.genre.count(),
    prisma.trope.count(),
  ])

  return { manhwaCount, genreCount, tropeCount }
}
