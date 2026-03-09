import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { requireSession } from '@/lib/auth/session'
import { getFeedForUser, getPublicFeed } from '@/lib/db/activity'
import { ActivityCard } from '@/components/features/ActivityCard'
import { PageContainer } from '@/components/layouts/PageContainer'

interface FeedPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string; mode?: string }>
}

export async function generateMetadata({ params }: FeedPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'feed' })
  return { title: t('title'), robots: { index: false } }
}

export default async function FeedPage({ params, searchParams }: FeedPageProps) {
  const { locale } = await params
  const { page, mode } = await searchParams
  const user = await requireSession(locale)
  const t = await getTranslations({ locale, namespace: 'feed' })

  const currentPage = parseInt(page ?? '1', 10)
  const isFriends = mode === 'friends'

  const { activities, total } = isFriends
    ? await getFeedForUser(user.id, currentPage)
    : await getPublicFeed(currentPage)

  const totalPages = Math.ceil(total / 20)

  return (
    <PageContainer>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="section-title-bar font-display text-2xl uppercase tracking-wider text-text-primary">
          {t('title')}
        </h1>
        {/* Friends / Everyone toggle */}
        <div className="flex rounded-lg border border-electric-border p-0.5">
          <Link
            href={`/${locale}/feed?mode=friends`}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              isFriends ? 'bg-electric text-black' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {locale === 'fr' ? 'Amis' : 'Friends'}
          </Link>
          <Link
            href={`/${locale}/feed`}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              !isFriends ? 'bg-electric text-black' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {locale === 'fr' ? 'Tous' : 'Everyone'}
          </Link>
        </div>
      </div>

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
                href={`/${locale}/feed?page=${p}${isFriends ? '&mode=friends' : ''}`}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  p === currentPage
                    ? 'bg-electric text-black'
                    : 'bg-elevated text-text-secondary hover:bg-electric-glow'
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
