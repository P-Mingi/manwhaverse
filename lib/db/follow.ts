import { prisma } from './client'

export type FollowUser = {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
}

const userSelect = {
  id: true,
  username: true,
  display_name: true,
  avatar_url: true,
  bio: true,
} as const

export async function isFollowing(
  followerId: string,
  followingId: string,
): Promise<boolean> {
  const follow = await prisma.follow.findUnique({
    where: {
      follower_id_following_id: {
        follower_id: followerId,
        following_id: followingId,
      },
    },
  })
  return !!follow
}

export async function followUser(
  followerId: string,
  followingId: string,
): Promise<void> {
  await prisma.follow.create({
    data: { follower_id: followerId, following_id: followingId },
  })
}

export async function unfollowUser(
  followerId: string,
  followingId: string,
): Promise<void> {
  await prisma.follow.delete({
    where: {
      follower_id_following_id: {
        follower_id: followerId,
        following_id: followingId,
      },
    },
  })
}

export async function getFollowers(
  userId: string,
  page = 1,
  limit = 30,
): Promise<{ users: FollowUser[]; total: number }> {
  const where = { following_id: userId }
  const [follows, total] = await Promise.all([
    prisma.follow.findMany({
      where,
      select: { follower: { select: userSelect } },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.follow.count({ where }),
  ])
  return { users: follows.map((f) => f.follower), total }
}

export async function getFollowerPreview(
  userId: string,
  limit = 5,
): Promise<{ id: string; username: string | null; avatar_url: string | null }[]> {
  const follows = await prisma.follow.findMany({
    where: { following_id: userId },
    select: {
      follower: {
        select: { id: true, username: true, avatar_url: true },
      },
    },
    orderBy: { created_at: 'desc' },
    take: limit,
  })
  return follows.map((f) => f.follower)
}

export async function getFollowing(
  userId: string,
  page = 1,
  limit = 30,
): Promise<{ users: FollowUser[]; total: number }> {
  const where = { follower_id: userId }
  const [follows, total] = await Promise.all([
    prisma.follow.findMany({
      where,
      select: { following: { select: userSelect } },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.follow.count({ where }),
  ])
  return { users: follows.map((f) => f.following), total }
}
