'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/client'
import { isAdmin } from '@/lib/auth/session'

async function assertAdmin() {
  const admin = await isAdmin()
  if (!admin) throw new Error('Unauthorized')
}

export async function updateUserAction(userId: string, formData: FormData) {
  await assertAdmin()

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { is_seed: true } })
  if (!user) throw new Error('User not found')

  const display_name = (formData.get('display_name') as string | null)?.trim() || null
  const avatar_url = (formData.get('avatar_url') as string | null)?.trim() || null
  const bio = (formData.get('bio') as string | null)?.trim() || null
  const username = (formData.get('username') as string | null)?.trim() || null

  const updateData: Record<string, unknown> = { display_name, avatar_url, bio }

  if (username && user.is_seed) {
    const existing = await prisma.user.findFirst({
      where: { username, NOT: { id: userId } },
    })
    if (existing) throw new Error('Username already taken')
    updateData.username = username
  }

  await prisma.user.update({ where: { id: userId }, data: updateData })
  revalidatePath('/en/admin/users')
  revalidatePath(`/en/admin/users/${userId}`)
  revalidatePath('/fr/admin/users')
  revalidatePath(`/fr/admin/users/${userId}`)
}

export async function toggleBanAction(userId: string) {
  await assertAdmin()

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { is_banned: true } })
  if (!user) throw new Error('User not found')

  await prisma.user.update({ where: { id: userId }, data: { is_banned: !user.is_banned } })
  revalidatePath('/en/admin/users')
  revalidatePath(`/en/admin/users/${userId}`)
  revalidatePath('/fr/admin/users')
  revalidatePath(`/fr/admin/users/${userId}`)
}

// ── Reviews ─────────────────────────────────────────────────────────────────

export async function updateReviewAction(reviewId: string, formData: FormData) {
  await assertAdmin()

  const title = (formData.get('title') as string | null)?.trim() || null
  const content = (formData.get('content') as string | null)?.trim()
  const scoreRaw = formData.get('score') as string | null
  const score = scoreRaw ? parseFloat(scoreRaw) : null
  const has_spoilers = formData.get('has_spoilers') === 'on'

  if (!content || content.length < 1) throw new Error('Content is required')

  await prisma.review.update({
    where: { id: reviewId },
    data: { title, content, score: score !== null && !isNaN(score) ? score : null, has_spoilers },
  })

  revalidatePath('/en/admin/reviews')
  revalidatePath(`/en/admin/reviews/${reviewId}`)
  revalidatePath('/fr/admin/reviews')
  revalidatePath(`/fr/admin/reviews/${reviewId}`)
}

export async function softDeleteReviewAction(reviewId: string) {
  await assertAdmin()
  await prisma.review.update({ where: { id: reviewId }, data: { deleted_at: new Date() } })
  revalidatePath('/en/admin/reviews')
  revalidatePath(`/en/admin/reviews/${reviewId}`)
  revalidatePath('/fr/admin/reviews')
  revalidatePath(`/fr/admin/reviews/${reviewId}`)
}

export async function restoreReviewAction(reviewId: string) {
  await assertAdmin()
  await prisma.review.update({ where: { id: reviewId }, data: { deleted_at: null } })
  revalidatePath('/en/admin/reviews')
  revalidatePath(`/en/admin/reviews/${reviewId}`)
  revalidatePath('/fr/admin/reviews')
  revalidatePath(`/fr/admin/reviews/${reviewId}`)
}

export async function hardDeleteReviewAction(reviewId: string) {
  await assertAdmin()
  // Remove related records first to avoid FK constraint errors
  await prisma.reviewLike.deleteMany({ where: { review_id: reviewId } })
  await prisma.reviewDislike.deleteMany({ where: { review_id: reviewId } })
  await prisma.reviewReaction.deleteMany({ where: { review_id: reviewId } })
  await prisma.review.delete({ where: { id: reviewId } })
  revalidatePath('/en/admin/reviews')
  revalidatePath('/fr/admin/reviews')
}
