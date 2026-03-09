'use client'

import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { ManhwaStatsData, AniListStats } from '@/lib/db/stats'

function useChartColors() {
  const { resolvedTheme } = useTheme()
  const isLight = resolvedTheme === 'light'
  return {
    primary:  isLight ? '#E8547A' : '#00E5CC',
    gold:     isLight ? '#C4883C' : '#F5C842',
    muted:    isLight ? '#C4A0AE' : '#454A60',
    bg:       isLight ? '#FFF0F3' : '#181C2A',
    border:   isLight ? 'rgba(232,84,122,0.2)' : 'rgba(0,229,204,0.15)',
  }
}

interface ManhwaStatsProps {
  stats: ManhwaStatsData
  anilistStats: AniListStats | null
}

const SCORE_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#a3e635',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
]

const STATUS_COLORS: Record<string, string> = {
  READING: '#3b82f6',
  COMPLETED: '#22c55e',
  ON_HOLD: '#f59e0b',
  DROPPED: '#ef4444',
  PLAN_TO_READ: '#8b5cf6',
  REREADING: '#06b6d4',
  // AniList statuses
  CURRENT: '#3b82f6',
  PLANNING: '#8b5cf6',
  PAUSED: '#f59e0b',
}

const STATUS_LABELS: Record<string, string> = {
  READING: 'Reading',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
  DROPPED: 'Dropped',
  PLAN_TO_READ: 'Plan to Read',
  REREADING: 'Rereading',
  CURRENT: 'Reading',
  PLANNING: 'Planning',
  PAUSED: 'Paused',
}

export function ManhwaStats({ stats, anilistStats }: ManhwaStatsProps) {
  const chartColors = useChartColors()
  const t = useTranslations('manhwa.statsLabels')

  const hasUserScores = stats.scoreDistribution.some((b) => b.count > 0)
  const hasUserStatuses = stats.statusDistribution.length > 0

  // Use AniList data as fallback if no user data
  const scoreData = hasUserScores
    ? stats.scoreDistribution
    : anilistStats?.scoreDistribution.map((d) => ({ score: d.score / 10, count: d.amount })) ?? []

  const statusData = hasUserStatuses
    ? stats.statusDistribution
    : anilistStats?.statusDistribution.map((d) => ({ status: d.status, count: d.amount })) ?? []

  const totalStatusUsers = statusData.reduce((sum, d) => sum + d.count, 0)
  const scoreSource = hasUserScores ? 'ManhwaVerse' : 'AniList'

  // Rankings from AniList
  const rankings = anilistStats?.rankings.filter((r) => r.rank <= 100) ?? []

  return (
    <div className="space-y-8">
      {/* Rankings badges */}
      {rankings.length > 0 && (
        <section>
          <h3 className="mb-1 text-sm font-semibold text-text-muted uppercase tracking-wide">
            {t('rankings')}
          </h3>
          <p className="mb-3 text-xs text-text-muted">{t('source', { name: 'AniList' })}</p>
          <div className="flex flex-wrap gap-2">
            {rankings.slice(0, 6).map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2"
              >
                <span className="font-mono text-lg font-bold text-accent">
                  #{r.rank}
                </span>
                <span className="text-xs text-text-secondary">{r.context}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Score distribution chart */}
      {scoreData.length > 0 && (
        <section>
          <h3 className="mb-1 text-sm font-semibold text-text-muted uppercase tracking-wide">
            {t('scoreDistribution')}
          </h3>
          <p className="mb-3 text-xs text-text-muted">{t('source', { name: scoreSource })}</p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                <XAxis
                  dataKey="score"
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: chartColors.bg,
                    border: `1px solid ${chartColors.border}`,
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value) => [`${value} ${t('votes')}`, '']}
                  labelFormatter={(label) => `Score: ${label}`}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {scoreData.map((_, index) => (
                    <Cell key={index} fill={SCORE_COLORS[index % SCORE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Status distribution */}
      {statusData.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-text-muted uppercase tracking-wide">
            {t('statusDistribution')}
          </h3>
          {/* Stacked bar */}
          <div className="mb-3 flex h-6 w-full overflow-hidden rounded-full">
            {statusData.map((d) => {
              const pct = totalStatusUsers > 0 ? (d.count / totalStatusUsers) * 100 : 0
              if (pct < 1) return null
              return (
                <div
                  key={d.status}
                  className="h-full transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: STATUS_COLORS[d.status] ?? '#6b7280',
                  }}
                  title={`${STATUS_LABELS[d.status] ?? d.status}: ${d.count}`}
                />
              )
            })}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            {statusData.map((d) => (
              <div key={d.status} className="flex items-center gap-1.5 text-xs">
                <div
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: STATUS_COLORS[d.status] ?? '#6b7280' }}
                />
                <span className="text-text-secondary">
                  {STATUS_LABELS[d.status] ?? d.status}
                </span>
                <span className="text-text-muted">({d.count})</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent activity */}
      {stats.recentActivity.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-text-muted uppercase tracking-wide">
            {t('recentActivity')}
          </h3>
          <div className="space-y-2">
            {stats.recentActivity.slice(0, 10).map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-lg bg-surface px-3 py-2 text-sm"
              >
                <span className="font-medium text-text-primary">
                  {a.user.display_name ?? a.user.username ?? 'User'}
                </span>
                <span className="text-text-muted">{a.type.toLowerCase().replace(/_/g, ' ')}</span>
                <span className="ml-auto text-xs text-text-muted">
                  {new Date(a.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
