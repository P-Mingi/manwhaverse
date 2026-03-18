import Link from 'next/link'

interface Props {
  locale: string
}

export function MatureGate({ locale }: Props) {
  return (
    <div
      style={{
        maxWidth: 480,
        margin: '4rem auto',
        padding: '2rem',
        textAlign: 'center',
      }}
      className="card"
    >
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔞</div>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        {locale === 'fr' ? 'Contenu adulte' : 'Mature Content'}
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '1.5rem' }}>
        {locale === 'fr'
          ? 'Ce titre est réservé aux adultes. Connectez-vous et activez le contenu adulte dans vos paramètres.'
          : 'This title is for adults only. Sign in and enable adult content in your settings to view.'}
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href={`/${locale}/sign-in`} className="btn-primary" style={{ textDecoration: 'none' }}>
          {locale === 'fr' ? 'Se connecter' : 'Sign in'}
        </Link>
        <Link href={`/${locale}/settings`} className="btn-secondary" style={{ textDecoration: 'none' }}>
          {locale === 'fr' ? 'Paramètres' : 'Settings'}
        </Link>
      </div>
    </div>
  )
}
