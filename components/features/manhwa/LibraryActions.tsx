'use client'

import { useState, useTransition } from 'react'
import type { ReadingStatus } from '@prisma/client'
import {
  addToLibraryAction,
  removeFromLibraryAction,
  updateProgressAction,
  toggleFavoriteAction,
} from '@/lib/actions/library'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LibraryEntry {
  status: ReadingStatus
  score: number | null
  progress: number
  is_favorite: boolean
}

interface Props {
  manhwaId: string
  currentEntry: LibraryEntry | null
  isLoggedIn: boolean
  locale?: string
  totalChapters?: number | null
}

const STATUS_LABELS: Record<ReadingStatus, { label: string; color: string; bg: string }> = {
  READING:       { label: 'Reading',      color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  COMPLETED:     { label: 'Completed',    color: 'var(--accent)', bg: 'var(--accent-muted)' },
  ON_HOLD:       { label: 'On hold',      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  DROPPED:       { label: 'Dropped',      color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  PLAN_TO_READ:  { label: 'Plan to read', color: 'var(--text-secondary)', bg: 'var(--bg-elevated)' },
  REREADING:     { label: 'Rereading',    color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
}

const STATUS_OPTIONS: ReadingStatus[] = [
  'READING', 'COMPLETED', 'ON_HOLD', 'DROPPED', 'PLAN_TO_READ', 'REREADING',
]

// ─── Component ────────────────────────────────────────────────────────────────

export function LibraryActions({ manhwaId, currentEntry, isLoggedIn, totalChapters }: Props) {
  const [entry, setEntry] = useState<LibraryEntry | null>(currentEntry)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [progressInput, setProgressInput] = useState<string>(
    currentEntry ? String(currentEntry.progress) : ''
  )
  const [showProgressEdit, setShowProgressEdit] = useState(false)

  // ── Add to library ─────────────────────────────────────────────────────────
  const handleAdd = (status: ReadingStatus) => {
    setShowDropdown(false)
    const fd = new FormData()
    fd.set('manhwaId', manhwaId)
    fd.set('status', status)

    startTransition(async () => {
      const res = await addToLibraryAction(fd)
      if (!res.error) {
        setEntry({ status, score: null, progress: 0, is_favorite: false })
        setProgressInput('0')
      }
    })
  }

  // ── Change status ──────────────────────────────────────────────────────────
  const handleStatusChange = (status: ReadingStatus) => {
    if (!entry) return
    setShowDropdown(false)
    const fd = new FormData()
    fd.set('manhwaId', manhwaId)
    fd.set('status', status)
    fd.set('progress', String(entry.progress))
    if (entry.score !== null) fd.set('score', String(entry.score))

    startTransition(async () => {
      await addToLibraryAction(fd)
      setEntry(e => e ? { ...e, status } : e)
    })
  }

  // ── Remove ─────────────────────────────────────────────────────────────────
  const handleRemove = () => {
    startTransition(async () => {
      await removeFromLibraryAction(manhwaId)
      setEntry(null)
      setProgressInput('')
    })
  }

  // ── Chapter progress ───────────────────────────────────────────────────────
  const handleProgressSave = () => {
    const val = parseInt(progressInput, 10)
    if (isNaN(val) || val < 0) return
    const capped = totalChapters ? Math.min(val, totalChapters) : val
    setShowProgressEdit(false)

    startTransition(async () => {
      await updateProgressAction(manhwaId, capped)
      setEntry(e => e ? { ...e, progress: capped } : e)
      setProgressInput(String(capped))
    })
  }

  // ── Favorite ───────────────────────────────────────────────────────────────
  const handleFavorite = () => {
    startTransition(async () => {
      await toggleFavoriteAction(manhwaId)
      setEntry(e => e ? { ...e, is_favorite: !e.is_favorite } : e)
    })
  }

  // ─── Render: not in library ────────────────────────────────────────────────
  if (!entry) {
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button
          onClick={() => setShowDropdown(d => !d)}
          disabled={isPending}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            background: 'var(--accent)',
            color: 'var(--accent-text)',
            border: 'none',
            cursor: isPending ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
            opacity: isPending ? 0.7 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          <span>+</span>
          <span>Add to library</span>
        </button>

        {showDropdown && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              zIndex: 50,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-strong)',
              borderRadius: '12px',
              padding: '6px',
              minWidth: '190px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
            }}
          >
            {STATUS_OPTIONS.map(s => {
              const info = STATUS_LABELS[s]
              return (
                <button
                  key={s}
                  onClick={() => handleAdd(s)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    color: 'var(--text-primary)',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: info.color,
                      flexShrink: 0,
                    }}
                  />
                  {info.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ─── Render: in library ────────────────────────────────────────────────────
  const statusInfo = STATUS_LABELS[entry.status]
  const progressPct = totalChapters && totalChapters > 0
    ? Math.min((entry.progress / totalChapters) * 100, 100)
    : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Row 1: status button + favorite */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {/* Status dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(d => !d)}
            disabled={isPending}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              borderRadius: '10px',
              background: statusInfo.bg,
              color: statusInfo.color,
              border: `1px solid ${statusInfo.color}30`,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              opacity: isPending ? 0.7 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: statusInfo.color,
                flexShrink: 0,
              }}
            />
            {statusInfo.label}
            <span style={{ fontSize: '10px', opacity: 0.7 }}>▾</span>
          </button>

          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                zIndex: 50,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-strong)',
                borderRadius: '12px',
                padding: '6px',
                minWidth: '190px',
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
              }}
            >
              {STATUS_OPTIONS.map(s => {
                const info = STATUS_LABELS[s]
                const isCurrent = s === entry.status
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={isCurrent}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isCurrent ? 'var(--bg-elevated)' : 'transparent',
                      cursor: isCurrent ? 'default' : 'pointer',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      color: isCurrent ? info.color : 'var(--text-primary)',
                      fontWeight: isCurrent ? 600 : 400,
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => {
                      if (!isCurrent) e.currentTarget.style.background = 'var(--bg-elevated)'
                    }}
                    onMouseLeave={e => {
                      if (!isCurrent) e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: info.color,
                        flexShrink: 0,
                      }}
                    />
                    {info.label}
                    {isCurrent && <span style={{ marginLeft: 'auto', fontSize: '12px' }}>✓</span>}
                  </button>
                )
              })}

              <div style={{ height: '1px', background: 'var(--border)', margin: '6px 0' }} />
              <button
                onClick={handleRemove}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  color: '#ef4444',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: '12px' }}>✕</span>
                Remove from library
              </button>
            </div>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={handleFavorite}
          disabled={isPending}
          title={entry.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            border: '1px solid var(--border-strong)',
            background: entry.is_favorite ? 'rgba(244,63,94,0.12)' : 'var(--bg-card)',
            color: entry.is_favorite ? '#f43f5e' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            transition: 'all 0.15s',
          }}
        >
          {entry.is_favorite ? '♥' : '♡'}
        </button>
      </div>

      {/* Row 2: Chapter progress */}
      {(entry.status === 'READING' || entry.status === 'REREADING' || entry.progress > 0) && (
        <div
          style={{
            background: 'var(--bg-elevated)',
            borderRadius: '10px',
            padding: '12px 14px',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Progress
            </span>
            {showProgressEdit ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Ch.</span>
                <input
                  type="number"
                  min={0}
                  max={totalChapters ?? undefined}
                  value={progressInput}
                  onChange={e => setProgressInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleProgressSave()
                    if (e.key === 'Escape') setShowProgressEdit(false)
                  }}
                  autoFocus
                  style={{
                    width: '60px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--accent)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    textAlign: 'center',
                  }}
                />
                {totalChapters && (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>/ {totalChapters}</span>
                )}
                <button
                  onClick={handleProgressSave}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'var(--accent)',
                    color: 'var(--accent-text)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                  }}
                >
                  OK
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowProgressEdit(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--accent)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  padding: 0,
                }}
              >
                <span>Ch. {entry.progress}</span>
                {totalChapters && (
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/{totalChapters}</span>
                )}
                <span style={{ fontSize: '11px', marginLeft: '4px' }}>✎</span>
              </button>
            )}
          </div>

          {/* Progress bar */}
          {progressPct !== null && (
            <div
              style={{
                height: '4px',
                background: 'var(--border-strong)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progressPct}%`,
                  background: 'var(--accent)',
                  borderRadius: '2px',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Add progress widget for non-reading statuses with no progress yet */}
      {entry.status !== 'READING' && entry.status !== 'REREADING' && entry.progress === 0 && totalChapters && (
        <button
          onClick={() => setShowProgressEdit(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            borderRadius: '8px',
            background: 'transparent',
            border: '1px dashed var(--border-strong)',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: '0.8125rem',
          }}
        >
          <span>+ Add progress</span>
        </button>
      )}
    </div>
  )
}

// Default export alias for backwards-compatibility
export default LibraryActions
