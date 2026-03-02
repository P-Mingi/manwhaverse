import { getTranslations } from 'next-intl/server'
import { requireSession } from '@/lib/auth/session'
import { getFeedForUser } from '@/lib/db/activity'
import { ActivityCard } from '@/components/features/ActivityCard'
import { PageContainer } from '@/components/layouts/PageContainer'

interface FeedPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: FeedPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'feed' })
  return { title: t('title') }
}

export default async function FeedPage({ params, searchParams }: FeedPageProps) {
  const { locale } = await params
  const { page } = await searchParams
  const user = await requireSession(locale)
  const t = await getTranslations({ locale, namespace: 'feed' })

  const currentPage = parseInt(page ?? '1', 10)
  const { activities, total } = await getFeedForUser(user.id, currentPage)
  const totalPages = Math.ceil(total / 20)

  return (
    <PageContainer>
      <h1 className="mb-6 font-display text-2xl font-bold">{t('title')}</h1>

      {activities.length === 0 ? (
        <p className="py-20 text-center text-sm text-text-muted">{t('empty')}</p>
      ) : (
        <div className="space-y-2">
          {activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              locale={locale}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: Math.min(totalPages, 10) }).map((_, i) => {
            const p = i + 1
            return (
              <a
                key={p}
                href={`/${locale}/feed?page=${p}`}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  p === currentPage
                    ? 'bg-crystal-blue text-white'
                    : 'bg-elevated text-text-secondary hover:bg-border'
                }`}
              >
                {p}
              </a>
            )
          })}
        </div>
      )}
    </PageContainer>
  )
}
