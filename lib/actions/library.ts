'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth/session'
import { upsertLibraryEntry, removeFromLibrary } from '@/lib/db/library'

const addToLibrarySchema = z.object({
  manhwaId: z.string().min(1),
  status: z.enum(['READING', 'COMPLETED', 'ON_HOLD', 'DROPPED', 'PLAN_TO_READ', 'REREADING']),
  score: z.number().min(0).max(10).nullable().optional(),
  progress: z.number().int().min(0).optional(),
})

export async function addToLibraryAction(formData: FormData) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const parsed = addToLibrarySchema.safeParse({
    manhwaId: formData.get('manhwaId'),
    status: formData.get('status'),
    score: formData.get('score') ? Number(formData.get('score')) : null,
    progress: formData.get('progress') ? Number(formData.get('progress')) : undefined,
  })

  if (!parsed.success) {
    return { error: 'Invalid input' }
  }

  await upsertLibraryEntry(user.id, parsed.data.manhwaId, {
    status: parsed.data.status,
    score: parsed.data.score,
    progress: parsed.data.progress,
  })

  revalidatePath('/[locale]/library', 'page')
  return { success: true }
}

export async function removeFromLibraryAction(manhwaId: string) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  await removeFromLibrary(user.id, manhwaId)
  revalidatePath('/[locale]/library', 'page')
  return { success: true }
}

export async function updateScoreAction(manhwaId: string, score: number | null) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  if (score !== null && (score < 0 || score > 10)) {
    return { error: 'Score must be between 0 and 10' }
  }

  await upsertLibraryEntry(user.id, manhwaId, {
    status: 'READING',
    score,
  })

  revalidatePath('/[locale]/library', 'page')
  return { success: true }
}
