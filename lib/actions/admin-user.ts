'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { isAdmin } from '@/lib/auth/session'
import { MODERATOR_USERNAMES } from '@/lib/auth/moderators'
import { getUser } from '@/lib/auth/session'
import { updateUserProfile } from '@/lib/db/user'
import { prisma } from '@/lib/db/client'

async function requireAdmin() {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')
  const adminOk = await isAdmin()
  const modOk = user.username && MODERATOR_USERNAMES.includes(user.username)
  if (!adminOk && !modOk) throw new Error('Unauthorized')
  return user
}

const editUserSchema = z.object({
  display_name: z.string().min(1).max(50).trim(),
  username: z.string().min(2).max(30).regex(/^[a-z0-9_]+$/).trim(),
  avatar_url: z.string().url().optional().or(z.literal('')),
  bio: z.string().max(300).trim().optional(),
})

export async function adminEditUserAction(targetUserId: string, formData: FormData) {
  await requireAdmin()

  const parsed = editUserSchema.safeParse({
    display_name: formData.get('display_name'),
    username: formData.get('username'),
    avatar_url: formData.get('avatar_url') || undefined,
    bio: formData.get('bio') || undefined,
  })
  if (!parsed.success) return { error: 'Invalid input: ' + parsed.error.issues[0]?.message }

  // Check username uniqueness if changed
  const existing = await prisma.user.findUnique({
    where: { username: parsed.data.username },
    select: { id: true },
  })
  if (existing && existing.id !== targetUserId) {
    return { error: 'Username already taken' }
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: {
      display_name: parsed.data.display_name,
      username: parsed.data.username,
      bio: parsed.data.bio ?? '',
      ...(parsed.data.avatar_url !== undefined
        ? { avatar_url: parsed.data.avatar_url || null }
        : {}),
    },
  })

  revalidatePath(`/[locale]/profile/${parsed.data.username}`, 'page')
  return { success: true, username: parsed.data.username }
}

export async function adminEditReviewAction(reviewId: string, formData: FormData) {
  await requireAdmin()

  const content = (formData.get('content') as string)?.trim()
  if (!content || content.length < 1) return { error: 'Content cannot be empty' }
  if (content.length > 5000) return { error: 'Content too long' }

  await prisma.review.update({
    where: { id: reviewId },
    data: { content },
  })

  revalidatePath('/[locale]/manhwa', 'layout')
  return { success: true }
}
