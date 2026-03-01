import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { requireSession } from '@/lib/auth/session'
import { getUserLibrary, getLibraryCounts } from '@/lib/db/library'
import type { LibrarySort } from '@/lib/db/library'
import { ManhwaCard } from '@/components/features/ManhwaCard'
import { PageContainer } from '@/components/layouts/PageContainer'

interface LibraryPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ status?: string; sort?: string }>
}

export async function generateMetadata({ params }: LibraryPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'library' })
  return { title: t('title') }
}

const STATUSES = ['READING', 'COMPLETED', 'ON_HOLD', 'DROPPED', 'PLAN_TO_READ', 'REREADING'] as const
const SORTS: LibrarySort[] = ['updated', 'score', 'title', 'added']

export default async function LibraryPage({ params, searchParams }: LibraryPageProps) {
  const { locale } = await params
  const { status, sort } = await searchParams
  const user = await requireSession(locale)
  const t = await getTranslations({ locale, namespace: 'library' })

  const activeStatus = STATUSES.includes(status as (typeof STATUSES)[number])
    ? (status as (typeof STATUSES)[number])
    : undefined

  const activeSort: LibrarySort = SORTS.includes(sort as LibrarySort)
    ? (sort as LibrarySort)
    : 'updated'

  const [entries, counts] = await Promise.all([
    getUserLibrary(user.id, activeStatus, activeSort),
    getLibraryCounts(user.id),
  ])

  const statusLabels: Record<string, string> = {
    READING: t('reading'),
    COMPLETED: t('completed'),
    ON_HOLD: t('onHold'),
    DROPPED: t('dropped'),
    PLAN_TO_READ: t('planToRead'),
    REREADING: t('rereading'),
  }

  const sortLabels: Record<LibrarySort, string> = {
    updated: t('sortUpdated'),
    score: t('sortScore'),
    title: t('sortTitle'),
    added: t('sortAdded'),
  }

  function buildHref(newStatus?: string, newSort?: string) {
    const s = newStatus ?? (activeStatus ?? '')
    const o = newSort ?? activeSort
    const params = new URLSearchParams()
    if (s) params.set('status', s)
    if (o !== 'updated') params.set('sort', o)
    const qs = params.toString()
    return `/${locale}/library${qs ? `?${qs}` : ''}`
  }

  return (
    <PageContainer>
      <h1 className="mb-6 font-display text-2xl font-bold">{t('title')}</h1>

      {/* Status tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href={buildHref('', activeSort)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium ${
            !activeStatus
              ? 'bg-crystal-blue text-white'
              : 'bg-elevated text-text-secondary hover:bg-border'
          }`}
        >
          {t('all')} ({counts.total})
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={buildHref(s, activeSort)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              activeStatus === s
                ? 'bg-crystal-blue text-white'
                : 'bg-elevated text-text-secondary hover:bg-border'
            }`}
          >
            {statusLabels[s]} {counts[s] ? `(${counts[s]})` : ''}
          </Link>
        ))}
      </div>

      {/* Sort */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-xs text-text-muted">{t('sortBy')}:</span>
        {SORTS.map((s) => (
          <Link
            key={s}
            href={buildHref(activeStatus, s)}
            className={`rounded-md px-2 py-1 text-xs ${
              activeSort === s
                ? 'font-medium text-crystal-blue'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {sortLabels[s]}
          </Link>
        ))}
      </div>

      {entries.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {entries.map((entry) => (
            <div key={entry.id}>
              <ManhwaCard manhwa={entry.manhwa} locale={locale} />
              {/* Progress bar */}
              {entry.manhwa.chapter_count && entry.manhwa.chapter_count > 0 && (
                <div className="mt-1.5">
                  <div className="h-1 w-full overflow-hidden rounded-full bg-elevated">
                    <div
                      className="h-full rounded-full bg-crystal-blue transition-all"
                      style={{
                        width: `${Math.min(100, (entry.progress / entry.manhwa.chapter_count) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-0.5 text-center text-[10px] text-text-muted">
                    {entry.progress}/{entry.manhwa.chapter_count}
                  </p>
                </div>
              )}
              {entry.score && (
                <p className="mt-0.5 text-center text-xs text-text-muted">
                  {entry.score}/10
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-text-muted">{t('empty')}</p>
          <Link
            href={`/${locale}/search`}
            className="mt-2 inline-block text-sm text-crystal-blue hover:underline"
          >
            {t('addFirst')}
          </Link>
        </div>
      )}
    </PageContainer>
  )
}
