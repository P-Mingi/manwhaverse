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
import { MobileNav } from '@/components/layouts/MobileNav'
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

  return {
    title: {
      default: t('defaultTitle'),
      template: `%s | ${t('siteName')}`,
    },
    description: t('defaultDescription'),
    metadataBase: new URL('https://manhwaverse.com'),
    alternates: {
      canonical: '/',
      languages: { en: '/en', fr: '/fr' },
    },
    openGraph: {
      type: 'website',
      siteName: t('siteName'),
      title: t('defaultTitle'),
      description: t('defaultDescription'),
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
    },
    twitter: { card: 'summary_large_image' },
    robots: { index: true, follow: true },
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
      defaultTheme="dark"
      enableSystem={false}
      storageKey="manhwaverse-theme"
    >
      <NextIntlClientProvider messages={messages}>
        <SessionProvider>
          <Header locale={locale} />
          <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
            {children}
          </div>
          <Footer locale={locale} />
          <MobileNav locale={locale} />
        </SessionProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  )
}
