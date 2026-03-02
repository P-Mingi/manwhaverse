import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/*/settings', '/*/library'],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://manhwaverse.com'}/sitemap.xml`,
  }
}
