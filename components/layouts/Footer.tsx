import Link from 'next/link'

export function Footer({ locale }: { locale: string }) {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        padding: '2rem 1rem',
        marginTop: '4rem',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <span
          className="font-display"
          style={{ color: 'var(--accent)', fontSize: '1rem', letterSpacing: '0.08em' }}
        >
          ManhwaVerse
        </span>

        <nav style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            { href: `/${locale}/explore`, label: locale === 'fr' ? 'Explorer' : 'Explore' },
            { href: `/${locale}/top`, label: locale === 'fr' ? 'Classement' : 'Rankings' },
            { href: `/${locale}/lists`, label: 'Lists' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
          © {new Date().getFullYear()} ManhwaVerse
        </p>
      </div>
    </footer>
  )
}
