import { prisma } from './client'
import { followUser, isFollowing } from './follow'

export type FriendRequestStatusValue =
  | 'NONE'
  | 'PENDING_SENT'
  | 'PENDING_RECEIVED'
  | 'FRIENDS'

export async function sendFriendRequest(
  senderId: string,
  receiverId: string,
): Promise<{ id: string }> {
  // Check if a request already exists
  const existing = await prisma.friendRequest.findUnique({
    where: { sender_id_receiver_id: { sender_id: senderId, receiver_id: receiverId } },
  })
  if (existing) throw new Error('Friend request already exists')

  return prisma.friendRequest.create({
    data: { sender_id: senderId, receiver_id: receiverId },
    select: { id: true },
  })
}

export async function acceptFriendRequest(
  requestId: string,
  userId: string,
): Promise<void> {
  const request = await prisma.friendRequest.findUnique({ where: { id: requestId } })
  if (!request || request.receiver_id !== userId || request.status !== 'PENDING') return

  await prisma.friendRequest.update({
    where: { id: requestId },
    data: { status: 'ACCEPTED' },
  })

  // Mutual follows (skip if already following)
  const [ab, ba] = await Promise.all([
    isFollowing(request.sender_id, request.receiver_id),
    isFollowing(request.receiver_id, request.sender_id),
  ])
  await Promise.all([
    ab ? Promise.resolve() : followUser(request.sender_id, request.receiver_id),
    ba ? Promise.resolve() : followUser(request.receiver_id, request.sender_id),
  ])
}

export async function declineFriendRequest(
  requestId: string,
  userId: string,
): Promise<void> {
  const request = await prisma.friendRequest.findUnique({ where: { id: requestId } })
  if (!request || request.receiver_id !== userId || request.status !== 'PENDING') return

  await prisma.friendRequest.update({
    where: { id: requestId },
    data: { status: 'DECLINED' },
  })
}

export async function getFriendRequestStatus(
  viewerId: string,
  targetId: string,
): Promise<FriendRequestStatusValue> {
  const [sent, received] = await Promise.all([
    prisma.friendRequest.findUnique({
      where: { sender_id_receiver_id: { sender_id: viewerId, receiver_id: targetId } },
    }),
    prisma.friendRequest.findUnique({
      where: { sender_id_receiver_id: { sender_id: targetId, receiver_id: viewerId } },
    }),
  ])

  if (sent?.status === 'ACCEPTED' || received?.status === 'ACCEPTED') return 'FRIENDS'
  if (sent?.status === 'PENDING') return 'PENDING_SENT'
  if (received?.status === 'PENDING') return 'PENDING_RECEIVED'
  return 'NONE'
}

export async function batchGetFriendRequestStatus(
  viewerId: string,
  targetIds: string[],
): Promise<Record<string, FriendRequestStatusValue>> {
  if (targetIds.length === 0) return {}

  const [sent, received] = await Promise.all([
    prisma.friendRequest.findMany({
      where: { sender_id: viewerId, receiver_id: { in: targetIds } },
      select: { receiver_id: true, status: true },
    }),
    prisma.friendRequest.findMany({
      where: { receiver_id: viewerId, sender_id: { in: targetIds } },
      select: { sender_id: true, status: true },
    }),
  ])

  const result: Record<string, FriendRequestStatusValue> = {}
  for (const id of targetIds) result[id] = 'NONE'

  for (const r of received) {
    if (r.status === 'ACCEPTED') result[r.sender_id] = 'FRIENDS'
    else if (r.status === 'PENDING' && result[r.sender_id] === 'NONE')
      result[r.sender_id] = 'PENDING_RECEIVED'
  }
  for (const s of sent) {
    if (s.status === 'ACCEPTED') result[s.receiver_id] = 'FRIENDS'
    else if (s.status === 'PENDING' && result[s.receiver_id] === 'NONE')
      result[s.receiver_id] = 'PENDING_SENT'
  }

  return result
}
