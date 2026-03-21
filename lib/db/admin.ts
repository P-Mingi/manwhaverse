import { prisma } from './client'

export async function getAdminStats() {
  const [totalUsers, seedUsers, bannedUsers, totalManhwas, totalReviews, totalReactions] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { is_seed: true } }),
      prisma.user.count({ where: { is_banned: true } }),
      prisma.manhwa.count(),
      prisma.review.count(),
      prisma.manhwaReaction.count(),
    ])

  return {
    totalUsers,
    seedUsers,
    realUsers: totalUsers - seedUsers,
    bannedUsers,
    totalManhwas,
    totalReviews,
    totalReactions,
  }
}

export async function getAdminUsers({
  page = 1,
  limit = 50,
  search,
  filter,
}: {
  page?: number
  limit?: number
  search?: string
  filter?: 'all' | 'seed' | 'banned' | 'real'
}) {
  const where: Record<string, unknown> = {}

  if (filter === 'seed') where.is_seed = true
  else if (filter === 'banned') where.is_banned = true
  else if (filter === 'real') where.is_seed = false

  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { display_name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        display_name: true,
        avatar_url: true,
        email: true,
        is_seed: true,
        is_banned: true,
        created_at: true,
        _count: { select: { library: true, reviews: true, followers: true } },
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])

  return { users, total, pages: Math.ceil(total / limit) }
}

export async function getAdminUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      display_name: true,
      avatar_url: true,
      bio: true,
      email: true,
      is_seed: true,
      is_banned: true,
      created_at: true,
      _count: { select: { library: true, reviews: true, followers: true, follows: true } },
    },
  })
}

export async function getAdminReviews({
  page = 1,
  limit = 50,
  search,
  filter,
}: {
  page?: number
  limit?: number
  search?: string
  filter?: 'all' | 'micro' | 'long' | 'deleted'
}) {
  const where: Record<string, unknown> = {}

  if (filter === 'micro') {
    where.is_micro = true
    where.deleted_at = null
  } else if (filter === 'long') {
    where.is_micro = false
    where.deleted_at = null
  } else if (filter === 'deleted') {
    where.deleted_at = { not: null }
  } else {
    where.deleted_at = null
  }

  if (search) {
    where.OR = [
      { content: { contains: search, mode: 'insensitive' } },
      { title: { contains: search, mode: 'insensitive' } },
      { user: { username: { contains: search, mode: 'insensitive' } } },
      { manhwa: { title_en: { contains: search, mode: 'insensitive' } } },
    ]
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      select: {
        id: true,
        title: true,
        content: true,
        score: true,
        is_micro: true,
        has_spoilers: true,
        likes_count: true,
        dislikes_count: true,
        created_at: true,
        deleted_at: true,
        user: { select: { id: true, username: true, display_name: true, avatar_url: true } },
        manhwa: { select: { id: true, slug: true, title_en: true, cover_url: true } },
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.count({ where }),
  ])

  return { reviews, total, pages: Math.ceil(total / limit) }
}

export async function getAdminReview(id: string) {
  return prisma.review.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      score: true,
      is_micro: true,
      has_spoilers: true,
      score_story: true,
      score_art: true,
      score_characters: true,
      score_world: true,
      likes_count: true,
      dislikes_count: true,
      created_at: true,
      deleted_at: true,
      user: { select: { id: true, username: true, display_name: true, avatar_url: true } },
      manhwa: { select: { id: true, slug: true, title_en: true, cover_url: true } },
    },
  })
}
