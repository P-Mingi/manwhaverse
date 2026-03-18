'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  locale: string
  isLoggedIn: boolean
}

export function MobileMenuButton({ locale, isLoggedIn }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const links = [
    { href: `/${locale}`, label: locale === 'fr' ? 'Accueil' : 'Home' },
    { href: `/${locale}/explore`, label: locale === 'fr' ? 'Découvrir' : 'Discover' },
    { href: `/${locale}/top`, label: locale === 'fr' ? 'Classement' : 'Rankings' },
    { href: `/${locale}/lists`, label: 'Lists' },
    ...(isLoggedIn ? [{ href: `/${locale}/library`, label: locale === 'fr' ? 'Bibliothèque' : 'Library' }] : []),
  ]

  const isActive = (href: string) =>
    href === `/${locale}` ? pathname === href : pathname.startsWith(href)

  return (
    <div style={{ position: 'relative' }} className="flex md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen((p) => !p)}
        aria-label="Menu"
        aria-expanded={open}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          padding: '6px',
          cursor: 'pointer',
          background: 'none',
          border: 'none',
        }}
      >
        <span style={{
          display: 'block', width: '18px', height: '2px',
          background: 'var(--text-secondary)',
          borderRadius: '1px',
          transition: 'transform 150ms',
          transform: open ? 'rotate(45deg) translate(4px, 4px)' : 'none',
        }} />
        <span style={{
          display: 'block', width: '18px', height: '2px',
          background: 'var(--text-secondary)',
          borderRadius: '1px',
          opacity: open ? 0 : 1,
          transition: 'opacity 150ms',
        }} />
        <span style={{
          display: 'block', width: '18px', height: '2px',
          background: 'var(--text-secondary)',
          borderRadius: '1px',
          transition: 'transform 150ms',
          transform: open ? 'rotate(-45deg) translate(4px, -4px)' : 'none',
        }} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 198 }}
            onClick={() => setOpen(false)}
          />
          {/* Dropdown panel */}
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            zIndex: 199,
            minWidth: '200px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          }}>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                style={{
                  display: 'block',
                  padding: '11px 16px',
                  fontSize: '13px',
                  fontWeight: isActive(link.href) ? 700 : 500,
                  color: isActive(link.href) ? 'var(--accent)' : 'var(--text-primary)',
                  borderBottom: '1px solid var(--border)',
                  textDecoration: 'none',
                  background: isActive(link.href) ? 'var(--accent-muted)' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            ))}
            {!isLoggedIn && (
              <Link
                href={`/${locale}/sign-in`}
                onClick={() => setOpen(false)}
                style={{
                  display: 'block',
                  padding: '11px 16px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--accent)',
                  textDecoration: 'none',
                  background: 'var(--accent-muted)',
                }}
              >
                {locale === 'fr' ? 'Connexion' : 'Sign in'}
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  )
}
