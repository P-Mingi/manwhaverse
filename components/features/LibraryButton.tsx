'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { addToLibraryAction, removeFromLibraryAction } from '@/lib/actions/library'

interface LibraryButtonProps {
  manhwaId: string
  currentStatus?: string | null
}

const STATUSES = [
  'READING',
  'COMPLETED',
  'ON_HOLD',
  'DROPPED',
  'PLAN_TO_READ',
  'REREADING',
] as const

export function LibraryButton({ manhwaId, currentStatus }: LibraryButtonProps) {
  const t = useTranslations('library')
  const tManhwa = useTranslations('manhwa')
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState(currentStatus)

  const statusLabels: Record<string, string> = {
    READING: t('reading'),
    COMPLETED: t('completed'),
    ON_HOLD: t('onHold'),
    DROPPED: t('dropped'),
    PLAN_TO_READ: t('planToRead'),
    REREADING: t('rereading'),
  }

  function handleSelect(newStatus: (typeof STATUSES)[number]) {
    setStatus(newStatus)
    setOpen(false)
    startTransition(async () => {
      const form = new FormData()
      form.set('manhwaId', manhwaId)
      form.set('status', newStatus)
      await addToLibraryAction(form)
    })
  }

  function handleRemove() {
    setStatus(null)
    setOpen(false)
    startTransition(async () => {
      await removeFromLibraryAction(manhwaId)
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          status
            ? 'bg-crystal-blue/20 text-crystal-blue hover:bg-crystal-blue/30'
            : 'bg-crystal-blue text-white hover:bg-crystal-blue/90'
        } disabled:opacity-50`}
      >
        {status ? statusLabels[status] : tManhwa('addToLibrary')}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded-lg border border-border bg-surface py-1 shadow-lg">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => handleSelect(s)}
                className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-elevated ${
                  status === s ? 'text-crystal-blue' : 'text-text-primary'
                }`}
              >
                {statusLabels[s]}
              </button>
            ))}
            {status && (
              <>
                <div className="my-1 h-px bg-border" />
                <button
                  onClick={handleRemove}
                  className="w-full px-3 py-2 text-left text-sm text-error transition-colors hover:bg-elevated"
                >
                  Remove
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
