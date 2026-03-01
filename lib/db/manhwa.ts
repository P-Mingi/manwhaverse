import { prisma } from './client'
import type { Prisma } from '@prisma/client'

// Full manhwa with all relations for the fiche page
const manhwaWithRelations = {
  creator_links: { include: { creator: true } },
  genre_links: { include: { genre: true } },
  trope_links: {
    include: { trope: true },
    orderBy: { upvotes: 'desc' as const },
  },
  read_links: true,
  arcs: { orderBy: { position: 'asc' as const } },
} satisfies Prisma.ManhwaInclude

export type ManhwaWithRelations = Prisma.ManhwaGetPayload<{
  include: typeof manhwaWithRelations
}>

export async function getManhwaBySlug(
  slug: string
): Promise<ManhwaWithRelations | null> {
  return prisma.manhwa.findUnique({
    where: { slug, is_published: true, deleted_at: null },
    include: manhwaWithRelations,
  })
}

// Lightweight type for cards/grids
const manhwaCardSelect = {
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
} satisfies Prisma.ManhwaSelect

export type ManhwaCardData = Prisma.ManhwaGetPayload<{
  select: typeof manhwaCardSelect
}>

export async function getManhwaForCard(
  slug: string
): Promise<ManhwaCardData | null> {
  return prisma.manhwa.findUnique({
    where: { slug, is_published: true },
    select: manhwaCardSelect,
  })
}

export async function getRelatedManhwas(
  manhwaId: string,
  limit = 6
): Promise<ManhwaCardData[]> {
  // Get similar manhwas ordered by similarity
  const similar = await prisma.similarManhwa.findMany({
    where: { source_id: manhwaId },
    orderBy: { similarity: 'desc' },
    take: limit,
    include: {
      target: { select: manhwaCardSelect },
    },
  })

  if (similar.length > 0) {
    return similar.map((s) => s.target)
  }

  // Fallback: get manhwas with same genres
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
}

export async function getTopManhwaSlugs(
  limit = 100
): Promise<string[]> {
  const manhwas = await prisma.manhwa.findMany({
    where: { is_published: true },
    select: { slug: true },
    orderBy: { reader_count: 'desc' },
    take: limit,
  })
  return manhwas.map((m) => m.slug)
}
