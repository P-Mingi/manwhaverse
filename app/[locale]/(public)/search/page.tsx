import { getTranslations } from 'next-intl/server'
import { searchManhwas } from '@/lib/db/search'
import { getPopularManhwas } from '@/lib/db/home'
import { getAllGenres } from '@/lib/db/genre'
import { getAllTropes } from '@/lib/db/trope'
import { getCurrentContentFilter } from '@/lib/nsfw'
import { getUser } from '@/lib/auth/session'
import { getUserLibraryMap, type LibraryMapEntry } from '@/lib/db/library-map'
import { ManhwaCard } from '@/components/features/ManhwaCard'
import { PageContainer } from '@/components/layouts/PageContainer'
import { SearchBar } from '@/components/features/SearchBar'

export const revalidate = 300

interface SearchPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    q?: string
    page?: string
    sort?: string
    status?: string
    type?: string
    genre?: string
    trope?: string
    year?: string
  }>
}

export async function generateMetadata({ params }: SearchPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'nav' })
  return { title: t('search') }
}

export default async function SearchPage({
  params,
  searchParams,
}: SearchPageProps) {
  const { locale } = await params
  const { q, page, sort, status, type, genre, trope, year } = await searchParams
  const t = await getTranslations({ locale, namespace: 'search' })

  const currentPage = parseInt(page ?? '1', 10)
  const hasQuery = q && q.trim().length > 0
  const hasFilters = status || type || genre || trope || year
  const [contentFilter, user] = await Promise.all([getCurrentContentFilter(), getUser()])
  const libraryMap = user ? await getUserLibraryMap(user.id) : new Map<string, LibraryMapEntry>()

  const [genres, tropes] = await Promise.all([
    getAllGenres(),
    getAllTropes(),
  ])

  let results, total
  if (hasQuery || hasFilters || sort) {
    const data = await searchManhwas({
      query: hasQuery ? q.trim() : undefined,
      page: currentPage,
      sortBy:
        (sort as 'relevance' | 'score' | 'popularity' | 'recent') ??
        'relevance',
      status,
      type,
      genre,
      trope,
      year: year ? parseInt(year, 10) : undefined,
    })
    results = data.results
    total = data.total
  } else {
    results = await getPopularManhwas(24)
    total = results.length
  }

  const totalPages = Math.ceil(total / 24)

  function paginationHref(p: number) {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (status) params.set('status', status)
    if (type) params.set('type', type)
    if (genre) params.set('genre', genre)
    if (trope) params.set('trope', trope)
    if (year) params.set('year', year)
    if (sort) params.set('sort', sort)
    params.set('page', String(p))
    return `/${locale}/search?${params.toString()}`
  }

  return (
    <PageContainer>
      <h1 className="mb-6 font-display text-2xl font-bold">
        {t('placeholder').replace('...', '')}
      </h1>

      <SearchBar
        defaultValue={q ?? ''}
        locale={locale}
        currentStatus={status}
        currentType={type}
        currentSort={sort}
        currentGenre={genre}
        currentTrope={trope}
        currentYear={year}
        genres={genres.map((g) => ({
          slug: g.slug,
          name: locale === 'fr' ? g.name_fr : g.name_en,
        }))}
        tropes={tropes.map((t) => ({
          slug: t.slug,
          name: t.name,
        }))}
      />

      {hasQuery && (
        <p className="mt-4 text-sm text-text-muted">
          {t('resultsFor', { count: total, query: q })}
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {results.map((m) => {
          const entry = libraryMap.get(m.id)
          return (
            <ManhwaCard
              key={m.id}
              manhwa={m}
              locale={locale}
              userContentFilter={contentFilter}
              libraryStatus={entry?.status ?? null}
              isFavorite={entry?.is_favorite ?? false}
              isLoggedIn={!!user}
            />
          )
        })}
      </div>

      {results.length === 0 && (
        <div className="py-20 text-center text-text-muted">
          {t('noResults')}
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
                href={paginationHref(p)}
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
