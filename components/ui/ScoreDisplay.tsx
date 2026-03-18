interface Props {
  score: number | null
  phase?: string | null
  count?: number
  size?: 'sm' | 'md' | 'lg'
}

export function ScoreDisplay({ score, phase, count, size = 'md' }: Props) {
  if (!score) return null

  const fontSize = size === 'lg' ? '2rem' : size === 'md' ? '1.25rem' : '1rem'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontSize, fontWeight: 700, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
        {score.toFixed(1)}
      </span>
      {count != null && (
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          {count.toLocaleString()} votes
        </span>
      )}
      {phase && (
        <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {phase}
        </span>
      )}
    </div>
  )
}
