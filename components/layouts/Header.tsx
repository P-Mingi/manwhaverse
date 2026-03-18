import Link from 'next/link'
import { getUser } from '@/lib/auth/session'
import { ThemeToggle } from './ThemeToggle'
import { NotificationBell } from './NotificationBell'
import { AvatarDropdown } from './AvatarDropdown'
import { MobileMenuButton } from './MobileMenuButton'

export async function Header({ locale }: { locale: string }) {
  const user = await getUser()
  const otherLocale = locale === 'fr' ? 'en' : 'fr'

  const navLinks = [
    { href: `/${locale}/explore`, label: locale === 'fr' ? 'Découvrir' : 'Discover' },
    { href: `/${locale}/top`, label: locale === 'fr' ? 'Classement' : 'Rankings' },
    { href: `/${locale}/lists`, label: 'Lists' },
  ]

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        height: 56,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 1rem',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="font-display"
          style={{
            color: 'var(--accent)',
            fontSize: '1.25rem',
            textDecoration: 'none',
            letterSpacing: '0.08em',
            flexShrink: 0,
          }}
        >
          ManhwaVerse
        </Link>

        {/* Desktop nav — hidden on mobile, flex on md+ */}
        <nav
          className="hidden md:flex"
          style={{ gap: '0.25rem', flex: 1 }}
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                padding: '0.375rem 0.75rem',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                borderRadius: 6,
                transition: 'color 150ms',
              }}
            >
              {label}
            </Link>
          ))}
          {user && (
            <Link
              href={`/${locale}/library`}
              style={{
                padding: '0.375rem 0.75rem',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                borderRadius: 6,
              }}
            >
              {locale === 'fr' ? 'Bibliothèque' : 'Library'}
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0, marginLeft: 'auto' }}>
          <Link
            href={`/${otherLocale}`}
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textDecoration: 'none',
              letterSpacing: '0.05em',
            }}
          >
            {otherLocale.toUpperCase()}
          </Link>
          <ThemeToggle />
          {user ? (
            <>
              <NotificationBell locale={locale} />
              <AvatarDropdown user={user} locale={locale} />
            </>
          ) : (
            <Link
              href={`/${locale}/sign-in`}
              className="btn-primary hidden md:inline-flex"
              style={{ textDecoration: 'none', fontSize: '12px' }}
            >
              {locale === 'fr' ? 'Connexion' : 'Sign in'}
            </Link>
          )}

          {/* Hamburger — mobile only */}
          <MobileMenuButton locale={locale} isLoggedIn={!!user} />
        </div>
      </div>
    </header>
  )
}
