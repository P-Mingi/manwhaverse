import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getUser } from '@/lib/auth/session'
import { PageContainer } from '@/components/layouts/PageContainer'
import { createFanArtAction } from '@/lib/actions/fan-art'

interface NewArtworkProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: NewArtworkProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'artwork' })
  return { title: `${t('submit')} — ManhwaVerse` }
}

export default async function NewArtworkPage({ params }: NewArtworkProps) {
  const { locale } = await params
  const user = await getUser()
  if (!user) redirect(`/${locale}/sign-in`)

  const t = await getTranslations({ locale, namespace: 'artwork' })

  async function handleCreate(formData: FormData) {
    'use server'
    const rawUrls = (formData.get('image_urls') as string) ?? ''
    const image_urls = rawUrls
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http'))
      .slice(0, 10)

    const rawTags = (formData.get('tags') as string) ?? ''
    const tags = rawTags
      .split(',')
      .map((t) => t.trim().toLowerCase().replace(/\s+/g, '-'))
      .filter(Boolean)
      .slice(0, 10)

    await createFanArtAction({
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || null,
      manhwa_id: (formData.get('manhwa_id') as string) || null,
      is_original: formData.get('credit_type') === 'mine',
      credit_name: (formData.get('credit_name') as string) || null,
      credit_url: (formData.get('credit_url') as string) || null,
      is_nsfw: formData.get('is_nsfw') === 'on',
      tags,
      image_urls,
      locale,
    })
  }

  return (
    <PageContainer className="max-w-lg">
      <h1 className="mb-8 font-display text-2xl font-bold">{t('submit')}</h1>

      <form action={handleCreate} className="flex flex-col gap-6">
        {/* Image URLs */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            {t('imageUrlsField')}
          </label>
          <textarea
            name="image_urls"
            required
            rows={4}
            placeholder={t('imageUrlsPlaceholder')}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-crystal-blue focus:outline-none"
          />
          <p className="mt-1 text-xs text-text-muted">
            Imgur, Twitter, Pixiv, etc. — one URL per line
          </p>
        </div>

        {/* Title */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            {t('titleField')} *
          </label>
          <input
            name="title"
            type="text"
            required
            minLength={3}
            maxLength={200}
            placeholder={t('titlePlaceholder')}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-crystal-blue focus:outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            {t('descriptionField')}
          </label>
          <textarea
            name="description"
            maxLength={2000}
            rows={3}
            placeholder={t('descriptionPlaceholder')}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-crystal-blue focus:outline-none"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            {t('tagsField')}
          </label>
          <input
            name="tags"
            type="text"
            placeholder={t('tagsPlaceholder')}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-crystal-blue focus:outline-none"
          />
          <p className="mt-1 text-xs text-text-muted">
            Suggestions: digital, traditional, sketch, colored, action, portrait, chibi, wallpaper
          </p>
        </div>

        {/* Credit type */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-text-primary">Credit</legend>
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input type="radio" name="credit_type" value="mine" defaultChecked className="accent-crystal-blue" />
            {t('isOriginal')}
          </label>
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input type="radio" name="credit_type" value="other" className="accent-crystal-blue" />
            {t('notOriginal')}
          </label>
        </fieldset>

        {/* Credit fields (always visible, only required if "other") */}
        <div className="space-y-3 rounded-lg border border-border p-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">{t('creditName')}</label>
            <input
              name="credit_name"
              type="text"
              maxLength={200}
              placeholder="Artist name"
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-crystal-blue focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">{t('creditUrl')}</label>
            <input
              name="credit_url"
              type="url"
              placeholder="https://twitter.com/artist"
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-crystal-blue focus:outline-none"
            />
          </div>
        </div>

        {/* NSFW toggle */}
        <label className="flex items-center gap-3">
          <input type="checkbox" name="is_nsfw" className="h-4 w-4 accent-crystal-blue" />
          <span className="text-sm text-text-secondary">{t('nsfw')}</span>
        </label>

        <button
          type="submit"
          className="rounded-lg bg-crystal-blue px-6 py-2.5 text-sm font-semibold text-white hover:bg-crystal-blue/90 transition-colors"
        >
          {t('publish')}
        </button>
      </form>
    </PageContainer>
  )
}
