import type { Rank } from '@/lib/scores/ranks'

interface RankBadgeProps {
  rank: Rank
  compact?: boolean
}

export function RankBadge({ rank, compact = false }: RankBadgeProps) {
  const isHighRank = rank.slug === 's-rank' || rank.slug === 'ss-rank' || rank.slug === 'sss-rank'

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-display text-[10px] font-bold ${isHighRank ? 'animate-rank-glow shadow-[0_0_16px_rgba(0,255,255,0.6)]' : ''}`}
        style={{
          color: rank.color,
          borderColor: rank.color,
          borderWidth: '1px',
          backgroundColor: `color-mix(in srgb, ${rank.color} 22%, rgb(8 8 12 / 0.85))`,
          ['--rank-glow' as string]: rank.colorGlow,
        }}
      >
        {rank.label}
      </span>
    )
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 font-display text-xs font-bold ${isHighRank ? 'animate-rank-glow shadow-[0_0_16px_rgba(0,255,255,0.6)]' : ''}`}
      style={{
        color: rank.color,
        borderColor: rank.color,
        borderWidth: '1px',
        backgroundColor: `color-mix(in srgb, ${rank.color} 12%, transparent)`,
        ['--rank-glow' as string]: rank.colorGlow,
      }}
    >
      <span>{rank.label}</span>
      <span className="opacity-60">{rank.labelKr}</span>
    </div>
  )
}
