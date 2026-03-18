import { prisma } from './client'
import { manhwaCardSelect, type ManhwaCardData } from './manhwa'

interface SearchOptions {
  query?: string
  page?: number
  limit?: number
  status?: string
  type?: string
  genre?: string
  trope?: string
  year?: number
  sortBy?: 'relevance' | 'score' | 'popularity' | 'recent'
}

export async function searchManhwas({
  query,
  page = 1,
  limit = 24,
  status,
  type,
  genre,
  trope,
  year,
  sortBy = 'relevance',
}: SearchOptions): Promise<{ results: ManhwaCardData[]; total: number }> {
  const where = {
    is_published: true,
    deleted_at: null,
    ...(query
      ? {
          OR: [
            { title_en: { contains: query, mode: 'insensitive' as const } },
            { title_fr: { contains: query, mode: 'insensitive' as const } },
            { title_kr: { contains: query, mode: 'insensitive' as const } },
            { title_alt: { has: query } },
          ],
        }
      : {}),
    ...(status ? { status: status as 'ONGOING' | 'COMPLETED' | 'HIATUS' | 'CANCELLED' } : {}),
    ...(type ? { type: type as 'MANHWA' | 'MANHUA' } : {}),
    ...(genre === '__adult__'
      ? { content_rating: { in: ['R18', 'X'] } }
      : genre
      ? { genre_links: { some: { genre: { slug: genre } } } }
      : {}),
    ...(trope ? { trope_links: { some: { trope: { slug: trope } } } } : {}),
    ...(year ? { release_year: year } : {}),
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
      select: manhwaCardSelect,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.manhwa.count({ where }),
  ])

  return { results, total }
}
