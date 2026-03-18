import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/db/client'

export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://manhwaverse.com'
const LOCALES = ['en', 'fr']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [manhwas, genres] = await Promise.all([
    prisma.manhwa.findMany({
      where: { is_published: true, deleted_at: null },
      select: { slug: true, updated_at: true },
    }),
    prisma.genre.findMany({ select: { slug: true } }),
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
        url: `${BASE_URL}/${locale}/explore`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/${locale}/top`,
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
        url: `${BASE_URL}/${locale}/lists`,
        lastModified: new Date(),
        changeFrequency: 'daily',
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

  return entries
}
