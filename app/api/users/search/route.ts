import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth/session'
import { searchUsers } from '@/lib/db/user'
import { prisma } from '@/lib/db/client'

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

  // Batch-check follow status
  let followingIds = new Set<string>()
  if (sessionUser && filtered.length > 0) {
    const follows = await prisma.follow.findMany({
      where: {
        follower_id: sessionUser.id,
        following_id: { in: filtered.map((u) => u.id) },
      },
      select: { following_id: true },
    })
    followingIds = new Set(follows.map((f) => f.following_id))
  }

  const result = filtered.slice(0, 5).map((u) => ({
    id: u.id,
    username: u.username,
    display_name: u.display_name,
    avatar_url: u.avatar_url,
    bio: u.bio,
    followers_count: u._count.followers,
    is_following: followingIds.has(u.id),
  }))

  return NextResponse.json({ users: result })
}
