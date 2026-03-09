'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { createReviewAction } from '@/lib/actions/review'

interface ReviewFormProps {
  manhwaId: string
  hasExistingReviews?: boolean
}

const DIMENSION_KEYS = ['scoreStory', 'scoreArt', 'scoreCharacters', 'scoreWorld'] as const
type DimensionKey = typeof DIMENSION_KEYS[number]

export function ReviewForm({ manhwaId, hasExistingReviews = false }: ReviewFormProps) {
  const t = useTranslations('review')
  const [isOpen, setIsOpen] = useState(!hasExistingReviews)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [hasSpoilers, setHasSpoilers] = useState(false)
  const [isMicro, setIsMicro] = useState(true)
  const [dimensions, setDimensions] = useState<Record<DimensionKey, string>>({
    scoreStory: '',
    scoreArt: '',
    scoreCharacters: '',
    scoreWorld: '',
  })
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)

  const maxLength = isMicro ? 280 : 10000
  const minLength = isMicro ? 1 : 10

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (content.length < minLength) {
      setError(`Minimum ${minLength} characters`)
      return
    }

    const parseDim = (v: string) => {
      const n = parseFloat(v)
      return isNaN(n) ? null : Math.min(10, Math.max(0, n))
    }

    startTransition(async () => {
      const result = await createReviewAction({
        manhwaId,
        title: isMicro ? null : (title.trim() || null),
        content,
        hasSpoilers,
        isMicro,
        scoreStory: isMicro ? null : parseDim(dimensions.scoreStory),
        scoreArt: isMicro ? null : parseDim(dimensions.scoreArt),
        scoreCharacters: isMicro ? null : parseDim(dimensions.scoreCharacters),
        scoreWorld: isMicro ? null : parseDim(dimensions.scoreWorld),
      })
      if (result.error) {
        setError(result.error)
      } else {
        setTitle('')
        setContent('')
        setDimensions({ scoreStory: '', scoreArt: '', scoreCharacters: '', scoreWorld: '' })
        setSuccess(true)
        setIsOpen(false)
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  if (!isOpen) {
    return (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setIsMicro(true); setIsOpen(true) }}
          className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary"
        >
          {t('writeMicroReview')}
        </button>
        <button
          type="button"
          onClick={() => { setIsMicro(false); setIsOpen(true) }}
          className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary"
        >
          {t('writeReview')}
        </button>
        {success && <p className="self-center text-xs text-success">Review posted!</p>}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Toggle between micro and full */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsMicro(true)}
          className={`rounded-md px-3 py-1 text-xs font-medium ${
            isMicro ? 'border border-crystal-blue text-crystal-blue' : 'bg-elevated text-text-secondary'
          }`}
        >
          {t('writeMicroReview')}
        </button>
        <button
          type="button"
          onClick={() => setIsMicro(false)}
          className={`rounded-md px-3 py-1 text-xs font-medium ${
            !isMicro ? 'border border-crystal-blue text-crystal-blue' : 'bg-elevated text-text-secondary'
          }`}
        >
          {t('writeReview')}
        </button>
      </div>

      {/* Title — long reviews only */}
      {!isMicro && (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('titlePlaceholder')}
          maxLength={200}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-crystal-blue focus:outline-none focus:ring-1 focus:ring-crystal-blue"
        />
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t('placeholder')}
        maxLength={maxLength}
        rows={isMicro ? 2 : 6}
        className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-crystal-blue focus:outline-none focus:ring-1 focus:ring-crystal-blue"
      />

      {/* Dimension scores — long reviews only */}
      {!isMicro && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {([
            ['scoreStory', t('scoreStory')],
            ['scoreArt', t('scoreArt')],
            ['scoreCharacters', t('scoreCharacters')],
            ['scoreWorld', t('scoreWorld')],
          ] as [DimensionKey, string][]).map(([key, label]) => (
            <div key={key}>
              <label className="mb-1 block text-xs text-text-muted">{label}</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={dimensions[key]}
                  onChange={(e) => setDimensions(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder="—"
                  className="w-full rounded-md border border-border bg-surface px-2 py-1 text-xs text-text-primary focus:border-crystal-blue focus:outline-none"
                />
                <span className="shrink-0 text-xs text-text-muted">/10</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!isMicro && (
            <label className="flex items-center gap-1.5 text-xs text-text-muted">
              <input
                type="checkbox"
                checked={hasSpoilers}
                onChange={(e) => setHasSpoilers(e.target.checked)}
                className="rounded border-border"
              />
              {t('spoilerWarning')}
            </label>
          )}
          <span className="text-xs text-text-muted">
            {content.length}/{maxLength}
          </span>
        </div>

        <div className="flex gap-2">
          {hasExistingReviews && (
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg px-4 py-1.5 text-xs font-medium text-text-muted transition-colors hover:text-text-primary"
            >
              {t('cancel')}
            </button>
          )}
          <button
            type="submit"
            disabled={isPending || content.length < minLength}
            className="rounded-lg border border-crystal-blue px-4 py-1.5 text-xs font-medium text-crystal-blue transition-colors hover:bg-crystal-blue/10 disabled:opacity-50"
          >
            {isPending ? '...' : t('publish')}
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-error">{error}</p>}
      {success && <p className="text-xs text-success">Review posted!</p>}
    </form>
  )
}
