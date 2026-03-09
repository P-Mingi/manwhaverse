import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { getListBySlug } from '@/lib/db/list'
import { getUser } from '@/lib/auth/session'
import { PageContainer } from '@/components/layouts/PageContainer'
import { updateListFromFormAction, deleteListAction, removeItemFromListAction } from '@/lib/actions/list'
import { AddManhwaSearch } from './AddManhwaSearch'

interface EditListProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: EditListProps) {
  const { slug } = await params
  const list = await getListBySlug(slug)
  if (!list) return {}
  return { title: `Edit — ${list.title} — ManhwaVerse` }
}

export default async function EditListPage({ params }: EditListProps) {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: 'lists' })

  const [list, user] = await Promise.all([getListBySlug(slug), getUser()])

  if (!list) notFound()
  if (!user || user.id !== list.user_id) redirect(`/${locale}/lists/${slug}`)

  const existingManhwaIds = list.items.map((i) => i.manhwa.id)

  return (
    <PageContainer className="max-w-2xl">
      {/* Back */}
      <Link
        href={`/${locale}/lists/${slug}`}
        className="mb-6 inline-block text-sm text-text-muted hover:text-text-primary"
      >
        ← {t('backToList')}
      </Link>

      <h1 className="mb-8 font-display text-2xl font-bold">{t('editTitle')}</h1>

      {/* Metadata form */}
      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
          {t('editMetadata')}
        </h2>
        <form action={updateListFromFormAction.bind(null, list.id, locale)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              {t('formTitle')} *
            </label>
            <input
              name="title"
              type="text"
              required
              minLength={3}
              maxLength={120}
              defaultValue={list.title}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-crystal-blue focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              {t('formDescription')}
            </label>
            <textarea
              name="description"
              rows={3}
              maxLength={500}
              defaultValue={list.description ?? ''}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-crystal-blue focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-3 text-sm text-text-secondary">
            <input
              type="checkbox"
              name="is_public"
              defaultChecked={list.is_public}
              className="h-4 w-4 accent-crystal-blue"
            />
            {t('formPublic')}
          </label>

          <button
            type="submit"
            className="rounded-lg bg-crystal-blue px-5 py-2.5 text-sm font-medium text-white hover:bg-crystal-blue/90"
          >
            {t('saveChanges')}
          </button>
        </form>
      </section>

      {/* Current items */}
      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
          {t('currentItems')} ({list.items.length})
        </h2>

        {list.items.length === 0 ? (
          <p className="text-sm text-text-muted">{t('emptyList')}</p>
        ) : (
          <div className="space-y-2">
            {list.items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-elevated px-3 py-2"
              >
                <span className="w-5 shrink-0 text-center font-mono text-xs text-text-muted">
                  {index + 1}
                </span>
                <div className="relative h-10 w-7 shrink-0 overflow-hidden rounded bg-surface">
                  {item.manhwa.cover_url && (
                    <Image
                      src={item.manhwa.cover_url}
                      alt={item.manhwa.title_en}
                      fill
                      sizes="28px"
                      className="object-cover"
                    />
                  )}
                </div>
                <span className="flex-1 text-sm text-text-primary line-clamp-1">
                  {item.manhwa.title_en}
                </span>
                <form action={removeItemFromListAction.bind(null, list.id, item.manhwa.id)}>
                  <button
                    type="submit"
                    className="text-xs text-error/60 hover:text-error"
                  >
                    {t('removeItem')}
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add manhwa */}
      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
          {t('addManhwa')}
        </h2>
        <AddManhwaSearch
          listId={list.id}
          existingManhwaIds={existingManhwaIds}
          addLabel={t('addToList')}
          addedLabel={t('addedToList')}
          searchPlaceholder={t('searchPlaceholder')}
          noResultsLabel={t('noResults')}
        />
      </section>

      {/* Danger zone */}
      <section className="rounded-xl border border-error/30 bg-error/5 p-5">
        <h2 className="mb-2 text-sm font-semibold text-error">{t('dangerZone')}</h2>
        <p className="mb-4 text-xs text-text-muted">{t('deleteConfirm')}</p>
        <form action={deleteListAction.bind(null, list.id, locale)}>
          <button
            type="submit"
            className="rounded-lg bg-error/20 px-4 py-2 text-sm font-medium text-error hover:bg-error/30"
          >
            {t('deleteList')}
          </button>
        </form>
      </section>
    </PageContainer>
  )
}
