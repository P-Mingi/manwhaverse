import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { searchManhwas } from '@/lib/db/search'
import { getAllGenres } from '@/lib/db/genre'
import { getAllTropes } from '@/lib/db/trope'
import { getCurrentContentFilter } from '@/lib/nsfw'
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

  const [contentFilter, genres, tropes] = await Promise.all([
    getCurrentContentFilter(),
    getAllGenres(),
    getAllTropes(),
  ])

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
  const results = data.results
  const total = data.total

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
                ? 'bg-[rgba(0,255,255,0.08)] border border-[rgba(0,255,255,0.3)] text-[#00ffff]'
                : 'border border-white/10 bg-white/[0.03] text-[#9999b8] hover:bg-[rgba(0,255,255,0.08)] hover:border-[rgba(0,255,255,0.3)] hover:text-[#00ffff]'
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
                    ? 'bg-[rgba(0,255,255,0.08)] border border-[rgba(0,255,255,0.3)] text-[#00ffff]'
                    : 'border border-white/10 bg-white/[0.03] text-[#9999b8] hover:bg-[rgba(0,255,255,0.08)] hover:border-[rgba(0,255,255,0.3)] hover:text-[#00ffff]'
                }`}
              >
                {name}
                <span className={`ml-1.5 text-xs ${active ? 'text-[#00ffff]/70' : 'text-[#6b6b88]'}`}>
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
        {results.map((m) => (
          <ManhwaCard
            key={m.id}
            manhwa={m}
            locale={locale}
            userContentFilter={contentFilter}
          />
        ))}
      </div>

      {results.length === 0 && (
        <div className="py-20 text-center text-text-muted">No titles found</div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (() => {
        const windowSize = 10
        let start = Math.max(1, currentPage - Math.floor(windowSize / 2))
        let end = start + windowSize - 1
        if (end > totalPages) { end = totalPages; start = Math.max(1, end - windowSize + 1) }
        const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)
        return (
          <div className="mt-8 flex justify-center gap-2">
            {currentPage > 1 && (
              <Link href={exploreHref({ page: String(currentPage - 1) })} className="rounded-md px-3 py-1.5 text-sm border border-white/10 bg-[#0d0d16] text-[#9999b8] hover:border-[rgba(0,255,255,0.3)] hover:text-[#00ffff]">‹</Link>
            )}
            {pages.map((p) => (
              <Link
                key={p}
                href={exploreHref({ page: String(p) })}
                className={`rounded-md px-3 py-1.5 text-sm ${p === currentPage ? 'bg-[#00ffff] text-black font-bold' : 'border border-white/10 bg-[#0d0d16] text-[#9999b8] hover:border-[rgba(0,255,255,0.3)] hover:text-[#00ffff]'}`}
              >
                {p}
              </Link>
            ))}
            {currentPage < totalPages && (
              <Link href={exploreHref({ page: String(currentPage + 1) })} className="rounded-md px-3 py-1.5 text-sm border border-white/10 bg-[#0d0d16] text-[#9999b8] hover:border-[rgba(0,255,255,0.3)] hover:text-[#00ffff]">›</Link>
            )}
          </div>
        )
      })()}

      {/* Browse by Trope */}
      <section className="mt-16 border-t border-white/5 pt-12">
        <h2 className="section-title-bar mb-6 font-display text-xl">{t('tropes') ?? 'Browse by Trope'}</h2>
        {Object.entries(groupedTropes).map(([category, tropesInCat]) => (
          <div key={category} className="mb-8">
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-[#6b6b88]">
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
                        ? 'bg-[rgba(0,255,255,0.08)] border border-[rgba(0,255,255,0.3)] text-[#00ffff]'
                        : 'border border-white/10 bg-white/[0.03] text-[#9999b8] hover:bg-[rgba(0,255,255,0.08)] hover:border-[rgba(0,255,255,0.3)] hover:text-[#00ffff]'
                    }`}
                  >
                    {tr.name}
                    <span className={`ml-1.5 text-xs ${active ? 'text-[#00ffff]/70' : 'text-[#6b6b88]'}`}>
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
