import { unstable_cache } from 'next/cache'
import { prisma } from './client'
import type { Prisma } from '@prisma/client'

// Full manhwa with all relations for the fiche page
const manhwaWithRelations = {
  creator_links: { include: { creator: true } },
  genre_links: { include: { genre: true } },
  trope_links: {
    include: { trope: true },
    orderBy: { upvotes: 'desc' as const },
    take: 20,
  },
  read_links: { take: 5 },
  arcs: { orderBy: { position: 'asc' as const } },
  characters: {
    include: { character: true },
    orderBy: { role: 'asc' as const },
    take: 6,
  },
} satisfies Prisma.ManhwaInclude

export type ManhwaWithRelations = Prisma.ManhwaGetPayload<{
  include: typeof manhwaWithRelations
}>

export function getManhwaBySlug(slug: string): Promise<ManhwaWithRelations | null> {
  return unstable_cache(
    async () => {
      return prisma.manhwa.findUnique({
        where: { slug, is_published: true, deleted_at: null },
        include: manhwaWithRelations,
      })
    },
    [`manhwa-by-slug-${slug}`],
    { revalidate: 3600, tags: ['manhwa', `manhwa-${slug}`] }
  )()
}

// Lightweight type for cards/grids
export const manhwaCardSelect = {
  id: true,
  slug: true,
  title_en: true,
  title_fr: true,
  cover_url: true,
  cover_is_nsfw: true,
  content_rating: true,
  type: true,
  status: true,
  score_avg: true,
  score_count: true,
  ext_score_composite: true,
  display_score: true,
  display_score_source: true,
  display_score_phase: true,
  display_score_confidence: true,
  chapter_count: true,
  reader_count: true,
  genre_links: {
    include: { genre: { select: { slug: true, name_en: true, name_fr: true } } },
    take: 3,
  },
} satisfies Prisma.ManhwaSelect

export type ManhwaCardData = Prisma.ManhwaGetPayload<{
  select: typeof manhwaCardSelect
}>

// Extended card data with popup fields (synopsis, tropes, year)
export const manhwaCardWithPopupSelect = {
  ...manhwaCardSelect,
  synopsis_en: true,
  synopsis_fr: true,
  release_year: true,
  end_year: true,
  genre_links: {
    include: { genre: { select: { slug: true, name_en: true, name_fr: true } } },
    take: 5,
  },
  trope_links: {
    include: { trope: { select: { slug: true, name: true } } },
    take: 5,
  },
} satisfies Prisma.ManhwaSelect

export type ManhwaCardPopupData = Prisma.ManhwaGetPayload<{
  select: typeof manhwaCardWithPopupSelect
}>

export async function getManhwaForCard(
  slug: string
): Promise<ManhwaCardData | null> {
  return prisma.manhwa.findUnique({
    where: { slug, is_published: true },
    select: manhwaCardSelect,
  })
}

export function getRelatedManhwas(
  manhwaId: string,
  limit = 6
): Promise<ManhwaCardData[]> {
  return unstable_cache(
    async () => {
      const similar = await prisma.similarManhwa.findMany({
        where: { source_id: manhwaId },
        orderBy: { similarity: 'desc' },
        take: limit,
        include: { target: { select: manhwaCardSelect } },
      })

      if (similar.length > 0) return similar.map((s) => s.target)

      const manhwa = await prisma.manhwa.findUnique({
        where: { id: manhwaId },
        select: { genre_links: { select: { genre_id: true } } },
      })

      if (!manhwa) return []

      const genreIds = manhwa.genre_links.map((g) => g.genre_id)

      return prisma.manhwa.findMany({
        where: {
          id: { not: manhwaId },
          is_published: true,
          genre_links: { some: { genre_id: { in: genreIds } } },
        },
        select: manhwaCardSelect,
        orderBy: { score_avg: 'desc' },
        take: limit,
      })
    },
    [`related-manhwas-${manhwaId}-${limit}`],
    { revalidate: 3600, tags: [`manhwa-${manhwaId}`] }
  )()
}

export function getTopManhwaSlugs(limit = 100): Promise<string[]> {
  return unstable_cache(
    async () => {
      const manhwas = await prisma.manhwa.findMany({
        where: { is_published: true },
        select: { slug: true },
        orderBy: { reader_count: 'desc' },
        take: limit,
      })
      return manhwas.map((m) => m.slug)
    },
    [`top-manhwa-slugs-${limit}`],
    { revalidate: 3600, tags: ['manhwa'] }
  )()
}
