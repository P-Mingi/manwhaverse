'use client'

import { useTranslations } from 'next-intl'
import { getControversyLevel, type ControversyLevel } from '@/lib/scores/controversy'

const LEVEL_CONFIG: Record<ControversyLevel, { color: string; icon: string }> = {
  consensus: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: '✓' },
  mixed: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: '~' },
  controversial: { color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: '!' },
  very_controversial: { color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: '!!' },
}

interface ControversyBadgeProps {
  stddev: number | null
  scoreCount: number
}

export function ControversyBadge({ stddev, scoreCount }: ControversyBadgeProps) {
  const t = useTranslations('manhwa.controversy')

  if (scoreCount < 20 || stddev == null) return null

  const level = getControversyLevel(stddev)
  const config = LEVEL_CONFIG[level]

  return (
    <div className="rounded-lg bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold text-text-muted uppercase tracking-wide">
        {t('title')}
      </h3>
      <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${config.color}`}>
        <span>{config.icon}</span>
        <span>{t(level)}</span>
      </div>
      <p className="mt-2 text-xs text-text-muted">
        {t('basedOn', { count: scoreCount })}
      </p>
    </div>
  )
}
