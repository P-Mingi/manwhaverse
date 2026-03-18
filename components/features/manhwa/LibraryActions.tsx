'use client'

import { useState, useTransition, useEffect } from 'react'
import { addToLibraryAction, removeFromLibraryAction, updateScoreAction } from '@/lib/actions/library'

interface LibraryEntry {
  status: string
  score: number | null
  progress: number | null
}

interface Props {
  manhwaId: string
  currentEntry: LibraryEntry | null
  isLoggedIn: boolean
  locale?: string
  totalChapters?: number | null
}

const STATUSES = ['READING', 'COMPLETED', 'PLAN_TO_READ', 'ON_HOLD', 'DROPPED', 'REREADING'] as const

const STATUS_LABELS: Record<string, { fr: string; en: string }> = {
  READING: { fr: 'En cours', en: 'Reading' },
  COMPLETED: { fr: 'Terminé', en: 'Completed' },
  PLAN_TO_READ: { fr: 'À lire', en: 'Plan to Read' },
  ON_HOLD: { fr: 'En pause', en: 'On Hold' },
  DROPPED: { fr: 'Abandonné', en: 'Dropped' },
  REREADING: { fr: 'Relecteur', en: 'Rereading' },
}

export function LibraryActions({ manhwaId, currentEntry, isLoggedIn, locale = 'en', totalChapters }: Props) {
  const [showPanel, setShowPanel] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!isLoggedIn) {
    return (
      <a href={`/${locale}/sign-in`} className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-block' }}>
        {locale === 'fr' ? 'Connectez-vous pour ajouter' : 'Sign in to add'}
      </a>
    )
  }

  const [localScore, setLocalScore] = useState(currentEntry?.score ?? null)
  const [localProgress, setLocalProgress] = useState<number | ''>(currentEntry?.progress ?? '')
  useEffect(() => { setLocalScore(currentEntry?.score ?? null) }, [currentEntry?.score])
  useEffect(() => { setLocalProgress(currentEntry?.progress ?? '') }, [currentEntry?.progress])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className={currentEntry ? 'btn-secondary' : 'btn-primary'}
        onClick={() => setShowPanel((p) => !p)}
        disabled={isPending}
        style={{ minWidth: 140 }}
      >
        {currentEntry
          ? STATUS_LABELS[currentEntry.status]?.[locale as 'fr' | 'en'] ?? currentEntry.status
          : locale === 'fr' ? 'Ajouter à la bibliothèque' : 'Add to library'}
      </button>

      {showPanel && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowPanel(false)} />
          <div
            className="card"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              zIndex: 100,
              minWidth: 200,
              padding: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {STATUSES.map((status) => (
              <button
                key={status}
                style={{
                  background: currentEntry?.status === status ? 'var(--accent-muted)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem 0.75rem',
                  fontSize: '13px',
                  color: currentEntry?.status === status ? 'var(--accent)' : 'var(--text-secondary)',
                  borderRadius: 6,
                  textAlign: 'left',
                  width: '100%',
                  fontWeight: currentEntry?.status === status ? 600 : 400,
                }}
                onClick={() => {
                  const progress = status === 'COMPLETED' && totalChapters
                    ? totalChapters
                    : (typeof localProgress === 'number' ? localProgress : undefined)
                  if (status === 'COMPLETED' && totalChapters) setLocalProgress(totalChapters)
                  startTransition(async () => {
                    const form = new FormData()
                    form.append('manhwaId', manhwaId)
                    form.append('status', status)
                    if (progress !== undefined) form.append('progress', String(progress))
                    await addToLibraryAction(form)
                    setShowPanel(false)
                  })
                }}
                disabled={isPending}
              >
                {STATUS_LABELS[status]?.[locale as 'fr' | 'en'] ?? status}
              </button>
            ))}

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.25rem 0' }} />
            <div style={{ padding: '0.5rem 0.75rem' }}>
              <p style={{ margin: '0 0 0.4rem', fontSize: '11px', color: 'var(--text-muted)' }}>
                {locale === 'fr' ? 'Chapitres lus' : 'Chapters read'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="number"
                  min={0}
                  max={totalChapters ?? undefined}
                  value={localProgress}
                  onChange={(e) => setLocalProgress(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                  onBlur={() => {
                    const progress = typeof localProgress === 'number' ? localProgress : undefined
                    if (currentEntry && progress !== undefined) {
                      startTransition(async () => {
                        const form = new FormData()
                        form.append('manhwaId', manhwaId)
                        form.append('status', currentEntry.status)
                        form.append('progress', String(progress))
                        await addToLibraryAction(form)
                      })
                    }
                  }}
                  style={{
                    width: 64,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    padding: '4px 8px',
                    outline: 'none',
                  }}
                  disabled={isPending}
                />
                {totalChapters && (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/ {totalChapters}</span>
                )}
              </div>
            </div>

            {currentEntry && (
              <>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.25rem 0' }} />
                <div style={{ padding: '0.5rem 0.75rem' }}>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '11px', color: 'var(--text-muted)' }}>Score (1-10)</p>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <button
                        key={n}
                        style={{
                          background: currentEntry?.score === n ? 'var(--accent)' : 'var(--bg-elevated)',
                          color: currentEntry?.score === n ? 'var(--accent-text)' : 'var(--text-secondary)',
                          border: 'none',
                          cursor: 'pointer',
                          width: 28,
                          height: 28,
                          borderRadius: 4,
                          fontSize: '11px',
                          fontWeight: 600,
                        }}
                        onClick={() => {
                          startTransition(async () => {
                            await updateScoreAction(manhwaId, n)
                          })
                        }}
                        disabled={isPending}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.25rem 0' }} />
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem 0.75rem',
                    fontSize: '12px',
                    color: 'var(--danger)',
                    borderRadius: 6,
                    textAlign: 'left',
                    width: '100%',
                  }}
                  onClick={() => {
                    startTransition(async () => {
                      await removeFromLibraryAction(manhwaId)
                      setShowPanel(false)
                    })
                  }}
                  disabled={isPending}
                >
                  {locale === 'fr' ? 'Retirer de la bibliothèque' : 'Remove from library'}
                </button>
              </>
            )}
          </div>
        </>
      )}
      </div>

      {/* Inline score row — always visible when in library */}
      {isLoggedIn && currentEntry && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginRight: 2 }}>
            {locale === 'fr' ? 'Note :' : 'Score:'}
          </span>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              disabled={isPending}
              onClick={() => {
                setLocalScore(n)
                startTransition(async () => {
                  await updateScoreAction(manhwaId, n)
                })
              }}
              style={{
                background: localScore === n ? 'var(--accent)' : 'var(--bg-elevated)',
                color: localScore === n ? 'var(--accent-text)' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                width: 24,
                height: 24,
                borderRadius: 4,
                fontSize: '11px',
                fontWeight: 600,
                transition: 'background 100ms',
              }}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
