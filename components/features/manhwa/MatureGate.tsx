'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateContentFilterAction } from '@/lib/actions/nsfw'

interface Props {
  locale: string
  isLoggedIn: boolean
}

export function MatureGate({ locale, isLoggedIn }: Props) {
  const router = useRouter()
  const [enabled, setEnabled] = useState(false)
  const [saving, setSaving] = useState(false)
  const isFr = locale === 'fr'

  async function handleToggle() {
    if (saving) return
    setEnabled(true)
    setSaving(true)
    await updateContentFilterAction('ALL')
    router.refresh()
  }

  function handleEnter() {
    // Bypass the gate for this browser session (2h)
    document.cookie = 'mature_bypass=1; path=/; max-age=7200'
    router.refresh()
  }

  return (
    <div
      style={{
        maxWidth: 420,
        margin: '4rem auto',
        padding: '2rem',
        textAlign: 'center',
      }}
      className="card"
    >
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔞</div>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        {isFr ? 'Contenu adulte' : 'Mature Content'}
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '1.75rem' }}>
        {isFr
          ? 'Ce titre contient du contenu réservé aux adultes. Souhaitez-vous le voir ?'
          : 'This title contains adult content. Want to view it?'}
      </p>

      {isLoggedIn ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', cursor: saving ? 'default' : 'pointer' }}>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              disabled={saving}
              onClick={handleToggle}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none disabled:opacity-50 ${
                enabled ? 'bg-error' : 'bg-border'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {isFr ? 'Toujours afficher le contenu adulte' : 'Always show mature content'}
            </span>
          </label>

          <button
            type="button"
            onClick={handleEnter}
            className="btn-primary"
          >
            {isFr ? 'Accéder quand même' : 'Enter anyway'}
          </button>
        </div>
      ) : (
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '1rem' }}>
            {isFr
              ? 'Connectez-vous pour activer le contenu adulte dans vos paramètres.'
              : 'Sign in to enable adult content in your settings.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={`/${locale}/sign-in`} className="btn-primary" style={{ textDecoration: 'none' }}>
              {isFr ? 'Se connecter' : 'Sign in'}
            </Link>
            <button type="button" onClick={handleEnter} className="btn-secondary">
              {isFr ? 'Accéder quand même' : 'Enter anyway'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
