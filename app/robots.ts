import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/*/settings', '/*/library'],
    },
    sitemap: 'https://manhwaverse.com/sitemap.xml',
  }
}
