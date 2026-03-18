import Link from 'next/link'

interface Props {
  title: string
  href?: string
  seeAllLabel?: string
}

export function SectionHeader({ title, href, seeAllLabel = 'See all →' }: Props) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '14px',
    }}>
      <h2 style={{
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--text-secondary)',
        margin: 0,
      }}>
        {title}
      </h2>
      {href && (
        <Link href={href} style={{
          fontSize: '12px',
          color: 'var(--accent)',
          fontWeight: 600,
          textDecoration: 'none',
        }}>
          {seeAllLabel}
        </Link>
      )}
    </div>
  )
}
