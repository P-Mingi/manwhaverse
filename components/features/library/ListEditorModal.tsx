'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { HeartIcon } from './HeartIcon'

const STATUSES = [
  'READING',
  'COMPLETED',
  'ON_HOLD',
  'DROPPED',
  'PLAN_TO_READ',
  'REREADING',
] as const

export interface EditorFormData {
  status: string
  score: number | null
  progress: number
  is_favorite: boolean
  started_at: string | null
  completed_at: string | null
  reread_count: number
  private_tags: string[]
  notes: string | null
}

interface ListEditorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: EditorFormData) => void
  onRemove: () => void
  isPending: boolean
  bannerUrl: string | null
  coverUrl: string | null
  title: string
  titleKr: string | null
  chapterCount: number | null
  initialData: {
    status: string | null
    score: number | null
    progress: number
    isFavorite: boolean
    startedAt: string | null
    completedAt: string | null
    rereadCount: number
    privateTags: string[]
    notes: string | null
  }
}

function toDateStr(iso: string | null): string {
  if (!iso) return ''
  return iso.slice(0, 10)
}

export function ListEditorModal({
  isOpen,
  onClose,
  onSave,
  onRemove,
  isPending,
  bannerUrl,
  coverUrl,
  title,
  titleKr,
  chapterCount,
  initialData,
}: ListEditorModalProps) {
  const t = useTranslations('library')

  const [status, setStatus] = useState(initialData.status ?? 'PLAN_TO_READ')
  const [score, setScore] = useState<string>(initialData.score?.toString() ?? '')
  const [progress, setProgress] = useState(initialData.progress)
  const [isFavorite, setIsFavorite] = useState(initialData.isFavorite)
  const [startedAt, setStartedAt] = useState(toDateStr(initialData.startedAt))
  const [completedAt, setCompletedAt] = useState(toDateStr(initialData.completedAt))
  const [rereadCount, setRereadCount] = useState(initialData.rereadCount)
  const [privateTags, setPrivateTags] = useState<string[]>(initialData.privateTags)
  const [notes, setNotes] = useState(initialData.notes ?? '')
  const [newTag, setNewTag] = useState('')
  const [confirmingRemove, setConfirmingRemove] = useState(false)

  const statusLabels: Record<string, string> = {
    READING: t('reading'),
    COMPLETED: t('completed'),
    ON_HOLD: t('onHold'),
    DROPPED: t('dropped'),
    PLAN_TO_READ: t('planToRead'),
    REREADING: t('rereading'),
  }

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStatus(initialData.status ?? 'PLAN_TO_READ')
      setScore(initialData.score?.toString() ?? '')
      setProgress(initialData.progress)
      setIsFavorite(initialData.isFavorite)
      setStartedAt(toDateStr(initialData.startedAt))
      setCompletedAt(toDateStr(initialData.completedAt))
      setRereadCount(initialData.rereadCount)
      setPrivateTags(initialData.privateTags)
      setNotes(initialData.notes ?? '')
      setNewTag('')
      setConfirmingRemove(false)
    }
  }, [isOpen, initialData])

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  // Escape key
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  function handleStatusChange(newStatus: string) {
    const now = new Date().toISOString().slice(0, 10)
    setStatus(newStatus)
    if (newStatus === 'READING' && !startedAt) setStartedAt(now)
    if (newStatus === 'COMPLETED') {
      if (!completedAt) setCompletedAt(now)
      if (chapterCount != null) setProgress(chapterCount)
    }
  }

  function handleSave() {
    const scoreNum = score ? parseFloat(score) : null
    onSave({
      status,
      score: scoreNum !== null && !isNaN(scoreNum) ? Math.min(10, Math.max(0, scoreNum)) : null,
      progress,
      is_favorite: isFavorite,
      started_at: startedAt || null,
      completed_at: completedAt || null,
      reread_count: rereadCount,
      private_tags: privateTags,
      notes: notes.trim() || null,
    })
  }

  function handleAddTag() {
    const tag = newTag.trim()
    if (tag && privateTags.length < 20 && !privateTags.includes(tag)) {
      setPrivateTags([...privateTags, tag])
      setNewTag('')
    }
  }

  if (!isOpen) return null

  const content = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-0 md:items-center md:p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative min-h-screen w-full bg-base md:min-h-0 md:max-w-lg md:rounded-2xl md:border md:border-border md:shadow-2xl"
        >
          {/* Header: banner + cover + title */}
          <div className="relative h-28 overflow-hidden md:rounded-t-2xl">
            {bannerUrl ? (
              <Image
                src={bannerUrl}
                alt=""
                fill
                className="object-cover opacity-40"
                sizes="640px"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-crystal-blue/20 to-purple-900/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-base to-transparent" />
            <button
              onClick={onClose}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/70 transition-colors hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="relative z-10 -mt-10 flex items-start gap-4 px-6">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={title}
                width={64}
                height={90}
                className="h-[90px] w-16 flex-shrink-0 rounded-lg object-cover shadow-lg"
              />
            ) : (
              <div className="h-[90px] w-16 flex-shrink-0 rounded-lg bg-elevated shadow-lg" />
            )}
            <div className="flex-1 pt-6">
              <h2 className="text-base font-bold leading-tight text-text-primary">{title}</h2>
              {titleKr && (
                <p className="text-xs text-text-muted">{titleKr}</p>
              )}
            </div>
            <div className="flex items-center gap-2 pt-6">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`rounded-lg p-2 transition-colors ${
                  isFavorite
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-elevated text-text-muted hover:text-red-400'
                }`}
              >
                <HeartIcon filled={isFavorite} className="h-5 w-5" />
              </button>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="rounded-lg bg-crystal-blue px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-crystal-blue/90 disabled:opacity-50"
              >
                {isPending ? '…' : t('save')}
              </button>
            </div>
          </div>

          {/* Form body */}
          <div className="space-y-5 p-6">
            {/* Row 1: Status, Score, Progress */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1.5 block text-xs text-text-muted">{t('editor.status')}</label>
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text-primary"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{statusLabels[s]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-text-muted">{t('editor.score')}</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="—"
                    className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <span className="text-xs text-text-muted">/10</span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-text-muted">{t('editor.progress')}</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max={chapterCount ?? 9999}
                    value={progress}
                    onChange={(e) => setProgress(parseInt(e.target.value) || 0)}
                    className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  {chapterCount != null && (
                    <span className="shrink-0 text-xs text-text-muted">/ {chapterCount}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Row 2: Dates, Rereads */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1.5 block text-xs text-text-muted">{t('editor.startDate')}</label>
                <input
                  type="date"
                  value={startedAt}
                  onChange={(e) => setStartedAt(e.target.value)}
                  className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-text-muted">{t('editor.endDate')}</label>
                <input
                  type="date"
                  value={completedAt}
                  onChange={(e) => setCompletedAt(e.target.value)}
                  className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-text-muted">{t('editor.rereads')}</label>
                <input
                  type="number"
                  min="0"
                  value={rereadCount}
                  onChange={(e) => setRereadCount(parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
            </div>

            {/* Private tags */}
            <div>
              <label className="mb-1.5 block text-xs text-text-muted">{t('editor.privateTags')}</label>
              <div className="flex flex-wrap gap-1.5">
                {privateTags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-full bg-elevated px-2.5 py-1 text-xs text-text-secondary"
                  >
                    {tag}
                    <button
                      onClick={() => setPrivateTags(privateTags.filter((t) => t !== tag))}
                      className="text-text-muted transition-colors hover:text-red-400"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  placeholder={t('editor.addTag')}
                  maxLength={50}
                  className="w-28 border-b border-border bg-transparent px-2 py-1 text-xs text-text-primary outline-none focus:border-crystal-blue"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="mb-1.5 block text-xs text-text-muted">{t('editor.notes')}</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('editor.notesPlaceholder')}
                maxLength={5000}
                className="w-full resize-y rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted"
              />
              <p className="mt-1 text-[10px] text-text-muted">{t('editor.notesPrivate')}</p>
            </div>

            {/* Remove */}
            {initialData.status && (
              <div className="flex justify-end border-t border-border pt-4">
                {confirmingRemove ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">{t('confirmRemove')}</span>
                    <button
                      onClick={() => { onRemove(); onClose() }}
                      className="text-xs font-medium text-error transition-colors hover:text-error/80"
                    >
                      {t('confirm')}
                    </button>
                    <button
                      onClick={() => setConfirmingRemove(false)}
                      className="text-xs text-text-muted transition-colors hover:text-text-secondary"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmingRemove(true)}
                    className="text-xs text-error/70 transition-colors hover:text-error"
                  >
                    {t('remove')}
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )

  return createPortal(content, document.body)
}
