import { prisma } from './client'
import type { Prisma } from '@prisma/client'

const reviewWithUser = {
  user: {
    select: {
      id: true,
      username: true,
      display_name: true,
      avatar_url: true,
    },
  },
} satisfies Prisma.ReviewInclude

export type ReviewWithUser = Prisma.ReviewGetPayload<{
  include: typeof reviewWithUser
}>

export async function getReviewsForManhwa(
  manhwaId: string,
  sortBy: 'popular' | 'recent' = 'popular',
  page = 1,
  limit = 10
): Promise<{ reviews: ReviewWithUser[]; total: number }> {
  const where = {
    manhwa_id: manhwaId,
    deleted_at: null,
  }

  const orderBy: Prisma.ReviewOrderByWithRelationInput =
    sortBy === 'popular' ? { likes_count: 'desc' } : { created_at: 'desc' }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: reviewWithUser,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.count({ where }),
  ])

  return { reviews, total }
}

export async function getUserReviewForManhwa(userId: string, manhwaId: string) {
  return prisma.review.findFirst({
    where: { user_id: userId, manhwa_id: manhwaId, deleted_at: null },
  })
}

export async function createReview(data: {
  userId: string
  manhwaId: string
  content: string
  score?: number | null
  isMicro: boolean
  hasSpoilers: boolean
}) {
  const review = await prisma.review.create({
    data: {
      user_id: data.userId,
      manhwa_id: data.manhwaId,
      content: data.content,
      score: data.score,
      is_micro: data.isMicro,
      has_spoilers: data.hasSpoilers,
    },
  })

  // Update denormalized review_count
  await prisma.manhwa.update({
    where: { id: data.manhwaId },
    data: {
      review_count: { increment: 1 },
    },
  })

  return review
}

export async function deleteReview(reviewId: string, userId: string) {
  const review = await prisma.review.findFirst({
    where: { id: reviewId, user_id: userId },
  })

  if (!review) return null

  await prisma.review.update({
    where: { id: reviewId },
    data: { deleted_at: new Date() },
  })

  await prisma.manhwa.update({
    where: { id: review.manhwa_id },
    data: { review_count: { decrement: 1 } },
  })

  return review
}

export async function toggleReviewLike(userId: string, reviewId: string) {
  const existing = await prisma.reviewLike.findUnique({
    where: { user_id_review_id: { user_id: userId, review_id: reviewId } },
  })

  if (existing) {
    await prisma.reviewLike.delete({
      where: { user_id_review_id: { user_id: userId, review_id: reviewId } },
    })
    await prisma.review.update({
      where: { id: reviewId },
      data: { likes_count: { decrement: 1 } },
    })
    return false
  } else {
    await prisma.reviewLike.create({
      data: { user_id: userId, review_id: reviewId },
    })
    await prisma.review.update({
      where: { id: reviewId },
      data: { likes_count: { increment: 1 } },
    })
    return true
  }
}
