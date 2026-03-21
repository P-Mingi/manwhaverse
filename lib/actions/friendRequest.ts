'use server'

import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth/session'
import { sendFriendRequest, acceptFriendRequest, declineFriendRequest } from '@/lib/db/friendRequest'
import { createNotification } from '@/lib/db/notification'
import { prisma } from '@/lib/db/client'

export async function sendFriendRequestAction(targetUserId: string) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }
  if (user.id === targetUserId) return { error: 'Cannot add yourself' }

  let request: { id: string }
  try {
    request = await sendFriendRequest(user.id, targetUserId)
  } catch {
    return { error: 'Request already sent' }
  }

  const senderInfo = await prisma.user.findUnique({
    where: { id: user.id },
    select: { username: true, display_name: true, avatar_url: true },
  })

  await createNotification({
    userId: targetUserId,
    type: 'friend_request',
    data: {
      request_id: request.id,
      sender_id: user.id,
      sender_username: senderInfo?.username ?? null,
      sender_display_name: senderInfo?.display_name ?? null,
      sender_avatar_url: senderInfo?.avatar_url ?? null,
    },
  })

  return { success: true }
}

export async function acceptFriendRequestAction(requestId: string) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  await acceptFriendRequest(requestId, user.id)

  // Notify the sender
  const request = await prisma.friendRequest.findUnique({
    where: { id: requestId },
    select: { sender_id: true },
  })

  if (request) {
    const accepterInfo = await prisma.user.findUnique({
      where: { id: user.id },
      select: { username: true, display_name: true, avatar_url: true },
    })

    await createNotification({
      userId: request.sender_id,
      type: 'friend_request_accepted',
      data: {
        accepter_id: user.id,
        accepter_username: accepterInfo?.username ?? null,
        accepter_display_name: accepterInfo?.display_name ?? null,
        accepter_avatar_url: accepterInfo?.avatar_url ?? null,
      },
    })
  }

  revalidatePath('/[locale]/notifications', 'page')
  return { success: true }
}

export async function declineFriendRequestAction(requestId: string) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  await declineFriendRequest(requestId, user.id)
  revalidatePath('/[locale]/notifications', 'page')
  return { success: true }
}

// Accept a pending request from a specific user (used in search results)
export async function acceptFriendRequestFromUserAction(senderId: string) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const request = await prisma.friendRequest.findUnique({
    where: { sender_id_receiver_id: { sender_id: senderId, receiver_id: user.id } },
  })
  if (!request || request.status !== 'PENDING') return { error: 'No pending request' }

  return acceptFriendRequestAction(request.id)
}

// Decline a pending request from a specific user (used in search results)
export async function declineFriendRequestFromUserAction(senderId: string) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const request = await prisma.friendRequest.findUnique({
    where: { sender_id_receiver_id: { sender_id: senderId, receiver_id: user.id } },
  })
  if (!request || request.status !== 'PENDING') return { error: 'No pending request' }

  return declineFriendRequestAction(request.id)
}
