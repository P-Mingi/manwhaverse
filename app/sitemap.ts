import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/db/client'

const BASE_URL = 'https://manhwaverse.com'
const LOCALES = ['en', 'fr']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [manhwas, genres, tropes, articles] = await Promise.all([
    prisma.manhwa.findMany({
      where: { is_published: true, deleted_at: null },
      select: { slug: true, updated_at: true },
    }),
    prisma.genre.findMany({ select: { slug: true } }),
    prisma.trope.findMany({ select: { slug: true } }),
    prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, published_at: true },
    }),
  ])

  const entries: MetadataRoute.Sitemap = []

  // Static pages
  for (const locale of LOCALES) {
    entries.push(
      {
        url: `${BASE_URL}/${locale}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/${locale}/search`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/${locale}/genre`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/${locale}/trope`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
    )
  }

  // Manhwa pages
  for (const manhwa of manhwas) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}/manhwa/${manhwa.slug}`,
        lastModified: manhwa.updated_at,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  }

  // Genre pages
  for (const genre of genres) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}/genre/${genre.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  }

  // Trope pages
  for (const trope of tropes) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}/trope/${trope.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  }

  // Blog pages
  for (const locale of LOCALES) {
    entries.push({
      url: `${BASE_URL}/${locale}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    })
  }

  for (const article of articles) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${article.slug}`,
        lastModified: article.published_at ?? new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  }

  return entries
}
