import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth/session'
import { searchUsers } from '@/lib/db/user'
import { prisma } from '@/lib/db/client'
import { batchGetFriendRequestStatus } from '@/lib/db/friendRequest'
import type { FriendRequestStatusValue } from '@/lib/db/friendRequest'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 1) {
    return NextResponse.json({ users: [] })
  }

  const sessionUser = await getUser()

  const { users } = await searchUsers({ query: q, limit: 6 })

  // Filter out current user from results
  const filtered = sessionUser ? users.filter((u) => u.id !== sessionUser.id) : users

  const targetIds = filtered.slice(0, 5).map((u) => u.id)

  // Batch-check follow status and friend request status
  let followingIds = new Set<string>()
  let friendStatuses: Record<string, FriendRequestStatusValue> = {}

  if (sessionUser && targetIds.length > 0) {
    const [follows, statuses] = await Promise.all([
      prisma.follow.findMany({
        where: { follower_id: sessionUser.id, following_id: { in: targetIds } },
        select: { following_id: true },
      }),
      batchGetFriendRequestStatus(sessionUser.id, targetIds),
    ])
    followingIds = new Set(follows.map((f) => f.following_id))
    friendStatuses = statuses
  }

  const result = targetIds.map((id) => {
    const u = filtered.find((u) => u.id === id)!
    return {
      id: u.id,
      username: u.username,
      display_name: u.display_name,
      avatar_url: u.avatar_url,
      bio: u.bio,
      followers_count: u._count.followers,
      is_following: followingIds.has(u.id),
      friend_request_status: friendStatuses[u.id] ?? 'NONE',
    }
  })

  return NextResponse.json({ users: result })
}
