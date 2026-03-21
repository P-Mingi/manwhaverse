'use client'

import { useTranslations } from 'next-intl'
import { useRef, useState, useTransition } from 'react'
import { updateProfileAction, updateNotificationPrefsAction } from '@/lib/actions/profile'
import { updateContentFilterAction } from '@/lib/actions/nsfw'
import { Avatar } from '@/components/ui/Avatar'
import type { ContentFilter } from '@prisma/client'

interface SettingsFormProps {
  initialData: {
    avatar_url: string | null
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialData.avatar_url)
  const [avatarUrlInput, setAvatarUrlInput] = useState(initialData.avatar_url ?? '')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const avatarInputRef = useRef<HTMLInputElement>(null)

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

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarError('')
    setAvatarUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/upload-avatar', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setAvatarError(data.error ?? t('avatarError'))
      } else {
        setAvatarUrl(data.url)
        setAvatarUrlInput(data.url)
      }
    } catch {
      setAvatarError(t('avatarError'))
    } finally {
      setAvatarUploading(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
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
      {/* Avatar */}
      <div>
        <label className="mb-1 block text-sm font-medium text-text-secondary">
          {t('avatarLabel')}
        </label>
        <div className="flex items-start gap-4">
          <Avatar src={avatarUrl} username={initialData.display_name} size={72} />
          <div className="flex-1 space-y-2">
            {/* URL input */}
            <div>
              <input
                name="avatar_url"
                type="url"
                value={avatarUrlInput}
                onChange={(e) => {
                  setAvatarUrlInput(e.target.value)
                  setAvatarUrl(e.target.value || null)
                }}
                placeholder="https://..."
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-crystal-blue focus:outline-none focus:ring-1 focus:ring-crystal-blue"
              />
              <p className="mt-1 text-xs text-text-muted">
                {initialData.locale === 'fr' ? "Collez l'URL d'une image" : 'Paste an image URL'}
              </p>
            </div>
            {/* Or upload a file */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={avatarUploading}
                onClick={() => avatarInputRef.current?.click()}
                className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary transition-colors hover:bg-elevated disabled:opacity-50"
              >
                {avatarUploading ? t('avatarUploading') : t('avatarChange')}
              </button>
              <span className="text-xs text-text-muted">JPG, PNG, WebP — max 5MB</span>
            </div>
            {avatarError && <p className="text-xs text-error">{avatarError}</p>}
          </div>
        </div>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

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
