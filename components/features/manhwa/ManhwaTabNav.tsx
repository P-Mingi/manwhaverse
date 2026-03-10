'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface ManhwaTabNavProps {
  slug: string
  locale: string
  hasCharacters: boolean
  hasStaff: boolean
}

export function ManhwaTabNav({ slug, locale, hasCharacters, hasStaff }: ManhwaTabNavProps) {
  const t = useTranslations('manhwa.tabs')
  const pathname = usePathname()
  const base = `/${locale}/manhwa/${slug}`

  const tabs = [
    { key: 'overview', href: base, label: t('overview') },
    ...(hasCharacters ? [{ key: 'characters', href: `${base}/characters`, label: t('characters') }] : []),
    ...(hasStaff ? [{ key: 'staff', href: `${base}/staff`, label: t('staff') }] : []),
    { key: 'reviews', href: `${base}/reviews`, label: t('reviews') },
    { key: 'stats', href: `${base}/stats`, label: t('stats') },
  ]

  return (
    <nav className="sticky top-0 z-20 border-b border-electric-border bg-void/80 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive =
              tab.key === 'overview'
                ? pathname === base
                : pathname.startsWith(tab.href)

            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-electric text-electric'
                    : 'border-transparent text-text-muted hover:border-electric-border hover:text-text-primary'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
