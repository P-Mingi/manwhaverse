'use server'

import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth/session'
import { markAsRead, markAllAsRead } from '@/lib/db/notification'

export async function markNotificationReadAction(notificationId: string) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  await markAsRead(notificationId, user.id)
  revalidatePath('/[locale]/notifications', 'page')
  return { success: true }
}

export async function markAllNotificationsReadAction() {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  await markAllAsRead(user.id)
  revalidatePath('/[locale]/notifications', 'page')
  return { success: true }
}
