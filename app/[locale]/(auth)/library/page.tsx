import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { requireSession } from '@/lib/auth/session'
import { getUserLibrary } from '@/lib/db/library'
import { ManhwaCard } from '@/components/features/ManhwaCard'
import { PageContainer } from '@/components/layouts/PageContainer'

interface LibraryPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ status?: string }>
}

export async function generateMetadata({ params }: LibraryPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'library' })
  return { title: t('title') }
}

const STATUSES = ['READING', 'COMPLETED', 'ON_HOLD', 'DROPPED', 'PLAN_TO_READ', 'REREADING'] as const

export default async function LibraryPage({ params, searchParams }: LibraryPageProps) {
  const { locale } = await params
  const { status } = await searchParams
  const user = await requireSession(locale)
  const t = await getTranslations({ locale, namespace: 'library' })

  const activeStatus = STATUSES.includes(status as (typeof STATUSES)[number])
    ? (status as (typeof STATUSES)[number])
    : undefined

  const entries = await getUserLibrary(user.id, activeStatus)

  const statusLabels: Record<string, string> = {
    READING: t('reading'),
    COMPLETED: t('completed'),
    ON_HOLD: t('onHold'),
    DROPPED: t('dropped'),
    PLAN_TO_READ: t('planToRead'),
    REREADING: t('rereading'),
  }

  return (
    <PageContainer>
      <h1 className="mb-6 font-display text-2xl font-bold">{t('title')}</h1>

      {/* Status tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href={`/${locale}/library`}
          className={`rounded-md px-3 py-1.5 text-xs font-medium ${
            !activeStatus
              ? 'bg-crystal-blue text-white'
              : 'bg-elevated text-text-secondary hover:bg-border'
          }`}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/${locale}/library?status=${s}`}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              activeStatus === s
                ? 'bg-crystal-blue text-white'
                : 'bg-elevated text-text-secondary hover:bg-border'
            }`}
          >
            {statusLabels[s]}
          </Link>
        ))}
      </div>

      {entries.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {entries.map((entry) => (
            <div key={entry.id} className="relative">
              <ManhwaCard manhwa={entry.manhwa} locale={locale} />
              {entry.score && (
                <div className="mt-1 text-center text-xs text-text-muted">
                  Score: {entry.score}/10
                </div>
              )}
              {entry.progress > 0 && entry.manhwa.chapter_count && (
                <div className="mt-0.5 text-center text-xs text-text-muted">
                  Ch. {entry.progress}/{entry.manhwa.chapter_count}
                </div>
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
