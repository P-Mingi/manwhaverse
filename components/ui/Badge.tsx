import type { CSSProperties } from 'react'

type Variant = 'status' | 'genre' | 'type' | 'accent' | 'danger'

const variantStyles: Record<Variant, CSSProperties> = {
  status: { background: 'var(--accent-muted)', color: 'var(--accent)' },
  genre: { background: 'var(--bg-elevated)', color: 'var(--text-secondary)' },
  type: { background: 'var(--bg-elevated)', color: 'var(--text-muted)' },
  accent: { background: 'var(--accent)', color: 'var(--accent-text)' },
  danger: { background: 'var(--danger-muted)', color: 'var(--danger)' },
}

interface Props {
  children: React.ReactNode
  variant?: Variant
  className?: string
}

export function Badge({ children, variant = 'genre', className }: Props) {
  return (
    <span
      className={className}
      style={{
        ...variantStyles[variant],
        fontSize: '10px',
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: 20,
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
        display: 'inline-block',
      }}
    >
      {children}
    </span>
  )
}
