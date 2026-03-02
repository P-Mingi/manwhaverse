'use client'

import { useState } from 'react'
import { RankBadge } from '@/components/features/RankBadge'
import { formatScore } from '@/lib/utils/formatScore'
import type { Rank } from '@/lib/scores/ranks'

interface ScoreCardProps {
  score: number
  source: string
  rank: Rank | null
  detail: string | null
}

export function ScoreCard({ score, source, rank, detail }: ScoreCardProps) {
  const [showDetail, setShowDetail] = useState(false)

  return (
    <button
      type="button"
      onClick={() => detail && setShowDetail((v) => !v)}
      className="flex items-center gap-3 rounded-xl bg-white/[0.04] border border-white/[0.06] px-4 py-2.5 transition-colors hover:bg-white/[0.07] cursor-pointer text-left"
    >
      <div className="flex flex-col items-center">
        <span className="font-mono text-2xl font-bold text-text-primary leading-none">
          {formatScore(score)}
        </span>
        <span className="mt-0.5 text-[10px] uppercase tracking-wider text-text-muted">
          {source}
        </span>
      </div>
      {rank && <RankBadge rank={rank} />}
      {showDetail && detail && (
        <span className="text-xs text-text-muted">{detail}</span>
      )}
    </button>
  )
}
