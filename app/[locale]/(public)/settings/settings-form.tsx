'use client'

import { useTranslations } from 'next-intl'
import { useRef, useState, useTransition } from 'react'
import { updateProfileAction } from '@/lib/actions/profile'

interface SettingsFormProps {
  initialData: {
    display_name: string
    bio: string
    locale: string
  }
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const t = useTranslations('settings')
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(formData: FormData) {
    setSaved(false)
    setError('')
    startTransition(async () => {
      const result = await updateProfileAction(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    })
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-5">
      {/* Display Name */}
      <div>
        <label htmlFor="display_name" className="mb-1 block text-sm font-medium text-text-secondary">
          {t('displayName')}
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          defaultValue={initialData.display_name}
          maxLength={50}
          required
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-crystal-blue focus:outline-none focus:ring-1 focus:ring-crystal-blue"
        />
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="mb-1 block text-sm font-medium text-text-secondary">
          {t('bio')}
        </label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={initialData.bio}
          maxLength={300}
          rows={4}
          className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-crystal-blue focus:outline-none focus:ring-1 focus:ring-crystal-blue"
          placeholder={t('bioPlaceholder')}
        />
        <p className="mt-1 text-xs text-text-muted">
          {t('bioMax')}
        </p>
      </div>

      {/* Language */}
      <div>
        <label htmlFor="locale" className="mb-1 block text-sm font-medium text-text-secondary">
          {t('language')}
        </label>
        <select
          id="locale"
          name="locale"
          defaultValue={initialData.locale}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-crystal-blue focus:outline-none focus:ring-1 focus:ring-crystal-blue"
        >
          <option value="en">English</option>
          <option value="fr">Fran\u00e7ais</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-crystal-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-crystal-blue/90 disabled:opacity-50"
        >
          {isPending ? '...' : t('save')}
        </button>
        {saved && (
          <span className="text-sm text-green-400">{t('saved')}</span>
        )}
      </div>
    </form>
  )
}
