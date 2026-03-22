'use server'

import { z } from 'zod'
import { revalidatePath, revalidateTag } from 'next/cache'
import { getUser } from '@/lib/auth/session'
import { createReview, deleteReview, toggleReviewLike, toggleReviewDislike, toggleReaction } from '@/lib/db/review'
import { createActivity } from '@/lib/db/activity'
import { createNotification } from '@/lib/db/notification'
import { recalculateSingleManhwaScore } from '@/lib/scoring/realtime'
import { prisma } from '@/lib/db/client'
import type { KoreanReaction } from '@prisma/client'

const reviewSchema = z.object({
  manhwaId: z.string().min(1),
  title: z.string().max(200).optional().nullable(),
  content: z.string().min(10).max(10000),
  score: z.number().min(0).max(10).nullable().optional(),
  hasSpoilers: z.boolean().default(false),
  scoreStory: z.number().min(0).max(10).nullable().optional(),
  scoreArt: z.number().min(0).max(10).nullable().optional(),
  scoreCharacters: z.number().min(0).max(10).nullable().optional(),
  scoreWorld: z.number().min(0).max(10).nullable().optional(),
})

const microReviewSchema = z.object({
  manhwaId: z.string().min(1),
  content: z.string().min(1).max(280),
  score: z.number().min(0).max(10).nullable().optional(),
})

export async function createReviewAction(data: {
  manhwaId: string
  title?: string | null
  content: string
  score?: number | null
  hasSpoilers?: boolean
  isMicro?: boolean
  scoreStory?: number | null
  scoreArt?: number | null
  scoreCharacters?: number | null
  scoreWorld?: number | null
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
    title: data.title,
    content: data.content,
    score: data.score,
    isMicro: data.isMicro ?? false,
    hasSpoilers: data.hasSpoilers ?? false,
    scoreStory: data.scoreStory,
    scoreArt: data.scoreArt,
    scoreCharacters: data.scoreCharacters,
    scoreWorld: data.scoreWorld,
  })

  await createActivity({
    userId: user.id,
    type: 'REVIEWED',
    manhwaId: data.manhwaId,
  })

  await recalculateSingleManhwaScore(data.manhwaId)
  revalidateTag(`manhwa-${data.manhwaId}`)
  revalidateTag('reviews')
  revalidatePath('/[locale]/manhwa/[slug]', 'page')
  revalidatePath('/[locale]/manhwa/[slug]/reviews', 'page')
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

  if (liked) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: {
        user_id: true,
        manhwa: { select: { slug: true, title_en: true } },
      },
    })

    if (review && review.user_id !== user.id) {
      const likerInfo = await prisma.user.findUnique({
        where: { id: user.id },
        select: { username: true, display_name: true },
      })

      await createNotification({
        userId: review.user_id,
        type: 'review_liked',
        data: {
          liker_id: user.id,
          liker_username: likerInfo?.username ?? null,
          liker_display_name: likerInfo?.display_name ?? null,
          review_id: reviewId,
          manhwa_slug: review.manhwa.slug,
          manhwa_title: review.manhwa.title_en,
        },
      })
    }
  }

  revalidatePath('/[locale]/manhwa/[slug]', 'page')
  return { success: true, liked }
}

export async function toggleDislikeAction(reviewId: string) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const disliked = await toggleReviewDislike(user.id, reviewId)
  revalidatePath('/[locale]/manhwa/[slug]', 'page')
  return { success: true, disliked }
}

const VALID_REACTIONS: KoreanReaction[] = ['HEOL', 'DAEBAK', 'GAMDONG', 'KINGBAT', 'MICHYEO', 'JUKGET']

export async function toggleReactionAction(reviewId: string, reaction: KoreanReaction) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  if (!VALID_REACTIONS.includes(reaction)) return { error: 'Invalid reaction' }

  const added = await toggleReaction(user.id, reviewId, reaction)
  revalidatePath('/[locale]/manhwa/[slug]', 'page')
  return { success: true, added }
}
