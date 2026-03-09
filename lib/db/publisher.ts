import { prisma } from './client'
import { manhwaCardSelect } from './manhwa'

export async function getAllPublishers(
  page = 1,
  limit = 24,
): Promise<{ publishers: PublisherListItem[]; total: number }> {
  const [publishers, total] = await Promise.all([
    prisma.publisher.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        name_native: true,
        logo_url: true,
        country: true,
        description: true,
        _count: { select: { manhwa_links: true } },
      },
      orderBy: { manhwa_links: { _count: 'desc' } },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.publisher.count(),
  ])

  return { publishers, total }
}

export type PublisherListItem = {
  id: string
  slug: string
  name: string
  name_native: string | null
  logo_url: string | null
  country: string | null
  description: string | null
  _count: { manhwa_links: number }
}

export async function getPublisherBySlug(slug: string) {
  return prisma.publisher.findUnique({
    where: { slug },
    include: {
      manhwa_links: {
        include: {
          manhwa: { select: manhwaCardSelect },
        },
        orderBy: { manhwa: { reader_count: 'desc' } },
      },
      _count: { select: { manhwa_links: true } },
    },
  })
}

export type PublisherWithManhwas = NonNullable<Awaited<ReturnType<typeof getPublisherBySlug>>>

export async function getTopPublishers(limit = 6): Promise<PublisherListItem[]> {
  return prisma.publisher.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      name_native: true,
      logo_url: true,
      country: true,
      description: true,
      _count: { select: { manhwa_links: true } },
    },
    orderBy: { manhwa_links: { _count: 'desc' } },
    take: limit,
  })
}
