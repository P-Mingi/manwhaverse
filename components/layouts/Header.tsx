'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'

export function Header() {
  const t = useTranslations('nav')
  const { locale } = useParams<{ locale: string }>()
  const pathname = usePathname()
  const { user, loading, signOut } = useAuth()

  const otherLocale = locale === 'fr' ? 'en' : 'fr'
  // Replace current locale prefix with the other locale
  const switchedPath = pathname.replace(/^\/[a-z]{2}/, `/${otherLocale}`)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-base/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="font-display text-lg font-bold tracking-tight text-text-primary"
        >
          ManhwaVerse
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href={`/${locale}`}
            className="text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            {t('home')}
          </Link>
          <Link
            href={`/${locale}/search`}
            className="text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            {t('search')}
          </Link>
          {user && (
            <Link
              href={`/${locale}/library`}
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              {t('library')}
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Locale switcher */}
          <Link
            href={switchedPath}
            className="rounded-md px-2 py-1 text-xs font-medium uppercase text-text-muted transition-colors hover:text-text-primary"
          >
            {otherLocale}
          </Link>

          {/* Auth */}
          {loading ? (
            <div className="h-8 w-16 animate-pulse rounded-lg bg-elevated" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/${locale}/profile`}
                className="text-sm text-text-secondary transition-colors hover:text-text-primary"
              >
                {t('profile')}
              </Link>
              <button
                onClick={signOut}
                className="rounded-lg bg-elevated px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-border hover:text-text-primary"
              >
                {t('signOut')}
              </button>
            </div>
          ) : (
            <Link
              href={`/${locale}/sign-in`}
              className="rounded-lg bg-crystal-blue px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-crystal-blue/90"
            >
              {t('signIn')}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
