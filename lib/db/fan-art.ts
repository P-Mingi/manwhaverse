import { prisma } from './client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type FanArtCardData = {
  id: string
  title: string
  is_nsfw: boolean
  is_original: boolean
  credit_name: string | null
  like_count: number
  comment_count: number
  tags: string[]
  created_at: Date
  user: { username: string | null; display_name: string | null; avatar_url: string | null }
  manhwa: { slug: string; title_en: string } | null
  images: { image_url: string; thumb_url: string; alt_text: string | null; width: number; height: number }[]
}

export type FanArtPostFull = FanArtCardData & {
  description: string | null
  credit_url: string | null
  view_count: number
  user: {
    id: string
    username: string | null
    display_name: string | null
    avatar_url: string | null
    is_artist: boolean
    artist_bio: string | null
    artist_twitter: string | null
    artist_instagram: string | null
    artist_pixiv: string | null
    artist_artstation: string | null
    artist_portfolio_url: string | null
  }
  comments: {
    id: string
    content: string
    created_at: Date
    parent_id: string | null
    user: { username: string | null; display_name: string | null; avatar_url: string | null }
    replies: {
      id: string
      content: string
      created_at: Date
      user: { username: string | null; display_name: string | null; avatar_url: string | null }
    }[]
  }[]
}

const fanArtCardSelect = {
  id: true,
  title: true,
  is_nsfw: true,
  is_original: true,
  credit_name: true,
  like_count: true,
  comment_count: true,
  tags: true,
  created_at: true,
  user: {
    select: { username: true, display_name: true, avatar_url: true },
  },
  manhwa: { select: { slug: true, title_en: true } },
  images: {
    orderBy: { position: 'asc' as const },
    take: 1,
    select: { image_url: true, thumb_url: true, alt_text: true, width: true, height: true },
  },
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getPublicFanArts(opts: {
  page?: number
  limit?: number
  sort?: 'recent' | 'top'
  tag?: string
  manhwaSlug?: string
  showNsfw?: boolean
}): Promise<{ posts: FanArtCardData[]; total: number }> {
  const { page = 1, limit = 24, sort = 'recent', tag, manhwaSlug, showNsfw = false } = opts

  const where = {
    ...(showNsfw ? {} : { is_nsfw: false }),
    ...(tag ? { tags: { has: tag } } : {}),
    ...(manhwaSlug ? { manhwa: { slug: manhwaSlug } } : {}),
  }

  const orderBy = sort === 'top' ? { like_count: 'desc' as const } : { created_at: 'desc' as const }

  const [posts, total] = await Promise.all([
    prisma.fanArtPost.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: fanArtCardSelect,
    }),
    prisma.fanArtPost.count({ where }),
  ])

  return { posts: posts as FanArtCardData[], total }
}

export async function getFanArtPostById(id: string): Promise<FanArtPostFull | null> {
  const post = await prisma.fanArtPost.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      is_nsfw: true,
      is_original: true,
      credit_name: true,
      credit_url: true,
      like_count: true,
      comment_count: true,
      view_count: true,
      tags: true,
      created_at: true,
      user: {
        select: {
          id: true,
          username: true,
          display_name: true,
          avatar_url: true,
          is_artist: true,
          artist_bio: true,
          artist_twitter: true,
          artist_instagram: true,
          artist_pixiv: true,
          artist_artstation: true,
          artist_portfolio_url: true,
        },
      },
      manhwa: { select: { slug: true, title_en: true } },
      images: {
        orderBy: { position: 'asc' },
        select: { image_url: true, thumb_url: true, alt_text: true, width: true, height: true },
      },
      comments: {
        where: { parent_id: null },
        orderBy: { created_at: 'asc' },
        select: {
          id: true,
          content: true,
          created_at: true,
          parent_id: true,
          user: { select: { username: true, display_name: true, avatar_url: true } },
          replies: {
            orderBy: { created_at: 'asc' },
            select: {
              id: true,
              content: true,
              created_at: true,
              user: { select: { username: true, display_name: true, avatar_url: true } },
            },
          },
        },
      },
    },
  })

  return post as FanArtPostFull | null
}

export async function getArtistPosts(userId: string, showNsfw = false): Promise<FanArtCardData[]> {
  const posts = await prisma.fanArtPost.findMany({
    where: { user_id: userId, ...(showNsfw ? {} : { is_nsfw: false }) },
    orderBy: { created_at: 'desc' },
    select: fanArtCardSelect,
  })
  return posts as FanArtCardData[]
}

export async function getTopFanArtsThisWeek(limit = 6): Promise<FanArtCardData[]> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const posts = await prisma.fanArtPost.findMany({
    where: { is_nsfw: false, created_at: { gte: since } },
    orderBy: { like_count: 'desc' },
    take: limit,
    select: fanArtCardSelect,
  })
  return posts as FanArtCardData[]
}

export async function checkUserLikedFanArt(userId: string, postId: string): Promise<boolean> {
  const like = await prisma.fanArtLike.findUnique({
    where: { user_id_post_id: { user_id: userId, post_id: postId } },
  })
  return !!like
}

export async function getManhwaFanArts(manhwaId: string, limit = 12): Promise<FanArtCardData[]> {
  const posts = await prisma.fanArtPost.findMany({
    where: { manhwa_id: manhwaId, is_nsfw: false },
    orderBy: { like_count: 'desc' },
    take: limit,
    select: fanArtCardSelect,
  })
  return posts as FanArtCardData[]
}
