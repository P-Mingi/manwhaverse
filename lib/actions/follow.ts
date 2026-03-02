'use server'

import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth/session'
import {
  isFollowing,
  followUser,
  unfollowUser,
} from '@/lib/db/follow'
import { createNotification } from '@/lib/db/notification'
import { prisma } from '@/lib/db/client'

export async function followAction(targetUserId: string) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }
  if (user.id === targetUserId) return { error: 'Cannot follow yourself' }

  const already = await isFollowing(user.id, targetUserId)
  if (already) return { error: 'Already following' }

  await followUser(user.id, targetUserId)

  // Notify the target user
  const followerInfo = await prisma.user.findUnique({
    where: { id: user.id },
    select: { username: true, display_name: true, avatar_url: true },
  })

  await createNotification({
    userId: targetUserId,
    type: 'new_follower',
    data: {
      follower_id: user.id,
      follower_username: followerInfo?.username ?? null,
      follower_display_name: followerInfo?.display_name ?? null,
      follower_avatar_url: followerInfo?.avatar_url ?? null,
    },
  })

  revalidatePath('/[locale]/profile/[username]', 'page')
  return { success: true }
}

export async function unfollowAction(targetUserId: string) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  await unfollowUser(user.id, targetUserId)
  revalidatePath('/[locale]/profile/[username]', 'page')
  return { success: true }
}
