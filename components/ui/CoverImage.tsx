import Image from 'next/image'

interface Props {
  src: string | null
  alt: string
  size: 'thumb' | 'card' | 'hero'
  className?: string
  priority?: boolean
}

const sizeMap = {
  thumb: { width: 48, height: 68, sizes: '48px' },
  card: { width: 180, height: 256, sizes: '(max-width: 640px) 120px, 180px' },
  hero: { width: 280, height: 400, sizes: '(max-width: 640px) 160px, 280px' },
}

const fluidSizes = new Set<keyof typeof sizeMap>(['card', 'hero'])

export function CoverImage({ src, alt, size, className, priority }: Props) {
  const dims = sizeMap[size]
  const fluid = fluidSizes.has(size)
  if (!src) {
    return (
      <div
        style={{
          width: fluid ? '100%' : dims.width,
          aspectRatio: `${dims.width} / ${dims.height}`,
          background: 'var(--bg-elevated)',
          borderRadius: 8,
          flexShrink: 0,
        }}
      />
    )
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={dims.width}
      height={dims.height}
      sizes={dims.sizes}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      style={{
        objectFit: 'cover',
        borderRadius: 8,
        display: 'block',
        ...(fluid ? { width: '100%', height: 'auto', aspectRatio: `${dims.width} / ${dims.height}` } : {}),
      }}
      className={className}
    />
  )
}
