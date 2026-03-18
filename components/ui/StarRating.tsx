interface Props {
  score: number | null
  count?: number
  size?: 'sm' | 'md'
}

export function StarRating({ score, count, size = 'md' }: Props) {
  if (!score) return null
  const stars = score / 2 // convert 0-10 to 0-5
  const filled = Math.round(stars)
  const fontSize = size === 'sm' ? '11px' : '14px'

  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ color: 'var(--star)', fontSize }}>
        {'★'.repeat(filled)}
        {'☆'.repeat(5 - filled)}
      </span>
      <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
        {score.toFixed(1)}
        {count ? ` · ${count.toLocaleString()}` : ''}
      </span>
    </span>
  )
}
