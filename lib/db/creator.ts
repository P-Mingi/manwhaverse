import { prisma } from './client'
import { manhwaCardSelect, type ManhwaCardData } from './manhwa'

export async function getAllCreators(
  page = 1,
  limit = 24,
  role?: 'AUTHOR' | 'ILLUSTRATOR' | 'BOTH',
  sortBy: 'readers' | 'alpha' = 'readers',
): Promise<{ creators: CreatorListItem[]; total: number }> {
  const where = role
    ? { works: { some: { role } } }
    : {}

  const orderBy =
    sortBy === 'alpha'
      ? { name: 'asc' as const }
      : { total_readers: 'desc' as const }

  const [creators, total] = await Promise.all([
    prisma.creator.findMany({
      where,
      select: {
        id: true,
        slug: true,
        name: true,
        name_native: true,
        avatar_url: true,
        nationality: true,
        total_readers: true,
        follower_count: true,
        _count: { select: { works: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.creator.count({ where }),
  ])

  return { creators, total }
}

export type CreatorListItem = {
  id: string
  slug: string
  name: string
  name_native: string | null
  avatar_url: string | null
  nationality: string | null
  total_readers: number
  follower_count: number
  _count: { works: number }
}

export async function getCreatorBySlug(slug: string) {
  return prisma.creator.findUnique({
    where: { slug },
    include: {
      works: {
        include: {
          manhwa: { select: manhwaCardSelect },
        },
        orderBy: { manhwa: { reader_count: 'desc' } },
      },
      _count: { select: { followers: true } },
    },
  })
}

export type CreatorWithWorks = NonNullable<Awaited<ReturnType<typeof getCreatorBySlug>>>

export async function getTopCreators(limit = 6): Promise<CreatorListItem[]> {
  return prisma.creator.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      name_native: true,
      avatar_url: true,
      nationality: true,
      total_readers: true,
      follower_count: true,
      _count: { select: { works: true } },
    },
    orderBy: { total_readers: 'desc' },
    take: limit,
  })
}

export type ManhwaCreatorWork = {
  manhwa: ManhwaCardData
  role: string
  role_detail: string | null
}
