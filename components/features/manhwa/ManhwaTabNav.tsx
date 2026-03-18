'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  slug: string
  locale: string
}

export function ManhwaTabNav({ slug, locale }: Props) {
  const pathname = usePathname()
  const base = `/${locale}/manhwa/${slug}`

  const tabs = [
    { href: base, label: locale === 'fr' ? 'Aperçu' : 'Overview' },
    { href: `${base}/reviews`, label: locale === 'fr' ? 'Avis' : 'Reviews' },
    { href: `${base}/characters`, label: locale === 'fr' ? 'Personnages' : 'Characters' },
    { href: `${base}/staff`, label: 'Staff' },
  ]

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        overflowX: 'auto',
      }}
    >
      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '0 1rem' }}>
        <nav style={{ display: 'flex', gap: 0 }}>
          {tabs.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                style={{
                  padding: '0.875rem 1rem',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  whiteSpace: 'nowrap',
                  transition: 'color 150ms',
                }}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
