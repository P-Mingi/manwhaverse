import { unstable_cache } from 'next/cache'
import { prisma } from './client'
import { manhwaCardSelect, type ManhwaCardData } from './manhwa'

export const getAllTropes = unstable_cache(
  async () => {
    return prisma.trope.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        category: true,
        _count: { select: { manhwa_links: true } },
      },
      orderBy: { manhwa_links: { _count: 'desc' } },
    })
  },
  ['all-tropes'],
  { revalidate: 3600, tags: ['tropes'] }
)

export async function getTropeBySlug(slug: string) {
  return prisma.trope.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description_en: true,
      description_fr: true,
      category: true,
      _count: { select: { manhwa_links: true } },
    },
  })
}

export async function getManhwasByTrope(
  tropeSlug: string,
  page = 1,
  limit = 24,
  sortBy: 'score' | 'popularity' | 'recent' = 'popularity',
): Promise<{ results: ManhwaCardData[]; total: number }> {
  const where = {
    is_published: true,
    deleted_at: null,
    trope_links: { some: { trope: { slug: tropeSlug } } },
  }

  const orderBy = (() => {
    switch (sortBy) {
      case 'score':
        return { ext_score_composite: 'desc' as const }
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
