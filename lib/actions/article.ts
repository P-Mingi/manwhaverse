'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth/session'
import { createUserArticle } from '@/lib/db/article'
import { prisma } from '@/lib/db/client'
import type { ArticleCategory } from '@prisma/client'

const VALID_CATEGORIES: ArticleCategory[] = ['GUIDE', 'LIST', 'OPINION', 'ANALYSIS']
const MODERATOR_USERNAMES = (process.env.MODERATOR_USERNAMES ?? '').split(',').map((u) => u.trim()).filter(Boolean)

export async function submitArticle(formData: FormData) {
  const user = await getUser()
  if (!user?.id) redirect('/sign-in')

  const title_en = (formData.get('title_en') as string)?.trim()
  const title_fr = (formData.get('title_fr') as string)?.trim() || undefined
  const content_en = (formData.get('content_en') as string)?.trim()
  const content_fr = (formData.get('content_fr') as string)?.trim() || undefined
  const excerpt_en = (formData.get('excerpt_en') as string)?.trim() || undefined
  const excerpt_fr = (formData.get('excerpt_fr') as string)?.trim() || undefined
  const cover_image_url = (formData.get('cover_image_url') as string)?.trim() || undefined
  const category = formData.get('category') as ArticleCategory

  if (!title_en || !content_en || !VALID_CATEGORIES.includes(category)) {
    throw new Error('Missing required fields')
  }

  const authorName = user.display_name ?? user.name ?? user.username ?? 'Anonymous'

  const article = await createUserArticle({
    userId: user.id,
    authorName,
    title_en,
    title_fr,
    content_en,
    content_fr,
    excerpt_en,
    excerpt_fr,
    cover_image_url,
    category,
  })

  // Notify all blog moderators
  if (MODERATOR_USERNAMES.length > 0) {
    const moderators = await prisma.user.findMany({
      where: { username: { in: MODERATOR_USERNAMES } },
      select: { id: true },
    })
    if (moderators.length > 0) {
      await prisma.notification.createMany({
        data: moderators.map((mod) => ({
          user_id: mod.id,
          type: 'new_draft_article',
          data: {
            article_id: article.id,
            article_slug: article.slug,
            article_title: title_en,
            author_username: user.username ?? authorName,
          },
        })),
        skipDuplicates: true,
      })
    }
  }

  redirect('/blog/my-articles')
}

export async function deleteOwnArticle(articleId: string) {
  const user = await getUser()
  if (!user?.id) throw new Error('Unauthorized')

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { user_id: true, status: true },
  })

  if (!article || article.user_id !== user.id || article.status === 'PUBLISHED') {
    throw new Error('Cannot delete this article')
  }

  await prisma.article.delete({ where: { id: articleId } })
  revalidatePath('/blog/my-articles')
}
