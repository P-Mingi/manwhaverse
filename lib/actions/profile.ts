'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth/session'
import { updateUserProfile } from '@/lib/db/user'

const updateProfileSchema = z.object({
  display_name: z.string().min(1).max(50).trim(),
  bio: z.string().max(300).trim().optional(),
  locale: z.enum(['en', 'fr']),
  avatar_url: z.string().url().max(500).optional().or(z.literal('')),
})

export async function updateProfileAction(formData: FormData) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const parsed = updateProfileSchema.safeParse({
    display_name: formData.get('display_name'),
    bio: formData.get('bio') || undefined,
    locale: formData.get('locale'),
    avatar_url: formData.get('avatar_url') || undefined,
  })

  if (!parsed.success) {
    return { error: 'Invalid URL' }
  }

  await updateUserProfile(user.id, {
    display_name: parsed.data.display_name,
    bio: parsed.data.bio ?? '',
    locale: parsed.data.locale,
    ...(parsed.data.avatar_url !== undefined
      ? { avatar_url: parsed.data.avatar_url || null }
      : {}),
  })

  revalidatePath(`/${parsed.data.locale}/profile`)
  revalidatePath(`/${parsed.data.locale}/settings`)

  return { success: true }
}

const notifPrefsSchema = z.object({
  notif_new_chapter: z.boolean(),
  notif_review_liked: z.boolean(),
  notif_new_follower: z.boolean(),
  notif_weekly_digest: z.boolean(),
  notif_email: z.boolean(),
})

export async function updateNotificationPrefsAction(data: {
  notif_new_chapter: boolean
  notif_review_liked: boolean
  notif_new_follower: boolean
  notif_weekly_digest: boolean
  notif_email: boolean
}) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const parsed = notifPrefsSchema.safeParse(data)
  if (!parsed.success) return { error: 'Invalid input' }

  await updateUserProfile(user.id, parsed.data)

  revalidatePath('/[locale]/settings', 'page')
  return { success: true }
}
