'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth/session'
import { upsertLibraryEntry, removeFromLibrary, getLibraryEntry } from '@/lib/db/library'
import { createActivity } from '@/lib/db/activity'
import { recalculateSingleManhwaScore } from '@/lib/scoring/realtime'
import type { ActivityType } from '@prisma/client'

const addToLibrarySchema = z.object({
  manhwaId: z.string().min(1),
  status: z.enum(['READING', 'COMPLETED', 'ON_HOLD', 'DROPPED', 'PLAN_TO_READ', 'REREADING']),
  score: z.number().min(0).max(10).nullable().optional(),
  progress: z.number().int().min(0).optional(),
})

function revalidateLibrary() {
  revalidatePath('/[locale]/library', 'page')
  revalidatePath('/[locale]/manhwa/[slug]', 'layout')
}

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

  // Log activity
  const activityType: ActivityType =
    parsed.data.status === 'COMPLETED'
      ? 'COMPLETED'
      : parsed.data.status === 'READING' || parsed.data.status === 'REREADING'
        ? 'STARTED_READING'
        : 'ADDED_TO_LIBRARY'
  await createActivity({
    userId: user.id,
    type: activityType,
    manhwaId: parsed.data.manhwaId,
    metadata: { status: parsed.data.status },
  })

  await recalculateSingleManhwaScore(parsed.data.manhwaId)
  revalidateLibrary()
  return { success: true }
}

export async function removeFromLibraryAction(manhwaId: string) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  await removeFromLibrary(user.id, manhwaId)
  await recalculateSingleManhwaScore(manhwaId)
  revalidateLibrary()
  return { success: true }
}

export async function updateScoreAction(manhwaId: string, score: number | null) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  if (score !== null && (score < 0 || score > 10)) {
    return { error: 'Score must be between 0 and 10' }
  }

  const entry = await getLibraryEntry(user.id, manhwaId)

  // Auto-add to library if not already there
  await upsertLibraryEntry(user.id, manhwaId, {
    status: entry?.status ?? 'COMPLETED',
    score,
  })

  if (score !== null) {
    await createActivity({
      userId: user.id,
      type: 'RATED',
      manhwaId,
      metadata: { score },
    })
  }

  await recalculateSingleManhwaScore(manhwaId)
  revalidateLibrary()
  return { success: true }
}

export async function updateProgressAction(manhwaId: string, progress: number) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  if (progress < 0) return { error: 'Invalid progress' }

  const entry = await getLibraryEntry(user.id, manhwaId)
  if (!entry) return { error: 'Not in library' }

  await upsertLibraryEntry(user.id, manhwaId, {
    status: entry.status,
    progress,
  })

  revalidateLibrary()
  return { success: true }
}

const editorSchema = z.object({
  manhwaId: z.string().min(1),
  status: z.enum(['READING', 'COMPLETED', 'ON_HOLD', 'DROPPED', 'PLAN_TO_READ', 'REREADING']),
  score: z.number().min(0).max(10).nullable(),
  progress: z.number().int().min(0),
  started_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  read_at: z.string().nullable().optional(),
  reread_count: z.number().int().min(0),
  is_favorite: z.boolean(),
  private_tags: z.array(z.string().max(50)).max(20),
  notes: z.string().max(5000).nullable(),
})

export async function updateLibraryEntryAction(input: z.input<typeof editorSchema>) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const parsed = editorSchema.safeParse(input)
  if (!parsed.success) return { error: 'Invalid input' }

  const d = parsed.data
  await upsertLibraryEntry(user.id, d.manhwaId, {
    status: d.status,
    score: d.score,
    progress: d.progress,
    started_at: d.started_at ? new Date(d.started_at) : null,
    completed_at: d.completed_at ? new Date(d.completed_at) : null,
    read_at: d.read_at ? new Date(d.read_at) : null,
    reread_count: d.reread_count,
    is_favorite: d.is_favorite,
    private_tags: d.private_tags,
    notes: d.notes,
  })

  const activityType: ActivityType =
    d.status === 'COMPLETED'
      ? 'COMPLETED'
      : d.status === 'READING' || d.status === 'REREADING'
        ? 'STARTED_READING'
        : 'ADDED_TO_LIBRARY'
  await createActivity({
    userId: user.id,
    type: activityType,
    manhwaId: d.manhwaId,
    metadata: { status: d.status },
  })

  await recalculateSingleManhwaScore(d.manhwaId)
  revalidateLibrary()
  return { success: true }
}

export async function toggleFavoriteAction(manhwaId: string) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const entry = await getLibraryEntry(user.id, manhwaId)
  if (!entry) return { error: 'Not in library' }

  const newFav = !entry.is_favorite
  await upsertLibraryEntry(user.id, manhwaId, {
    status: entry.status,
    is_favorite: newFav,
  })

  if (newFav) {
    await createActivity({
      userId: user.id,
      type: 'FAVORITED',
      manhwaId,
    })
  }

  revalidateLibrary()
  return { success: true }
}
