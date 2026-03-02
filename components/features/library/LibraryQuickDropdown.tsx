'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

const STATUSES = [
  'READING',
  'COMPLETED',
  'ON_HOLD',
  'DROPPED',
  'PLAN_TO_READ',
  'REREADING',
] as const

interface LibraryQuickDropdownProps {
  currentStatus: string | null
  isPending: boolean
  onSelectStatus: (status: string) => void
  onOpenEditor: () => void
}

export function LibraryQuickDropdown({
  currentStatus,
  isPending,
  onSelectStatus,
  onOpenEditor,
}: LibraryQuickDropdownProps) {
  const t = useTranslations('library')

  const statusLabels: Record<string, string> = {
    READING: t('reading'),
    COMPLETED: t('completed'),
    ON_HOLD: t('onHold'),
    DROPPED: t('dropped'),
    PLAN_TO_READ: t('planToRead'),
    REREADING: t('rereading'),
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scaleY: 0.9 }}
      animate={{ opacity: 1, y: 0, scaleY: 1 }}
      exit={{ opacity: 0, y: -8, scaleY: 0.9 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{ transformOrigin: 'top' }}
      className="absolute left-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
    >
      {STATUSES.map((s) => (
        <button
          key={s}
          onClick={() => onSelectStatus(s)}
          disabled={isPending}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-elevated disabled:opacity-50"
        >
          <span className="flex-1 text-left text-text-primary">
            {statusLabels[s]}
          </span>
          {currentStatus === s && (
            <svg className="h-4 w-4 text-crystal-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      ))}

      <div className="border-t border-border" />

      <button
        onClick={onOpenEditor}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-muted transition-colors hover:bg-elevated hover:text-text-secondary"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span>{t('openEditor')}</span>
      </button>
    </motion.div>
  )
}
