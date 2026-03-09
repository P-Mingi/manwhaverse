import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getUserByUsername } from '@/lib/db/user'
import { getUserJournal } from '@/lib/db/journal'
import type { JournalEvent, JournalEventType } from '@/lib/db/journal'
import { PageContainer } from '@/components/layouts/PageContainer'

export const revalidate = 300

interface JournalPageProps {
  params: Promise<{ locale: string; username: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: JournalPageProps) {
  const { username, locale } = await params
  const t = await getTranslations({ locale, namespace: 'journal' })
  return { title: `${username} — ${t('title')}` }
}

function getEventStyle(eventType: JournalEventType): {
  icon: string
  colorClass: string
  labelKey: string
} {
  switch (eventType) {
    case 'COMPLETED':
      return { icon: '✓', colorClass: 'text-success', labelKey: 'completed' }
    case 'STARTED':
      return { icon: '▶', colorClass: 'text-crystal-blue', labelKey: 'started' }
    case 'PAUSED':
      return { icon: '⏸', colorClass: 'text-warning', labelKey: 'paused' }
    case 'DROPPED':
      return { icon: '✗', colorClass: 'text-error', labelKey: 'dropped' }
    case 'PLANNED':
      return { icon: '+', colorClass: 'text-text-muted', labelKey: 'planned' }
    case 'REREADING':
      return { icon: '↺', colorClass: 'text-crystal-void', labelKey: 'rereading' }
  }
}

function groupByMonth(
  events: JournalEvent[],
  locale: string,
): { key: string; monthLabel: string; events: JournalEvent[] }[] {
  const groups = new Map<string, { monthLabel: string; events: JournalEvent[] }>()

  for (const event of events) {
    const year = event.date.getFullYear()
    const month = event.date.getMonth()
    const key = `${year}-${String(month).padStart(2, '0')}`

    if (!groups.has(key)) {
      const monthLabel = event.date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
      })
      groups.set(key, { monthLabel, events: [] })
    }
    groups.get(key)!.events.push(event)
  }

  return Array.from(groups.entries()).map(([key, value]) => ({ key, ...value }))
}

export default async function JournalPage({ params, searchParams }: JournalPageProps) {
  const { locale, username } = await params
  const { page } = await searchParams
  const t = await getTranslations({ locale, namespace: 'journal' })

  const profileUser = await getUserByUsername(username)
  if (!profileUser) notFound()

  const currentPage = parseInt(page ?? '1', 10)
  const limit = 60
  const { events, total } = await getUserJournal(profileUser.id, currentPage, limit)
  const totalPages = Math.ceil(total / limit)

  const grouped = groupByMonth(events, locale)

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/${locale}/profile/${username}`}
          className="text-sm text-crystal-blue hover:underline"
        >
          &larr; {profileUser.display_name ?? profileUser.username}
        </Link>
        <h1 className="mt-2 font-display text-xl font-bold">{t('title')}</h1>
        {total > 0 && (
          <p className="text-sm text-text-muted">
            {total} {t('entries')}
          </p>
        )}
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-text-muted">{t('empty')}</p>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ key, monthLabel, events: monthEvents }) => (
            <section key={key}>
              {/* Month header */}
              <div className="mb-3 flex items-center gap-3">
                <h2 className="whitespace-nowrap text-xs font-bold uppercase tracking-wider text-text-muted">
                  {monthLabel}
                </h2>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Entries */}
              <div className="space-y-px">
                {monthEvents.map((event) => {
                  const style = getEventStyle(event.eventType)
                  const title =
                    locale === 'fr' && event.manhwa.title_fr
                      ? event.manhwa.title_fr
                      : event.manhwa.title_en
                  const dayLabel = event.date.toLocaleDateString(locale, {
                    day: 'numeric',
                    month: 'short',
                  })

                  return (
                    <div
                      key={event.id}
                      className="group flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-surface"
                    >
                      {/* Small cover */}
                      <div className="h-10 w-7 flex-shrink-0 overflow-hidden rounded bg-elevated">
                        {event.manhwa.cover_url ? (
                          <img
                            src={event.manhwa.cover_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-elevated" />
                        )}
                      </div>

                      {/* Date */}
                      <span className="w-16 flex-shrink-0 font-mono text-xs text-text-muted">
                        {dayLabel}
                      </span>

                      {/* Event icon + label */}
                      <span className={`w-24 flex-shrink-0 text-xs font-medium ${style.colorClass}`}>
                        <span className="mr-1">{style.icon}</span>
                        {t(style.labelKey as Parameters<typeof t>[0])}
                      </span>

                      {/* Manhwa title */}
                      <Link
                        href={`/${locale}/manhwa/${event.manhwa.slug}`}
                        className="min-w-0 flex-1 truncate text-sm text-text-primary transition-colors hover:text-crystal-blue"
                      >
                        {title}
                      </Link>

                      {/* Score */}
                      {event.eventType === 'COMPLETED' && event.score !== null && (
                        <span className="flex-shrink-0 font-mono text-xs text-crystal-gold">
                          ★ {event.score % 1 === 0 ? event.score.toFixed(0) : event.score.toFixed(1)}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: Math.min(totalPages, 10) }).map((_, i) => {
            const p = i + 1
            return (
              <a
                key={p}
                href={`/${locale}/profile/${username}/journal?page=${p}`}
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
