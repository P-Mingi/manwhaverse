import Image from 'next/image'
import Link from 'next/link'
import { requireSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'
import { PageContainer } from '@/components/layouts/PageContainer'
import { formatScore } from '@/lib/utils/formatScore'

interface DiaryPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: DiaryPageProps) {
  const { locale } = await params
  return {
    title: locale === 'fr' ? 'Mon Journal' : 'Reading Diary',
    robots: { index: false },
  }
}

export default async function DiaryPage({ params }: DiaryPageProps) {
  const { locale } = await params
  const user = await requireSession(locale)

  const entries = await prisma.userLibrary.findMany({
    where: {
      user_id: user.id,
      read_at: { not: null },
    },
    include: {
      manhwa: {
        select: {
          id: true,
          slug: true,
          title_en: true,
          title_fr: true,
          cover_url: true,
        },
      },
    },
    orderBy: { read_at: 'desc' },
  })

  // Group by year then month
  type Entry = typeof entries[number]
  const grouped = new Map<number, Map<number, Entry[]>>()
  for (const entry of entries) {
    const date = entry.read_at!
    const year = date.getFullYear()
    const month = date.getMonth()
    if (!grouped.has(year)) grouped.set(year, new Map())
    const yearMap = grouped.get(year)!
    if (!yearMap.has(month)) yearMap.set(month, [])
    yearMap.get(month)!.push(entry)
  }

  const years = Array.from(grouped.keys()).sort((a, b) => b - a)

  const MONTH_NAMES_EN = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  const MONTH_NAMES_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
  const monthNames = locale === 'fr' ? MONTH_NAMES_FR : MONTH_NAMES_EN

  return (
    <PageContainer>
      <div className="mx-auto max-w-3xl py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="section-title-bar font-display text-2xl uppercase tracking-wider text-text-primary">
            {locale === 'fr' ? 'Journal de lecture' : 'Reading Diary'}
          </h1>
          <span className="text-sm text-text-muted">
            {entries.length} {locale === 'fr' ? 'entrées' : 'entries'}
          </span>
        </div>

        {entries.length === 0 ? (
          <div className="rounded-lg border border-electric-border bg-card p-12 text-center">
            <p className="text-text-secondary">
              {locale === 'fr'
                ? 'Aucune entrée dans votre journal. Définissez une date de lecture dans l\'éditeur de bibliothèque.'
                : 'No diary entries yet. Set a diary date in the library editor.'}
            </p>
            <Link
              href={`/${locale}/library`}
              className="mt-4 inline-block rounded-md bg-electric px-4 py-2 text-sm font-medium text-black transition-all hover:-translate-y-px"
            >
              {locale === 'fr' ? 'Voir ma bibliothèque' : 'View my library'}
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {years.map((year) => {
              const yearMap = grouped.get(year)!
              const months = Array.from(yearMap.keys()).sort((a, b) => b - a)
              const yearCount = months.reduce((sum, m) => sum + yearMap.get(m)!.length, 0)
              return (
                <section key={year}>
                  <div className="mb-4 flex items-baseline gap-3 border-b border-electric-border pb-2">
                    <h2 className="font-display text-3xl text-electric">{year}</h2>
                    <span className="text-sm text-text-muted">{yearCount} {locale === 'fr' ? 'titres' : 'titles'}</span>
                  </div>
                  <div className="space-y-6">
                    {months.map((month) => {
                      const monthEntries = yearMap.get(month)!
                      return (
                        <div key={month}>
                          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
                            {monthNames[month]}
                          </h3>
                          <div className="space-y-2">
                            {monthEntries.map((entry) => {
                              const title = locale === 'fr'
                                ? (entry.manhwa.title_fr ?? entry.manhwa.title_en)
                                : entry.manhwa.title_en
                              const date = entry.read_at!
                              const dateStr = date.toLocaleDateString(locale, {
                                day: 'numeric',
                                month: 'short',
                              })
                              return (
                                <div
                                  key={entry.id}
                                  className="grid grid-cols-[36px_48px_1fr_auto] items-center gap-3 rounded-lg border border-electric-border bg-card px-4 py-3 transition-colors hover:border-electric/40"
                                >
                                  {/* Day */}
                                  <span className="text-right font-mono text-sm font-bold text-electric">
                                    {date.getDate()}
                                  </span>

                                  {/* Cover */}
                                  <Link href={`/${locale}/manhwa/${entry.manhwa.slug}`} className="flex-shrink-0">
                                    {entry.manhwa.cover_url ? (
                                      <Image
                                        src={entry.manhwa.cover_url}
                                        alt={title}
                                        width={48}
                                        height={64}
                                        className="h-16 w-12 rounded object-cover"
                                      />
                                    ) : (
                                      <div className="h-16 w-12 rounded bg-elevated" />
                                    )}
                                  </Link>

                                  {/* Title + meta */}
                                  <div className="min-w-0">
                                    <Link
                                      href={`/${locale}/manhwa/${entry.manhwa.slug}`}
                                      className="truncate font-medium text-text-primary transition-colors hover:text-electric"
                                    >
                                      {title}
                                    </Link>
                                    <p className="mt-0.5 text-xs text-text-muted">
                                      {entry.status.toLowerCase().replace('_', ' ')}
                                      {entry.reread_count > 0 && ` · ${entry.reread_count}× reread`}
                                      {' · '}{dateStr}
                                    </p>
                                  </div>

                                  {/* Score */}
                                  {entry.score != null && (
                                    <span className="shrink-0 font-mono text-sm font-bold text-gold">
                                      ★ {formatScore(entry.score)}
                                    </span>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </PageContainer>
  )
}
