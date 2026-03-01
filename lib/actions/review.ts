'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth/session'
import { createReview, deleteReview, toggleReviewLike } from '@/lib/db/review'

const reviewSchema = z.object({
  manhwaId: z.string().min(1),
  content: z.string().min(10).max(10000),
  score: z.number().min(0).max(10).nullable().optional(),
  hasSpoilers: z.boolean().default(false),
})

const microReviewSchema = z.object({
  manhwaId: z.string().min(1),
  content: z.string().min(1).max(280),
  score: z.number().min(0).max(10).nullable().optional(),
})

export async function createReviewAction(data: {
  manhwaId: string
  content: string
  score?: number | null
  hasSpoilers?: boolean
  isMicro?: boolean
}) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const schema = data.isMicro ? microReviewSchema : reviewSchema
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.message }
  }

  await createReview({
    userId: user.id,
    manhwaId: data.manhwaId,
    content: data.content,
    score: data.score,
    isMicro: data.isMicro ?? false,
    hasSpoilers: data.hasSpoilers ?? false,
  })

  revalidatePath('/[locale]/manhwa/[slug]', 'page')
  return { success: true }
}

export async function deleteReviewAction(reviewId: string) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  await deleteReview(reviewId, user.id)
  revalidatePath('/[locale]/manhwa/[slug]', 'page')
  return { success: true }
}

export async function toggleLikeAction(reviewId: string) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const liked = await toggleReviewLike(user.id, reviewId)
  revalidatePath('/[locale]/manhwa/[slug]', 'page')
  return { success: true, liked }
}
