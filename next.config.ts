import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's4.anilist.co',
      },
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
      },
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net',
      },
      {
        protocol: 'https',
        hostname: 'uploads.mangadex.org',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
