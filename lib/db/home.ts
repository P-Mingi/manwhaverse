import { prisma } from './client'
import type { ManhwaCardData } from './manhwa'

const cardSelect = {
  id: true,
  slug: true,
  title_en: true,
  title_fr: true,
  cover_url: true,
  type: true,
  status: true,
  score_avg: true,
  score_count: true,
  ext_score_composite: true,
  chapter_count: true,
  reader_count: true,
  genre_links: {
    include: { genre: { select: { slug: true, name_en: true, name_fr: true } } },
    take: 3,
  },
} as const

export async function getTopManhwas(limit = 10): Promise<ManhwaCardData[]> {
  return prisma.manhwa.findMany({
    where: { is_published: true, deleted_at: null },
    select: cardSelect,
    orderBy: [{ trending_score: 'desc' }, { reader_count: 'desc' }],
    take: limit,
  })
}

export async function getPopularManhwas(limit = 12): Promise<ManhwaCardData[]> {
  return prisma.manhwa.findMany({
    where: { is_published: true, deleted_at: null },
    select: cardSelect,
    orderBy: { reader_count: 'desc' },
    take: limit,
  })
}

export async function getRecentManhwas(limit = 12): Promise<ManhwaCardData[]> {
  return prisma.manhwa.findMany({
    where: { is_published: true, deleted_at: null },
    select: cardSelect,
    orderBy: { created_at: 'desc' },
    take: limit,
  })
}

export async function getHighRatedManhwas(limit = 12): Promise<ManhwaCardData[]> {
  return prisma.manhwa.findMany({
    where: {
      is_published: true,
      deleted_at: null,
      ext_score_composite: { not: null },
    },
    select: cardSelect,
    orderBy: { ext_score_composite: 'desc' },
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
