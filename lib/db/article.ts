import { prisma } from './client'
import type { ArticleCategory } from '@prisma/client'

const articleSelect = {
  id: true,
  slug: true,
  title_en: true,
  title_fr: true,
  content_en: true,
  content_fr: true,
  excerpt_en: true,
  excerpt_fr: true,
  cover_image_url: true,
  category: true,
  status: true,
  author_name: true,
  reading_time: true,
  view_count: true,
  published_at: true,
  created_at: true,
  manhwa_links: {
    include: {
      manhwa: {
        select: {
          id: true,
          slug: true,
          title_en: true,
          title_fr: true,
          cover_url: true,
        },
      },
    },
  },
} as const

export type ArticleData = Awaited<ReturnType<typeof getArticleBySlug>>

export async function getPublishedArticles(
  page = 1,
  limit = 20,
  category?: ArticleCategory
) {
  const where = {
    status: 'PUBLISHED' as const,
    ...(category ? { category } : {}),
  }
  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      select: articleSelect,
      orderBy: { published_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.article.count({ where }),
  ])
  return { articles, total }
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findUnique({
    where: { slug, status: 'PUBLISHED' },
    select: articleSelect,
  })
}

export async function getArticlesForManhwa(manhwaId: string) {
  return prisma.article.findMany({
    where: {
      status: 'PUBLISHED',
      manhwa_links: { some: { manhwa_id: manhwaId } },
    },
    select: {
      id: true,
      slug: true,
      title_en: true,
      title_fr: true,
      excerpt_en: true,
      excerpt_fr: true,
      category: true,
      published_at: true,
    },
    orderBy: { published_at: 'desc' },
    take: 5,
  })
}

export async function incrementArticleViews(articleId: string) {
  await prisma.article.update({
    where: { id: articleId },
    data: { view_count: { increment: 1 } },
  })
}
