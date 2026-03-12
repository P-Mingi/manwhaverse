import { unstable_cache } from 'next/cache'
import { prisma } from './client'
import { Prisma } from '@prisma/client'
import type { ActivityType } from '@prisma/client'

const activityWithContext = {
  user: {
    select: {
      id: true,
      username: true,
      display_name: true,
      avatar_url: true,
    },
  },
} satisfies Prisma.ActivityInclude

export type ActivityWithContext = Prisma.ActivityGetPayload<{
  include: typeof activityWithContext
}> & {
  manhwa?: {
    id: string
    slug: string
    title_en: string
    title_fr: string | null
    cover_url: string | null
  } | null
}

export async function createActivity(data: {
  userId: string
  type: ActivityType
  manhwaId?: string
  metadata?: Record<string, unknown>
}): Promise<void> {
  await prisma.activity.create({
    data: {
      user_id: data.userId,
      type: data.type,
      manhwa_id: data.manhwaId,
      metadata: data.metadata ? (data.metadata as Prisma.InputJsonValue) : undefined,
    },
  })
}

async function enrichWithManhwa(
  activities: Prisma.ActivityGetPayload<{ include: typeof activityWithContext }>[],
): Promise<ActivityWithContext[]> {
  const manhwaIds = [
    ...new Set(activities.map((a) => a.manhwa_id).filter(Boolean) as string[]),
  ]
  if (manhwaIds.length === 0) return activities.map((a) => ({ ...a, manhwa: null }))

  const manhwas = await prisma.manhwa.findMany({
    where: { id: { in: manhwaIds } },
    select: {
      id: true,
      slug: true,
      title_en: true,
      title_fr: true,
      cover_url: true,
    },
  })
  const manhwaMap = new Map(manhwas.map((m) => [m.id, m]))

  return activities.map((a) => ({
    ...a,
    manhwa: a.manhwa_id ? manhwaMap.get(a.manhwa_id) ?? null : null,
  }))
}

export async function getFeedForUser(
  userId: string,
  page = 1,
  limit = 20,
): Promise<{ activities: ActivityWithContext[]; total: number }> {
  // Get IDs of users this person follows + self
  const following = await prisma.follow.findMany({
    where: { follower_id: userId },
    select: { following_id: true },
  })
  const ids = [...following.map((f) => f.following_id), userId]

  const where = { user_id: { in: ids } }
  const [raw, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      include: activityWithContext,
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.activity.count({ where }),
  ])

  const activities = await enrichWithManhwa(raw)
  return { activities, total }
}

export function getPublicFeed(
  page = 1,
  limit = 20,
): Promise<{ activities: ActivityWithContext[]; total: number }> {
  return unstable_cache(
    async () => {
      const [raw, total] = await Promise.all([
        prisma.activity.findMany({
          include: activityWithContext,
          orderBy: { created_at: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.activity.count(),
      ])

      const activities = await enrichWithManhwa(raw)
      return { activities, total }
    },
    [`public-feed-${page}-${limit}`],
    { revalidate: 60, tags: ['activity'] }
  )()
}

export async function getFriendsFeed(
  userId: string,
  page = 1,
  limit = 20,
): Promise<{ activities: ActivityWithContext[]; total: number }> {
  const followRows = await prisma.follow.findMany({
    where: { follower_id: userId },
    select: { following_id: true },
  })
  const followingIds = followRows.map((r) => r.following_id)

  if (followingIds.length === 0) return { activities: [], total: 0 }

  const where = { user_id: { in: followingIds } }
  const [raw, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      include: activityWithContext,
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.activity.count({ where }),
  ])

  const activities = await enrichWithManhwa(raw)
  return { activities, total }
}

export async function getUserActivity(
  userId: string,
  page = 1,
  limit = 10,
): Promise<{ activities: ActivityWithContext[]; total: number }> {
  const where = { user_id: userId }
  const [raw, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      include: activityWithContext,
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.activity.count({ where }),
  ])

  const activities = await enrichWithManhwa(raw)
  return { activities, total }
}
