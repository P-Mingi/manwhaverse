'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { AnimatePresence } from 'framer-motion'
import {
  addToLibraryAction,
  removeFromLibraryAction,
  updateScoreAction,
  updateLibraryEntryAction,
} from '@/lib/actions/library'
import { HeartIcon } from './HeartIcon'
import { ScoreBadge } from './ScoreBadge'
import { LibraryQuickDropdown } from './LibraryQuickDropdown'
import { ListEditorModal, type EditorFormData } from './ListEditorModal'

interface LibraryActionsProps {
  manhwaId: string
  currentStatus: string | null
  currentScore: number | null
  currentProgress: number
  currentIsFavorite: boolean
  currentStartedAt: string | null
  currentCompletedAt: string | null
  currentRereadCount: number
  currentPrivateTags: string[]
  currentNotes: string | null
  chapterCount: number | null
  isLoggedIn: boolean
  bannerUrl: string | null
  coverUrl: string | null
  title: string
  titleKr: string | null
}

export function LibraryActions({
  manhwaId,
  currentStatus,
  currentScore,
  currentProgress = 0,
  currentIsFavorite = false,
  currentStartedAt,
  currentCompletedAt,
  currentRereadCount = 0,
  currentPrivateTags = [],
  currentNotes,
  chapterCount,
  isLoggedIn,
  bannerUrl,
  coverUrl,
  title,
  titleKr,
}: LibraryActionsProps) {
  const t = useTranslations('library')
  const tManhwa = useTranslations('manhwa')
  const router = useRouter()
  const { locale } = useParams<{ locale: string }>()
  const containerRef = useRef<HTMLDivElement>(null)

  const [status, setStatus] = useState(currentStatus)
  const [score, setScore] = useState<number | null>(currentScore)
  const [progress, setProgress] = useState(currentProgress)
  const [isFavorite, setIsFavorite] = useState(currentIsFavorite)
  const [startedAt, setStartedAt] = useState(currentStartedAt)
  const [completedAt, setCompletedAt] = useState(currentCompletedAt)
  const [rereadCount, setRereadCount] = useState(currentRereadCount)
  const [privateTags, setPrivateTags] = useState(currentPrivateTags)
  const [notes, setNotes] = useState(currentNotes)

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [scoreOpen, setScoreOpen] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
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

  // Close dropdowns on outside click
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
        setScoreOpen(false)
        setHoverScore(null)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  function requireAuth(): boolean {
    if (!isLoggedIn) {
      router.push(`/${locale}/sign-in`)
      return false
    }
    return true
  }

  function handleTriggerClick() {
    if (!requireAuth()) return
    setDropdownOpen(!dropdownOpen)
    setScoreOpen(false)
  }

  function handleScoreBadgeClick() {
    if (!requireAuth()) return
    setScoreOpen(!scoreOpen)
    setDropdownOpen(false)
  }

  function handleQuickStatus(newStatus: string) {
    setStatus(newStatus)
    setDropdownOpen(false)

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
    setScoreOpen(false)
    setHoverScore(null)
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
    setScoreOpen(false)
    startTransition(async () => {
      await updateScoreAction(manhwaId, null)
    })
  }

  function handleOpenEditor() {
    setDropdownOpen(false)
    setScoreOpen(false)
    setEditorOpen(true)
  }

  function handleEditorSave(data: EditorFormData) {
    // Optimistic update
    setStatus(data.status)
    setScore(data.score)
    setProgress(data.progress)
    setIsFavorite(data.is_favorite)
    setStartedAt(data.started_at)
    setCompletedAt(data.completed_at)
    setRereadCount(data.reread_count)
    setPrivateTags(data.private_tags)
    setNotes(data.notes)
    setEditorOpen(false)

    startTransition(async () => {
      await updateLibraryEntryAction({
        manhwaId,
        status: data.status as 'READING' | 'COMPLETED' | 'ON_HOLD' | 'DROPPED' | 'PLAN_TO_READ' | 'REREADING',
        score: data.score,
        progress: data.progress,
        started_at: data.started_at,
        completed_at: data.completed_at,
        reread_count: data.reread_count,
        is_favorite: data.is_favorite,
        private_tags: data.private_tags,
        notes: data.notes,
      })
    })
  }

  function handleRemove() {
    setStatus(null)
    setScore(null)
    setProgress(0)
    setIsFavorite(false)
    setStartedAt(null)
    setCompletedAt(null)
    setRereadCount(0)
    setPrivateTags([])
    setNotes(null)
    setEditorOpen(false)
    startTransition(async () => {
      await removeFromLibraryAction(manhwaId)
    })
  }

  return (
    <>
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
                className={`h-3.5 w-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>

          {/* Score badge */}
          <ScoreBadge
            score={score}
            hoverScore={hoverScore}
            scoreOpen={scoreOpen}
            isPending={isPending}
            onBadgeClick={handleScoreBadgeClick}
            onScoreSet={handleScoreSet}
            onClearScore={handleClearScore}
            onHoverScoreChange={setHoverScore}
          />
        </div>

        {/* Quick Dropdown */}
        <AnimatePresence>
          {dropdownOpen && (
            <LibraryQuickDropdown
              currentStatus={status}
              isPending={isPending}
              onSelectStatus={handleQuickStatus}
              onOpenEditor={handleOpenEditor}
            />
          )}
        </AnimatePresence>
      </div>

      {/* List Editor Modal */}
      <ListEditorModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleEditorSave}
        onRemove={handleRemove}
        isPending={isPending}
        bannerUrl={bannerUrl}
        coverUrl={coverUrl}
        title={title}
        titleKr={titleKr}
        chapterCount={chapterCount}
        initialData={{
          status,
          score,
          progress,
          isFavorite,
          startedAt,
          completedAt,
          rereadCount,
          privateTags,
          notes,
        }}
      />
    </>
  )
}
