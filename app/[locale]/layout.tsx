import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import type { Locale } from '@/i18n/routing'
import { ThemeProvider } from 'next-themes'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { Header } from '@/components/layouts/Header'
import { Footer } from '@/components/layouts/Footer'

interface LocaleLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://manhwaverse.com'

  return {
    title: {
      default: t('defaultTitle'),
      template: `%s | ManhwaVerse`,
    },
    description: t('defaultDescription'),
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        fr: '/fr',
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'ManhwaVerse',
      title: t('defaultTitle'),
      description: t('ogDescription'),
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      url: `${baseUrl}/${locale}`,
      images: [
        {
          url: '/opengraph-image.svg',
          width: 1200,
          height: 630,
          alt: "ManhwaVerse - Track every manhwa you've ever loved",
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('defaultTitle'),
      description: t('ogDescription'),
      images: ['/twitter-image.svg'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
      },
    },
  }
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params

  if (!routing.locales.includes(locale as Locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={false}
      storageKey="manhwaverse-theme"
    >
      <NextIntlClientProvider messages={messages}>
        <SessionProvider>
          <Header locale={locale} />
          <div style={{ minHeight: '100vh' }}>
            {children}
          </div>
          <Footer locale={locale} />
        </SessionProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  )
}
