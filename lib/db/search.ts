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

interface SearchOptions {
  query: string
  page?: number
  limit?: number
  status?: string
  type?: string
  sortBy?: 'relevance' | 'score' | 'popularity' | 'recent'
}

export async function searchManhwas({
  query,
  page = 1,
  limit = 24,
  status,
  type,
  sortBy = 'relevance',
}: SearchOptions): Promise<{ results: ManhwaCardData[]; total: number }> {
  const where = {
    is_published: true,
    deleted_at: null,
    OR: [
      { title_en: { contains: query, mode: 'insensitive' as const } },
      { title_fr: { contains: query, mode: 'insensitive' as const } },
      { title_kr: { contains: query, mode: 'insensitive' as const } },
      { title_alt: { has: query } },
    ],
    ...(status ? { status: status as 'ONGOING' | 'COMPLETED' | 'HIATUS' | 'CANCELLED' } : {}),
    ...(type ? { type: type as 'MANHWA' | 'MANHUA' } : {}),
  }

  const orderBy = (() => {
    switch (sortBy) {
      case 'score':
        return { ext_score_composite: 'desc' as const }
      case 'popularity':
        return { reader_count: 'desc' as const }
      case 'recent':
        return { created_at: 'desc' as const }
      default:
        return { reader_count: 'desc' as const }
    }
  })()

  const [results, total] = await Promise.all([
    prisma.manhwa.findMany({
      where,
      select: cardSelect,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.manhwa.count({ where }),
  ])

  return { results, total }
}
