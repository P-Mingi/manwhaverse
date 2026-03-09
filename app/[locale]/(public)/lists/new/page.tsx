import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getUser } from '@/lib/auth/session'
import { PageContainer } from '@/components/layouts/PageContainer'
import { createListAction } from '@/lib/actions/list'

interface NewListPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: NewListPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'lists' })
  return { title: `${t('createTitle')} — ManhwaVerse` }
}

export default async function NewListPage({ params }: NewListPageProps) {
  const { locale } = await params
  const user = await getUser()

  if (!user) redirect(`/${locale}/sign-in`)

  const t = await getTranslations({ locale, namespace: 'lists' })

  async function handleCreate(formData: FormData) {
    'use server'
    const title = formData.get('title') as string
    const description = (formData.get('description') as string) || null
    const is_public = formData.get('is_public') === 'on'

    await createListAction({ title, description, is_public, locale })
  }

  return (
    <PageContainer className="max-w-lg">
      <h1 className="mb-8 font-display text-2xl font-bold">{t('createTitle')}</h1>

      <form action={handleCreate} className="flex flex-col gap-6">
        {/* Title */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary" htmlFor="title">
            {t('formTitle')}
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            minLength={3}
            maxLength={120}
            placeholder={t('formTitlePlaceholder')}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-crystal-blue focus:outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label
            className="mb-1.5 block text-sm font-medium text-text-primary"
            htmlFor="description"
          >
            {t('formDescription')}
          </label>
          <textarea
            id="description"
            name="description"
            maxLength={500}
            rows={3}
            placeholder={t('formDescriptionPlaceholder')}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-crystal-blue focus:outline-none"
          />
        </div>

        {/* Public toggle */}
        <div className="flex items-start gap-3">
          <input
            id="is_public"
            name="is_public"
            type="checkbox"
            defaultChecked
            className="mt-0.5 h-4 w-4 accent-crystal-blue"
          />
          <div>
            <label htmlFor="is_public" className="text-sm font-medium text-text-primary">
              {t('formPublic')}
            </label>
            <p className="text-xs text-text-muted">{t('formPublicHelp')}</p>
          </div>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-crystal-blue px-6 py-2.5 text-sm font-semibold text-white hover:bg-crystal-blue/90 transition-colors"
        >
          {t('formSubmit')}
        </button>
      </form>
    </PageContainer>
  )
}
