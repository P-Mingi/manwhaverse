interface Props {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  className?: string
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 6, className }: Props) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        background: 'var(--bg-elevated)',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
  )
}
