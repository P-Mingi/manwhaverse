import Image from 'next/image'

interface Props {
  src: string | null | undefined
  username: string | null | undefined
  size?: number
}

export function Avatar({ src, username, size = 32 }: Props) {
  const initials = (username?.[0] ?? '?').toUpperCase()

  if (src) {
    return (
      <Image
        src={src}
        alt={username ?? 'User'}
        width={size}
        height={size}
        style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    )
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-strong)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: 600,
        color: 'var(--text-secondary)',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}
