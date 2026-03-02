import Link from 'next/link'
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

interface ExplorePageProps {
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

export async function generateMetadata({ params }: ExplorePageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'explore' })
  return { title: t('title') }
}

export default async function ExplorePage({ params, searchParams }: ExplorePageProps) {
  const { locale } = await params
  const { q, page, sort, status, type, genre, trope, year } = await searchParams
  const t = await getTranslations({ locale, namespace: 'explore' })

  const currentPage = parseInt(page ?? '1', 10)
  const hasQuery = q && q.trim().length > 0
  const hasFilters = status || type || genre || trope || year

  const [contentFilter, user, genres, tropes] = await Promise.all([
    getCurrentContentFilter(),
    getUser(),
    getAllGenres(),
    getAllTropes(),
  ])
  const libraryMap = user
    ? await getUserLibraryMap(user.id)
    : new Map<string, LibraryMapEntry>()

  let results, total
  if (hasQuery || hasFilters || sort) {
    const data = await searchManhwas({
      query: hasQuery ? q.trim() : undefined,
      page: currentPage,
      sortBy: (sort as 'relevance' | 'score' | 'popularity' | 'recent') ?? 'popularity',
      status,
      type,
      genre,
      trope,
      year: year ? parseInt(year, 10) : undefined,
    })
    results = data.results
    total = data.total
  } else {
    results = await getPopularManhwas(48)
    total = results.length
  }

  const totalPages = Math.ceil(total / 24)

  function exploreHref(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams()
    const nq = 'q' in overrides ? overrides.q : q
    if (nq) p.set('q', nq)
    const ns = 'status' in overrides ? overrides.status : status
    if (ns) p.set('status', ns)
    const nt = 'type' in overrides ? overrides.type : type
    if (nt) p.set('type', nt)
    const ng = 'genre' in overrides ? overrides.genre : genre
    if (ng) p.set('genre', ng)
    const ntr = 'trope' in overrides ? overrides.trope : trope
    if (ntr) p.set('trope', ntr)
    const ny = 'year' in overrides ? overrides.year : year
    if (ny) p.set('year', ny)
    const nso = 'sort' in overrides ? overrides.sort : sort
    if (nso && nso !== 'relevance') p.set('sort', nso)
    const np = 'page' in overrides ? overrides.page : undefined
    if (np) p.set('page', np)
    const qs = p.toString()
    return `/${locale}/explore${qs ? `?${qs}` : ''}`
  }

  // Group tropes by category
  const groupedTropes = tropes.reduce<Record<string, typeof tropes>>((acc, t) => {
    if (!acc[t.category]) acc[t.category] = []
    acc[t.category]!.push(t)
    return acc
  }, {})

  return (
    <PageContainer>
      {/* Search bar */}
      <div className="mb-6">
        <SearchBar
          defaultValue={q ?? ''}
          locale={locale}
          basePath="explore"
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
          tropes={tropes.map((tr) => ({
            slug: tr.slug,
            name: tr.name,
          }))}
        />
      </div>

      {/* Genre chips — horizontal scroll */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href={exploreHref({ genre: undefined })}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              !genre
                ? 'bg-crystal-blue text-white'
                : 'bg-elevated text-text-secondary hover:bg-border'
            }`}
          >
            {t('allGenres') ?? 'All'}
          </Link>
          {genres.map((g) => {
            const name = locale === 'fr' ? g.name_fr : g.name_en
            const active = genre === g.slug
            return (
              <Link
                key={g.id}
                href={exploreHref({ genre: active ? undefined : g.slug, page: undefined })}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-crystal-blue text-white'
                    : 'bg-elevated text-text-secondary hover:bg-border'
                }`}
              >
                {name}
                <span className={`ml-1.5 text-xs ${active ? 'text-white/70' : 'text-text-muted'}`}>
                  {g._count.manhwa_links}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Results count */}
      {(hasQuery || hasFilters) && (
        <p className="mb-4 text-sm text-text-muted">
          {total} {total === 1 ? 'title' : 'titles'}
          {genre && ` in ${genres.find((g) => g.slug === genre)?.[locale === 'fr' ? 'name_fr' : 'name_en'] ?? genre}`}
        </p>
      )}

      {/* Manhwa grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
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
        <div className="py-20 text-center text-text-muted">No titles found</div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: Math.min(totalPages, 10) }).map((_, i) => {
            const p = i + 1
            return (
              <Link
                key={p}
                href={exploreHref({ page: String(p) })}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  p === currentPage
                    ? 'bg-crystal-blue text-white'
                    : 'bg-elevated text-text-secondary hover:bg-border'
                }`}
              >
                {p}
              </Link>
            )
          })}
        </div>
      )}

      {/* Browse by Trope */}
      <section className="mt-16 border-t border-border pt-12">
        <h2 className="mb-6 font-display text-xl font-bold">{t('tropes') ?? 'Browse by Trope'}</h2>
        {Object.entries(groupedTropes).map(([category, tropesInCat]) => (
          <div key={category} className="mb-8">
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-text-muted">
              {category.replace(/_/g, ' ')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {tropesInCat.map((tr) => {
                const active = trope === tr.slug
                return (
                  <Link
                    key={tr.id}
                    href={exploreHref({ trope: active ? undefined : tr.slug, page: undefined })}
                    className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                      active
                        ? 'bg-crystal-blue/20 text-crystal-blue ring-1 ring-crystal-blue/40'
                        : 'bg-elevated text-text-secondary hover:bg-border'
                    }`}
                  >
                    {tr.name}
                    <span className={`ml-1.5 text-xs ${active ? 'text-crystal-blue/70' : 'text-text-muted'}`}>
                      {tr._count.manhwa_links}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </section>
    </PageContainer>
  )
}
