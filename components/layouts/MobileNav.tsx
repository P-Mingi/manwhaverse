'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  locale: string
}

export function MobileNav({ locale }: Props) {
  const pathname = usePathname()

  const links = [
    { href: `/${locale}`, label: 'Home', icon: '🏠' },
    { href: `/${locale}/explore`, label: locale === 'fr' ? 'Découvrir' : 'Discover', icon: '🔍' },
    { href: `/${locale}/top`, label: locale === 'fr' ? 'Top' : 'Top', icon: '📊' },
    { href: `/${locale}/library`, label: locale === 'fr' ? 'Biblio' : 'Library', icon: '📚' },
  ]

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        padding: '0.5rem 0 max(0.5rem, env(safe-area-inset-bottom))',
      }}
    >
      {links.map(({ href, label, icon }) => {
        const active = pathname === href || (href !== `/${locale}` && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '0.25rem',
              textDecoration: 'none',
              color: active ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: '9px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              transition: 'color 150ms',
            }}
          >
            <span style={{ fontSize: '18px' }}>{icon}</span>
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
