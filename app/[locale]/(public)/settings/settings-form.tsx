'use client'

import { useTranslations } from 'next-intl'
import { useRef, useState, useTransition } from 'react'
import { updateProfileAction, updateNotificationPrefsAction } from '@/lib/actions/profile'
import { updateContentFilterAction } from '@/lib/actions/nsfw'
import type { ContentFilter } from '@prisma/client'

interface SettingsFormProps {
  initialData: {
    display_name: string
    bio: string
    locale: string
    content_filter: ContentFilter
    notif_new_chapter: boolean
    notif_review_liked: boolean
    notif_new_follower: boolean
    notif_weekly_digest: boolean
    notif_email: boolean
  }
}

type NotifKey = 'notif_new_chapter' | 'notif_review_liked' | 'notif_new_follower' | 'notif_weekly_digest' | 'notif_email'

export function SettingsForm({ initialData }: SettingsFormProps) {
  const t = useTranslations('settings')
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const [contentFilter, setContentFilter] = useState<ContentFilter>(initialData.content_filter)
  const [filterPending, startFilterTransition] = useTransition()

  const [notifPrefs, setNotifPrefs] = useState({
    notif_new_chapter: initialData.notif_new_chapter,
    notif_review_liked: initialData.notif_review_liked,
    notif_new_follower: initialData.notif_new_follower,
    notif_weekly_digest: initialData.notif_weekly_digest,
    notif_email: initialData.notif_email,
  })
  const [notifPending, startNotifTransition] = useTransition()

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

  function handleFilterChange(value: ContentFilter) {
    setContentFilter(value)
    startFilterTransition(async () => {
      const result = await updateContentFilterAction(value)
      if (result.error) setError(result.error)
    })
  }

  function handleNotifChange(key: NotifKey, value: boolean) {
    const updated = { ...notifPrefs, [key]: value }
    setNotifPrefs(updated)
    startNotifTransition(async () => {
      const result = await updateNotificationPrefsAction(updated)
      if (result.error) setError(result.error)
    })
  }

  const notifToggles: { key: NotifKey; label: string }[] = [
    { key: 'notif_new_follower', label: t('notifNewFollower') },
    { key: 'notif_review_liked', label: t('notifReviewLiked') },
    { key: 'notif_new_chapter', label: t('notifNewChapter') },
    { key: 'notif_weekly_digest', label: t('notifWeeklyDigest') },
    { key: 'notif_email', label: t('notifEmail') },
  ]

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
          <option value="fr">Fran&#231;ais</option>
        </select>
      </div>

      {/* Mature Content Toggle */}
      <div>
        <label className="mb-1 block text-sm font-medium text-text-secondary">
          {t('contentFilter')}
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            type="button"
            role="switch"
            aria-checked={contentFilter === 'ALL'}
            disabled={filterPending}
            onClick={() => handleFilterChange(contentFilter === 'ALL' ? 'SAFE' : 'ALL')}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crystal-blue focus-visible:ring-offset-2 focus-visible:ring-offset-base disabled:opacity-50 ${
              contentFilter === 'ALL' ? 'bg-error' : 'bg-border'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                contentFilter === 'ALL' ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-sm text-text-primary">{t('showMatureContent')}</span>
        </label>
        <p className="mt-1 text-xs text-text-muted">
          {contentFilter === 'ALL' ? t('matureEnabled') : t('matureDisabled')}
        </p>
      </div>

      {/* Notification Preferences */}
      <div className="border-t border-border pt-5">
        <h2 className="mb-3 text-sm font-semibold text-text-primary">{t('notifTitle')}</h2>
        <div className="space-y-3">
          {notifToggles.map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-text-primary">{label}</span>
              <button
                type="button"
                role="switch"
                aria-checked={notifPrefs[key]}
                disabled={notifPending}
                onClick={() => handleNotifChange(key, !notifPrefs[key])}
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crystal-blue focus-visible:ring-offset-2 focus-visible:ring-offset-base disabled:opacity-50 ${
                  notifPrefs[key] ? 'bg-crystal-blue' : 'bg-border'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    notifPrefs[key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </label>
          ))}
        </div>
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
