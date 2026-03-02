'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'

const BAR_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6',
]

function getScoreColor(score: number): string {
  return BAR_COLORS[Math.min(Math.round(score) - 1, 9)] ?? BAR_COLORS[9]!
}

interface ScoreBadgeProps {
  score: number | null
  hoverScore: number | null
  scoreOpen: boolean
  isPending: boolean
  onBadgeClick: () => void
  onScoreSet: (value: number) => void
  onClearScore: () => void
  onHoverScoreChange: (value: number | null) => void
}

export function ScoreBadge({
  score,
  hoverScore,
  scoreOpen,
  isPending,
  onBadgeClick,
  onScoreSet,
  onClearScore,
  onHoverScoreChange,
}: ScoreBadgeProps) {
  const t = useTranslations('library')

  return (
    <>
      <motion.button
        onClick={onBadgeClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
          scoreOpen
            ? 'border-text-muted bg-elevated'
            : score !== null
              ? 'border-border bg-surface hover:border-text-muted'
              : 'border-amber-400/40 bg-amber-400/5 hover:border-amber-400/60 hover:bg-amber-400/10'
        }`}
      >
        {score !== null ? (
          <>
            <motion.span
              key={score}
              initial={{ rotate: -20, scale: 1.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 12 }}
              className="text-base"
              style={{ color: getScoreColor(score) }}
            >
              ★
            </motion.span>
            <motion.span
              key={`n-${score}`}
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="font-mono font-bold"
              style={{ color: getScoreColor(score) }}
            >
              {score}
            </motion.span>
          </>
        ) : (
          <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            ★ {t('rate')}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {scoreOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scaleY: 0.9 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.9 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ transformOrigin: 'top' }}
            className="mt-2 rounded-lg border border-border bg-surface p-4 shadow-lg"
          >
            <div
              className="flex items-end justify-center gap-1.5"
              onPointerLeave={() => onHoverScoreChange(null)}
            >
              {BAR_COLORS.map((color, i) => {
                const value = i + 1
                const displayVal = hoverScore ?? score
                const isFilled = displayVal !== null && value <= displayVal
                return (
                  <motion.button
                    key={i}
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{
                      delay: i * 0.04,
                      type: 'spring',
                      stiffness: 500,
                      damping: 18,
                    }}
                    style={{ transformOrigin: 'bottom' }}
                    onPointerEnter={() => onHoverScoreChange(value)}
                    onClick={() => onScoreSet(value)}
                    disabled={isPending}
                    className="flex flex-col items-center gap-1.5 disabled:opacity-50"
                  >
                    <motion.div
                      className="w-6 cursor-pointer rounded-sm"
                      animate={{
                        backgroundColor: isFilled ? color : 'rgba(255,255,255,0.06)',
                        boxShadow: isFilled
                          ? `0 0 10px ${color}50, 0 0 4px ${color}30`
                          : '0 0 0px transparent',
                      }}
                      whileHover={{ scaleX: 1.2, scaleY: 1.1 }}
                      transition={{ duration: 0.15 }}
                      style={{ height: `${16 + i * 3}px` }}
                    />
                    <span
                      className={`font-mono text-[10px] transition-colors ${
                        isFilled ? 'font-bold text-text-primary' : 'text-text-muted'
                      }`}
                    >
                      {value}
                    </span>
                  </motion.button>
                )
              })}
            </div>

            {score !== null && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={onClearScore}
                disabled={isPending}
                className="mt-3 w-full text-center text-xs text-text-muted transition-colors hover:text-text-secondary disabled:opacity-50"
              >
                {t('clearScore')}
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
