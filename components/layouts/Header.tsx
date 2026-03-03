'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import { NotificationBell } from '@/components/features/NotificationBell'

export function Header() {
  const t = useTranslations('nav')
  const { locale } = useParams<{ locale: string }>()
  const pathname = usePathname()
  const { user, loading, signOut } = useAuth()

  const otherLocale = locale === 'fr' ? 'en' : 'fr'
  // Replace current locale prefix with the other locale
  const switchedPath = pathname.replace(/^\/[a-z]{2}/, `/${otherLocale}`)

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(0,255,255,0.07)] bg-[rgba(6,6,9,0.85)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="font-display text-2xl tracking-widest text-[#00ffff] drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]"
        >
          ManhwaVerse
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href={`/${locale}/explore`}
            className="text-xs font-medium uppercase tracking-widest text-[#9999b8] transition-colors hover:text-[#00ffff]"
          >
            {t('discover')}
          </Link>

          {/* Browse dropdown */}
          <div className="group relative">
            <button className="text-xs font-medium uppercase tracking-widest text-[#9999b8] transition-colors hover:text-[#00ffff]">
              {t('browse')}
            </button>
            <div className="absolute left-0 top-full z-50 hidden min-w-[160px] rounded-lg border border-[rgba(0,255,255,0.12)] bg-[#0d0d16] p-1 shadow-lg group-hover:block">
              <Link
                href={`/${locale}/people`}
                className="block rounded-md px-3 py-2 text-sm text-[#9999b8] transition-colors hover:bg-[rgba(0,255,255,0.06)] hover:text-[#00ffff]"
              >
                {t('people')}
              </Link>
              <Link
                href={`/${locale}/character`}
                className="block rounded-md px-3 py-2 text-sm text-[#9999b8] transition-colors hover:bg-[rgba(0,255,255,0.06)] hover:text-[#00ffff]"
              >
                {t('characters')}
              </Link>
              <Link
                href={`/${locale}/publisher`}
                className="block rounded-md px-3 py-2 text-sm text-[#9999b8] transition-colors hover:bg-[rgba(0,255,255,0.06)] hover:text-[#00ffff]"
              >
                {t('publishers')}
              </Link>
            </div>
          </div>

          <Link
            href={`/${locale}/news`}
            className="text-xs font-medium uppercase tracking-widest text-[#9999b8] transition-colors hover:text-[#00ffff]"
          >
            {t('news')}
          </Link>

          {/* Community dropdown */}
          <div className="group relative">
            <button className="text-xs font-medium uppercase tracking-widest text-[#9999b8] transition-colors hover:text-[#00ffff]">
              {t('community')}
            </button>
            <div className="absolute left-0 top-full z-50 hidden min-w-[160px] rounded-lg border border-[rgba(0,255,255,0.12)] bg-[#0d0d16] p-1 shadow-lg group-hover:block">
              <Link
                href={`/${locale}/blog`}
                className="block rounded-md px-3 py-2 text-sm text-[#9999b8] transition-colors hover:bg-[rgba(0,255,255,0.06)] hover:text-[#00ffff]"
              >
                {t('blog')}
              </Link>
              <Link
                href={`/${locale}/members`}
                className="block rounded-md px-3 py-2 text-sm text-[#9999b8] transition-colors hover:bg-[rgba(0,255,255,0.06)] hover:text-[#00ffff]"
              >
                {t('members')}
              </Link>
              <Link
                href={`/${locale}/lists`}
                className="block rounded-md px-3 py-2 text-sm text-[#9999b8] transition-colors hover:bg-[rgba(0,255,255,0.06)] hover:text-[#00ffff]"
              >
                {t('lists')}
              </Link>
              <Link
                href={`/${locale}/artwork`}
                className="block rounded-md px-3 py-2 text-sm text-[#9999b8] transition-colors hover:bg-[rgba(0,255,255,0.06)] hover:text-[#00ffff]"
              >
                {t('artwork')}
              </Link>
              <Link
                href={`/${locale}/challenge/${new Date().getFullYear()}`}
                className="block rounded-md px-3 py-2 text-sm text-[#9999b8] transition-colors hover:bg-[rgba(0,255,255,0.06)] hover:text-[#00ffff]"
              >
                {t('challenge')}
              </Link>
            </div>
          </div>
          {user && (
            <>
              <Link
                href={`/${locale}/library`}
                className="text-xs font-medium uppercase tracking-widest text-[#9999b8] transition-colors hover:text-[#00ffff]"
              >
                {t('library')}
              </Link>
            </>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Locale switcher */}
          <Link
            href={switchedPath}
            className="rounded-md px-2 py-1 text-xs font-medium uppercase tracking-widest text-[#6b6b88] transition-colors hover:text-[#00ffff]"
          >
            {otherLocale}
          </Link>

          {/* Notifications */}
          <NotificationBell />

          {/* Auth */}
          {loading ? (
            <div className="h-8 w-16 animate-pulse rounded-lg bg-[#111120]" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/${locale}/profile`}
                className="text-xs font-medium uppercase tracking-widest text-[#9999b8] transition-colors hover:text-[#00ffff]"
              >
                {t('profile')}
              </Link>
              <button
                onClick={signOut}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-[#9999b8] transition-colors hover:border-[rgba(0,255,255,0.3)] hover:text-[#00ffff]"
              >
                {t('signOut')}
              </button>
            </div>
          ) : (
            <Link
              href={`/${locale}/sign-in`}
              className="rounded-md bg-[#00ffff] px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-black transition-all duration-150 hover:shadow-[0_8px_24px_rgba(0,255,255,0.35)] hover:-translate-y-px"
            >
              {t('signIn')}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
