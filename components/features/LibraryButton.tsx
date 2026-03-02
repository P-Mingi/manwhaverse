'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  addToLibraryAction,
  removeFromLibraryAction,
  updateScoreAction,
  updateProgressAction,
  toggleFavoriteAction,
} from '@/lib/actions/library'

interface LibraryButtonProps {
  manhwaId: string
  currentStatus?: string | null
  currentScore?: number | null
  currentProgress?: number
  currentIsFavorite?: boolean
  chapterCount?: number | null
  isLoggedIn: boolean
}

const STATUSES = [
  'READING',
  'COMPLETED',
  'ON_HOLD',
  'DROPPED',
  'PLAN_TO_READ',
  'REREADING',
] as const

const BAR_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6',
]

function getScoreColor(score: number): string {
  return BAR_COLORS[Math.min(Math.round(score) - 1, 9)] ?? BAR_COLORS[9]!
}

export function LibraryButton({
  manhwaId,
  currentStatus,
  currentScore,
  currentProgress = 0,
  currentIsFavorite = false,
  chapterCount,
  isLoggedIn,
}: LibraryButtonProps) {
  const t = useTranslations('library')
  const tManhwa = useTranslations('manhwa')
  const router = useRouter()
  const { locale } = useParams<{ locale: string }>()
  const containerRef = useRef<HTMLDivElement>(null)

  const [panelOpen, setPanelOpen] = useState(false)
  const [scoreOpen, setScoreOpen] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const [score, setScore] = useState<number | null>(currentScore ?? null)
  const [progress, setProgress] = useState(currentProgress)
  const [isFavorite, setIsFavorite] = useState(currentIsFavorite)
  const [hoverScore, setHoverScore] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  const statusLabels: Record<string, string> = {
    READING: t('reading'),
    COMPLETED: t('completed'),
    ON_HOLD: t('onHold'),
    DROPPED: t('dropped'),
    PLAN_TO_READ: t('planToRead'),
    REREADING: t('rereading'),
  }

  // Close on outside click
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPanelOpen(false)
        setScoreOpen(false)
        setHoverScore(null)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  function handleTriggerClick() {
    if (!isLoggedIn) {
      router.push(`/${locale}/sign-in`)
      return
    }
    setPanelOpen(!panelOpen)
    setScoreOpen(false)
  }

  function handleScoreBadgeClick() {
    if (!isLoggedIn) {
      router.push(`/${locale}/sign-in`)
      return
    }
    setScoreOpen(!scoreOpen)
    setPanelOpen(false)
  }

  function handleSelectStatus(newStatus: (typeof STATUSES)[number]) {
    setStatus(newStatus)

    // Auto-fill progress to max when marking as COMPLETED
    const autoProgress =
      (newStatus === 'COMPLETED' || newStatus === 'REREADING') && chapterCount != null
        ? chapterCount
        : progress

    if (autoProgress !== progress) setProgress(autoProgress)

    startTransition(async () => {
      const form = new FormData()
      form.set('manhwaId', manhwaId)
      form.set('status', newStatus)
      if (score !== null) form.set('score', String(score))
      form.set('progress', String(autoProgress))
      await addToLibraryAction(form)
    })
  }

  function handleScoreSet(value: number) {
    setScore(value)
    // If not in library yet, auto-add as COMPLETED
    if (!status) {
      setStatus('COMPLETED')
      if (chapterCount != null) setProgress(chapterCount)
    }
    startTransition(async () => {
      await updateScoreAction(manhwaId, value)
    })
  }

  function handleClearScore() {
    setScore(null)
    startTransition(async () => {
      await updateScoreAction(manhwaId, null)
    })
  }

  function handleProgressChange(delta: number) {
    const next = Math.max(
      0,
      chapterCount != null ? Math.min(chapterCount, progress + delta) : progress + delta,
    )
    setProgress(next)
    startTransition(async () => {
      await updateProgressAction(manhwaId, next)
    })
  }

  function handleProgressSet(value: string) {
    let num = parseInt(value, 10)
    if (isNaN(num) || num < 0) num = 0
    if (chapterCount != null && num > chapterCount) num = chapterCount
    setProgress(num)
    startTransition(async () => {
      await updateProgressAction(manhwaId, num)
    })
  }

  function handleFavoriteToggle() {
    setIsFavorite(!isFavorite)
    startTransition(async () => {
      await toggleFavoriteAction(manhwaId)
    })
  }

  function handleRemove() {
    setStatus(null)
    setScore(null)
    setProgress(0)
    setIsFavorite(false)
    setPanelOpen(false)
    setScoreOpen(false)
    startTransition(async () => {
      await removeFromLibraryAction(manhwaId)
    })
  }

  return (
    <div ref={containerRef} className="relative inline-flex flex-col">
      {/* Top row: Status button + Score badge */}
      <div className="flex items-center gap-3">
        {/* Status trigger */}
        <button
          onClick={handleTriggerClick}
          disabled={isPending}
          className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
            status
              ? 'bg-crystal-blue/20 text-crystal-blue hover:bg-crystal-blue/30'
              : 'bg-crystal-blue text-white hover:bg-crystal-blue/90'
          } disabled:opacity-50`}
        >
          {status && isFavorite && <HeartIcon filled className="h-3.5 w-3.5" />}
          {status ? statusLabels[status] : tManhwa('addToLibrary')}
          {status && (
            <svg
              className={`h-3.5 w-3.5 transition-transform ${panelOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        {/* Score badge — always visible */}
        <motion.button
          onClick={handleScoreBadgeClick}
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
      </div>

      {/* Score picker — equalizer bars */}
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
              onPointerLeave={() => setHoverScore(null)}
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
                    onPointerEnter={() => setHoverScore(value)}
                    onClick={() => handleScoreSet(value)}
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
                onClick={handleClearScore}
                disabled={isPending}
                className="mt-3 w-full text-center text-xs text-text-muted transition-colors hover:text-text-secondary disabled:opacity-50"
              >
                {t('clearScore')}
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status panel */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scaleY: 0.9 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.9 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ transformOrigin: 'top' }}
            className="mt-2 w-full max-w-sm rounded-lg border border-border bg-surface p-4 shadow-lg"
          >
            {/* Status grid */}
            <div className="grid grid-cols-3 gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSelectStatus(s)}
                  disabled={isPending}
                  className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                    status === s
                      ? 'bg-crystal-blue/20 text-crystal-blue ring-1 ring-crystal-blue/40'
                      : 'bg-elevated text-text-secondary hover:bg-border'
                  } disabled:opacity-50`}
                >
                  {statusLabels[s]}
                </button>
              ))}
            </div>

            {/* Progress & actions — only when in library */}
            {status && (
              <>
                {/* Chapter progress */}
                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleProgressChange(-1)}
                      disabled={isPending || progress <= 0}
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-elevated text-sm font-bold text-text-secondary transition-colors hover:bg-border disabled:opacity-30"
                    >
                      −
                    </button>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-text-muted">Ch.</span>
                      <input
                        type="number"
                        value={progress}
                        onChange={(e) =>
                          setProgress(parseInt(e.target.value, 10) || 0)
                        }
                        onBlur={(e) => handleProgressSet(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter')
                            handleProgressSet(
                              (e.target as HTMLInputElement).value,
                            )
                        }}
                        min={0}
                        max={chapterCount ?? undefined}
                        className="h-7 w-14 rounded-md border border-border bg-elevated text-center text-sm text-text-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      {chapterCount != null && (
                        <span className="text-xs text-text-muted">
                          / {chapterCount}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleProgressChange(1)}
                      disabled={
                        isPending ||
                        (chapterCount != null && progress >= chapterCount)
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-elevated text-sm font-bold text-text-secondary transition-colors hover:bg-border disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                  {chapterCount != null && chapterCount > 0 && (
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-elevated">
                      <motion.div
                        className="h-full rounded-full bg-crystal-blue"
                        animate={{
                          width: `${Math.min(100, (progress / chapterCount) * 100)}%`,
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 25,
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Footer: favorite + remove */}
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={handleFavoriteToggle}
                    disabled={isPending}
                    className="flex items-center gap-1.5 text-xs text-text-muted transition-colors hover:text-text-secondary disabled:opacity-50"
                    aria-label={t('favorite')}
                  >
                    <HeartIcon filled={isFavorite} className="h-4 w-4" />
                    <span>{t('favorite')}</span>
                  </motion.button>
                  <button
                    onClick={handleRemove}
                    disabled={isPending}
                    className="text-xs text-error transition-colors hover:text-error/80 disabled:opacity-50"
                  >
                    {t('remove')}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function HeartIcon({
  filled,
  className = '',
}: {
  filled: boolean
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${filled ? 'fill-red-500 text-red-500' : 'fill-none text-current'} ${className}`}
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      />
    </svg>
  )
}
