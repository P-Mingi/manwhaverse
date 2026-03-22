'use client'

import { useState, useTransition } from 'react'
import { createReviewAction } from '@/lib/actions/review'

interface Props {
  manhwaId: string
  locale?: string
  existingReview?: { id: string; content: string; score: number | null; is_micro: boolean } | null
}

export function ReviewForm({ manhwaId, locale = 'en', existingReview }: Props) {
  const [content, setContent] = useState(existingReview?.content ?? '')
  const [isMicro, setIsMicro] = useState(existingReview?.is_micro ?? true)
  const [hasSpoilers, setHasSpoilers] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) {
      setError(locale === 'fr' ? 'Le texte est requis' : 'Content is required')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await createReviewAction({
        manhwaId,
        content: content.trim(),
        score: null,
        isMicro,
        hasSpoilers,
      })
      if (result?.error) {
        setError(result.error)
      } else {
        setContent('')
        setHasSpoilers(false)
        setIsMicro(true)
        setSuccess(true)
      }
    })
  }

  if (success) {
    return (
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
        {locale === 'fr' ? 'Avis publié ✓' : 'Review published ✓'}
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input type="radio" checked={isMicro} onChange={() => setIsMicro(true)} />
          {locale === 'fr' ? 'Avis rapide' : 'Quick review'}
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input type="radio" checked={!isMicro} onChange={() => setIsMicro(false)} />
          {locale === 'fr' ? 'Critique détaillée' : 'Full review'}
        </label>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={locale === 'fr' ? 'Votre avis...' : 'Your review...'}
        rows={isMicro ? 3 : 8}
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          color: 'var(--text-primary)',
          padding: '0.75rem',
          fontSize: '14px',
          resize: 'vertical',
          fontFamily: 'inherit',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input type="checkbox" checked={hasSpoilers} onChange={(e) => setHasSpoilers(e.target.checked)} />
          Spoilers
        </label>
      </div>

      {error && <p style={{ color: 'var(--danger)', fontSize: '12px', margin: 0 }}>{error}</p>}

      <button type="submit" className="btn-primary" disabled={isPending} style={{ alignSelf: 'flex-start' }}>
        {isPending
          ? locale === 'fr' ? 'Envoi...' : 'Submitting...'
          : locale === 'fr' ? 'Publier' : 'Submit'}
      </button>
    </form>
  )
}
