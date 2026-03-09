'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import { NotificationBell } from '@/components/features/NotificationBell'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function Header() {
  const t = useTranslations('nav')
  const { locale } = useParams<{ locale: string }>()
  const pathname = usePathname()
  const { user, loading, signOut } = useAuth()

  const otherLocale = locale === 'fr' ? 'en' : 'fr'
  // Replace current locale prefix with the other locale
  const switchedPath = pathname.replace(/^\/[a-z]{2}/, `/${otherLocale}`)

  return (
    <header className="sticky top-0 z-50 border-b border-electric-border bg-void/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="font-display text-2xl tracking-widest text-electric drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]"
        >
          ManhwaVerse
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-3 md:flex">
          <Link
            href={`/${locale}/explore`}
            className="text-[10px] font-medium uppercase tracking-wide text-text-secondary transition-colors hover:text-electric"
          >
            {t('discover')}
          </Link>

          {/* Browse dropdown */}
          <div className="group relative flex items-center">
            <button className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-text-secondary transition-colors hover:text-electric">
              {t('browse')}
              <svg className="h-2.5 w-2.5 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className="absolute left-0 top-full z-50 hidden min-w-[160px] rounded-lg border border-electric-border bg-card p-1 shadow-lg group-hover:block">
              <Link
                href={`/${locale}/character`}
                className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-electric-glow hover:text-electric"
              >
                {t('characters')}
              </Link>
              <Link
                href={`/${locale}/people`}
                className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-electric-glow hover:text-electric"
              >
                {t('staff')}
              </Link>
              <Link
                href={`/${locale}/publisher`}
                className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-electric-glow hover:text-electric"
              >
                {t('publishers')}
              </Link>
            </div>
          </div>

          <Link
            href={`/${locale}/news`}
            className="text-[10px] font-medium uppercase tracking-wide text-text-secondary transition-colors hover:text-electric"
          >
            {t('news')}
          </Link>


          {/* Community dropdown */}
          <div className="group relative flex items-center">
            <button className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-text-secondary transition-colors hover:text-electric">
              {t('community')}
              <svg className="h-2.5 w-2.5 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className="absolute left-0 top-full z-50 hidden min-w-[160px] rounded-lg border border-electric-border bg-card p-1 shadow-lg group-hover:block">
              <Link
                href={`/${locale}/members`}
                className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-electric-glow hover:text-electric"
              >
                {t('members')}
              </Link>
              <Link
                href={`/${locale}/lists`}
                className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-electric-glow hover:text-electric"
              >
                {t('lists')}
              </Link>
              <Link
                href={`/${locale}/artwork`}
                className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-electric-glow hover:text-electric"
              >
                {t('artwork')}
              </Link>
            </div>
          </div>
          {user && (
            <Link
              href={`/${locale}/library`}
              className="text-[10px] font-medium uppercase tracking-wide text-text-secondary transition-colors hover:text-electric"
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
            className="rounded-md px-2 py-1 text-xs font-medium uppercase tracking-widest text-text-muted transition-colors hover:text-electric"
          >
            {otherLocale}
          </Link>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <NotificationBell />

          {/* Auth */}
          {loading ? (
            <div className="h-8 w-16 animate-pulse rounded-lg bg-elevated" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/${locale}/profile`}
                className="text-[10px] font-medium uppercase tracking-wide text-text-secondary transition-colors hover:text-electric"
              >
                {t('profile')}
              </Link>
              <button
                onClick={signOut}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-electric-border-hover hover:text-electric"
              >
                {t('signOut')}
              </button>
            </div>
          ) : (
            <Link
              href={`/${locale}/sign-in`}
              className="rounded-md bg-electric px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-black transition-all duration-150 hover:-translate-y-px"
            >
              {t('signIn')}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
