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
  const [score, setScore] = useState<number | null>(existingReview?.score ?? null)
  const [isMicro, setIsMicro] = useState(existingReview?.is_micro ?? true)
  const [hasSpoilers, setHasSpoilers] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
        score: score ?? null,
        isMicro,
        hasSpoilers,
      })
      if (result?.error) setError(result.error)
    })
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

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <p style={{ margin: '0 0 0.25rem', fontSize: '11px', color: 'var(--text-muted)' }}>Score (1-10)</p>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setScore(n === score ? null : n)}
                style={{
                  background: score === n ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: score === n ? 'var(--accent-text)' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  width: 28,
                  height: 28,
                  borderRadius: 4,
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', marginTop: 'auto' }}>
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
