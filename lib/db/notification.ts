import { prisma } from './client'
import type { Prisma } from '@prisma/client'

export type NotificationType = 'new_follower' | 'review_liked' | 'new_chapter'

export type NotificationRow = Prisma.NotificationGetPayload<{}>

// Map notification type → user preference column
const PREF_MAP: Record<NotificationType, string> = {
  new_follower: 'notif_new_follower',
  review_liked: 'notif_review_liked',
  new_chapter: 'notif_new_chapter',
}

export async function createNotification(input: {
  userId: string
  type: NotificationType
  data: Record<string, unknown>
}): Promise<void> {
  // Check if user has this notification type enabled
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: {
      notif_new_follower: true,
      notif_review_liked: true,
      notif_new_chapter: true,
    },
  })

  if (!user) return

  const prefField = PREF_MAP[input.type] as keyof typeof user
  if (!user[prefField]) return

  await prisma.notification.create({
    data: {
      user_id: input.userId,
      type: input.type,
      data: input.data as Prisma.InputJsonValue,
    },
  })
}

export async function getNotifications(
  userId: string,
  page = 1,
  limit = 20,
): Promise<{ notifications: NotificationRow[]; total: number }> {
  const where = { user_id: userId }
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ])
  return { notifications, total }
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { user_id: userId, read: false },
  })
}

export async function markAsRead(
  notificationId: string,
  userId: string,
): Promise<void> {
  await prisma.notification.updateMany({
    where: { id: notificationId, user_id: userId },
    data: { read: true },
  })
}

export async function markAllAsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { user_id: userId, read: false },
    data: { read: true },
  })
}
