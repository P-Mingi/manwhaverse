import { unstable_cache } from 'next/cache'
import { prisma } from './client'
import { manhwaCardSelect, type ManhwaCardData } from './manhwa'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ManhwaListSummary = {
  id: string
  slug: string
  title: string
  description: string | null
  likes_count: number
  item_count: number
  created_at: Date
  user: {
    username: string | null
    display_name: string | null
    avatar_url: string | null
  }
  preview_covers: string[]
}

export type ManhwaListWithItems = {
  id: string
  slug: string
  title: string
  description: string | null
  og_title: string | null
  is_public: boolean
  likes_count: number
  item_count: number
  created_at: Date
  updated_at: Date
  user_id: string
  user: {
    username: string | null
    display_name: string | null
    avatar_url: string | null
  }
  items: {
    id: string
    position: number
    note: string | null
    manhwa: ManhwaCardData
  }[]
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getPublicLists(
  page = 1,
  limit = 24,
  sort: 'popular' | 'recent' | 'size' = 'popular',
): Promise<{ lists: ManhwaListSummary[]; total: number }> {
  const where = { is_public: true }

  const orderBy = (() => {
    switch (sort) {
      case 'recent':
        return { created_at: 'desc' as const }
      case 'size':
        return { item_count: 'desc' as const }
      default:
        return { likes_count: 'desc' as const }
    }
  })()

  const [raw, total] = await Promise.all([
    prisma.manhwaList.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        likes_count: true,
        item_count: true,
        created_at: true,
        user: {
          select: { username: true, display_name: true, avatar_url: true },
        },
        items: {
          orderBy: { position: 'asc' },
          take: 4,
          select: {
            manhwa: { select: { cover_url: true, title_en: true } },
          },
        },
      },
    }),
    prisma.manhwaList.count({ where }),
  ])

  const lists: ManhwaListSummary[] = raw.map((l) => ({
    id: l.id,
    slug: l.slug,
    title: l.title,
    description: l.description,
    likes_count: l.likes_count,
    item_count: l.item_count,
    created_at: l.created_at,
    user: l.user,
    preview_covers: l.items
      .map((i) => i.manhwa.cover_url)
      .filter((c): c is string => !!c),
  }))

  return { lists, total }
}

export async function getListBySlug(slug: string): Promise<ManhwaListWithItems | null> {
  const list = await prisma.manhwaList.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      og_title: true,
      is_public: true,
      likes_count: true,
      item_count: true,
      created_at: true,
      updated_at: true,
      user_id: true,
      user: {
        select: { username: true, display_name: true, avatar_url: true },
      },
      items: {
        orderBy: { position: 'asc' },
        select: {
          id: true,
          position: true,
          note: true,
          manhwa: { select: manhwaCardSelect },
        },
      },
    },
  })

  return list as ManhwaListWithItems | null
}

export async function getUserLists(userId: string) {
  return prisma.manhwaList.findMany({
    where: { user_id: userId },
    orderBy: { updated_at: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      is_public: true,
      item_count: true,
      likes_count: true,
      created_at: true,
      updated_at: true,
    },
  })
}

export const getTopLists = unstable_cache(
  async (limit = 6): Promise<ManhwaListSummary[]> => {
    const raw = await prisma.manhwaList.findMany({
      where: { is_public: true },
      orderBy: { likes_count: 'desc' },
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        likes_count: true,
        item_count: true,
        created_at: true,
        user: {
          select: { username: true, display_name: true, avatar_url: true },
        },
        items: {
          orderBy: { position: 'asc' },
          take: 4,
          select: {
            manhwa: { select: { cover_url: true, title_en: true } },
          },
        },
      },
    })

    return raw.map((l) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      description: l.description,
      likes_count: l.likes_count,
      item_count: l.item_count,
      created_at: l.created_at,
      user: l.user,
      preview_covers: l.items
        .map((i) => i.manhwa.cover_url)
        .filter((c): c is string => !!c),
    }))
  },
  ['top-lists'],
  { revalidate: 300, tags: ['lists'] }
)

export async function checkUserLikedList(userId: string, listId: string): Promise<boolean> {
  const vote = await prisma.listVote.findUnique({
    where: { user_id_list_id: { user_id: userId, list_id: listId } },
  })
  return !!vote
}

export async function getListsByManhwa(manhwaId: string, limit = 10) {
  return prisma.manhwaList.findMany({
    where: {
      is_public: true,
      items: { some: { manhwa_id: manhwaId } },
    },
    orderBy: { likes_count: 'desc' },
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      likes_count: true,
      item_count: true,
      user: { select: { username: true, display_name: true } },
    },
  })
}
