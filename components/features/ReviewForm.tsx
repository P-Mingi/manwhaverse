'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { createReviewAction } from '@/lib/actions/review'

interface ReviewFormProps {
  manhwaId: string
}

export function ReviewForm({ manhwaId }: ReviewFormProps) {
  const t = useTranslations('review')
  const [content, setContent] = useState('')
  const [hasSpoilers, setHasSpoilers] = useState(false)
  const [isMicro, setIsMicro] = useState(true)
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

    startTransition(async () => {
      const result = await createReviewAction({
        manhwaId,
        content,
        hasSpoilers,
        isMicro,
      })
      if (result.error) {
        setError(result.error)
      } else {
        setContent('')
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Toggle between micro and full */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsMicro(true)}
          className={`rounded-md px-3 py-1 text-xs font-medium ${
            isMicro ? 'bg-crystal-blue text-white' : 'bg-elevated text-text-secondary'
          }`}
        >
          {t('writeMicroReview')}
        </button>
        <button
          type="button"
          onClick={() => setIsMicro(false)}
          className={`rounded-md px-3 py-1 text-xs font-medium ${
            !isMicro ? 'bg-crystal-blue text-white' : 'bg-elevated text-text-secondary'
          }`}
        >
          {t('writeReview')}
        </button>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t('placeholder')}
        maxLength={maxLength}
        rows={isMicro ? 2 : 6}
        className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-crystal-blue focus:outline-none focus:ring-1 focus:ring-crystal-blue"
      />

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

        <button
          type="submit"
          disabled={isPending || content.length < minLength}
          className="rounded-lg bg-crystal-blue px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-crystal-blue/90 disabled:opacity-50"
        >
          {isPending ? '...' : t('writeReview')}
        </button>
      </div>

      {error && <p className="text-xs text-error">{error}</p>}
      {success && <p className="text-xs text-success">Review posted!</p>}
    </form>
  )
}
