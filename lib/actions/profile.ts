'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth/session'
import { updateUserProfile } from '@/lib/db/user'

const updateProfileSchema = z.object({
  display_name: z.string().min(1).max(50).trim(),
  bio: z.string().max(300).trim().optional(),
  locale: z.enum(['en', 'fr']),
})

export async function updateProfileAction(formData: FormData) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const parsed = updateProfileSchema.safeParse({
    display_name: formData.get('display_name'),
    bio: formData.get('bio') || undefined,
    locale: formData.get('locale'),
  })

  if (!parsed.success) {
    return { error: 'Invalid input' }
  }

  await updateUserProfile(user.id, {
    display_name: parsed.data.display_name,
    bio: parsed.data.bio ?? '',
    locale: parsed.data.locale,
  })

  revalidatePath(`/${parsed.data.locale}/profile`)
  revalidatePath(`/${parsed.data.locale}/settings`)

  return { success: true }
}
