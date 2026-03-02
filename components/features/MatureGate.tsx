'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { updateContentFilterAction } from '@/lib/actions/nsfw'

interface MatureGateProps {
  children: React.ReactNode
}

export function MatureGate({ children }: MatureGateProps) {
  const t = useTranslations('mature')
  const router = useRouter()
  const [accepted, setAccepted] = useState(false)
  const [remember, setRemember] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (accepted) {
    return <>{children}</>
  }

  function handleAccept() {
    if (remember) {
      startTransition(async () => {
        await updateContentFilterAction('ALL')
        setAccepted(true)
      })
    } else {
      setAccepted(true)
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-error/60 via-error to-error/60" />

        <div className="p-8">
          {/* Icon */}
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-error/10">
            <svg className="h-7 w-7 text-error" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>

          {/* Text */}
          <h2 className="mb-2 text-center font-display text-lg font-bold text-text-primary">
            {t('title')}
          </h2>
          <p className="mb-8 text-center text-sm leading-relaxed text-text-secondary">
            {t('description')}
          </p>

          {/* Remember toggle */}
          <label className="mb-8 flex cursor-pointer items-center justify-between rounded-lg bg-elevated/50 px-4 py-3">
            <span className="text-sm text-text-secondary">{t('remember')}</span>
            <button
              type="button"
              role="switch"
              aria-checked={remember}
              onClick={() => setRemember(!remember)}
              className={`relative ml-3 inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crystal-blue focus-visible:ring-offset-2 focus-visible:ring-offset-base ${
                remember ? 'bg-error' : 'bg-border'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  remember ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </label>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-elevated"
            >
              {t('goBack')}
            </button>
            <button
              type="button"
              onClick={handleAccept}
              disabled={isPending}
              className="flex-1 rounded-xl bg-error px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-error/90 disabled:opacity-50"
            >
              {isPending ? '...' : t('continue')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
