'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/client'
import { getUser, isAdmin } from '@/lib/auth/session'
import { MODERATOR_USERNAMES } from '@/lib/auth/moderators'

async function requireAdmin() {
  if (!(await isAdmin())) throw new Error('Unauthorized')
  const user = await getUser()
  return user!
}

async function requireBlogModerator() {
  const user = await getUser()
  const adminOk = await isAdmin()
  const isModerator = user?.username && MODERATOR_USERNAMES.includes(user.username)
  if (!user || (!adminOk && !isModerator)) {
    throw new Error('Unauthorized')
  }
  return user
}

// ── Admin-only (news + general) ─────────────────────────────────────────────

export async function publishArticle(articleId: string) {
  await requireAdmin()
  await prisma.article.update({
    where: { id: articleId },
    data: { status: 'PUBLISHED', published_at: new Date() },
  })
  revalidatePath('/[locale]/admin/news', 'page')
  revalidatePath('/[locale]/admin/blog', 'page')
  revalidatePath('/[locale]/news', 'page')
  revalidatePath('/[locale]/blog', 'page')
}

export async function archiveArticle(articleId: string) {
  await requireAdmin()
  await prisma.article.update({
    where: { id: articleId },
    data: { status: 'ARCHIVED' },
  })
  revalidatePath('/[locale]/admin/news', 'page')
}

export async function deleteArticle(articleId: string) {
  await requireAdmin()
  await prisma.article.delete({ where: { id: articleId } })
  revalidatePath('/[locale]/admin/news', 'page')
  revalidatePath('/[locale]/admin/blog', 'page')
}

// ── Blog moderation (admin OR moderator) ────────────────────────────────────

export async function publishUserArticle(articleId: string) {
  await requireBlogModerator()
  await prisma.article.update({
    where: { id: articleId },
    data: { status: 'PUBLISHED', published_at: new Date() },
  })
  revalidatePath('/[locale]/admin/blog', 'page')
  revalidatePath('/[locale]/blog', 'page')
}

export async function rejectArticle(articleId: string) {
  await requireBlogModerator()
  await prisma.article.update({
    where: { id: articleId },
    data: { status: 'ARCHIVED' },
  })
  revalidatePath('/[locale]/admin/blog', 'page')
}

export async function deleteUserArticle(articleId: string) {
  await requireBlogModerator()
  await prisma.article.delete({ where: { id: articleId } })
  revalidatePath('/[locale]/admin/blog', 'page')
}

// ── Article editing (admin-only) ─────────────────────────────────────────────

export async function updateArticle(articleId: string, data: {
  title_en: string
  title_fr?: string
  content_en: string
  content_fr?: string
  excerpt_en?: string
  excerpt_fr?: string
  cover_image_url?: string
}) {
  await requireAdmin()
  await prisma.article.update({
    where: { id: articleId },
    data: {
      title_en: data.title_en,
      title_fr: data.title_fr || null,
      content_en: data.content_en,
      content_fr: data.content_fr || null,
      excerpt_en: data.excerpt_en || null,
      excerpt_fr: data.excerpt_fr || null,
      cover_image_url: data.cover_image_url || null,
    },
  })
  revalidatePath('/[locale]/news', 'page')
  revalidatePath('/[locale]/blog', 'page')
}
