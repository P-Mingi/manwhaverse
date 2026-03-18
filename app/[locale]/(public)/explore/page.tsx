import { searchManhwas } from '@/lib/db/search'
import { getAllGenres } from '@/lib/db/genre'
import { SearchBar } from '@/components/features/explore/SearchBar'
import { FilterPanel } from '@/components/features/explore/FilterPanel'
import { ManhwaGrid } from '@/components/features/explore/ManhwaGrid'

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
  }>
}

export async function generateMetadata({ params }: ExplorePageProps) {
  const { locale } = await params
  return {
    title: locale === 'fr' ? 'Explorer les manhwas' : 'Explore Manhwas',
  }
}

export default async function ExplorePage({ params, searchParams }: ExplorePageProps) {
  const { locale } = await params
  const { q, page, sort, status, type, genre } = await searchParams

  const currentPage = Math.max(1, parseInt(page ?? '1', 10) || 1)
  const sortBy = (sort as 'relevance' | 'score' | 'popularity' | 'recent') ?? 'popularity'

  const [genres, data] = await Promise.all([
    getAllGenres(),
    searchManhwas({
      query: q?.trim() || undefined,
      page: currentPage,
      sortBy,
      status,
      type,
      genre,
    }),
  ])

  const { results, total } = data
  const totalPages = Math.ceil(total / 24)

  function buildHref(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams()
    const nq = 'q' in overrides ? overrides.q : q
    if (nq) p.set('q', nq)
    const ns = 'status' in overrides ? overrides.status : status
    if (ns) p.set('status', ns)
    const nt = 'type' in overrides ? overrides.type : type
    if (nt) p.set('type', nt)
    const ng = 'genre' in overrides ? overrides.genre : genre
    if (ng) p.set('genre', ng)
    const nso = 'sort' in overrides ? overrides.sort : sort
    if (nso && nso !== 'popularity') p.set('sort', nso)
    const np = 'page' in overrides ? overrides.page : undefined
    if (np && np !== '1') p.set('page', np)
    const qs = p.toString()
    return `/${locale}/explore${qs ? `?${qs}` : ''}`
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Search + Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <SearchBar locale={locale} />
        <FilterPanel genres={genres} locale={locale} />
      </div>

      {/* Results count */}
      <p style={{ margin: '0 0 1rem', fontSize: '13px', color: 'var(--text-muted)' }}>
        {total.toLocaleString()} {locale === 'fr' ? 'titres' : 'titles'}
        {genre && ` — ${genre === '__adult__' ? '18+' : genres.find((g) => g.slug === genre)?.[locale === 'fr' ? 'name_fr' : 'name_en'] ?? genre}`}
      </p>

      {/* Grid */}
      <ManhwaGrid manhwas={results} locale={locale} />

      {/* Pagination */}
      {totalPages > 1 && (() => {
        const ws = 10
        let s = Math.max(1, currentPage - Math.floor(ws / 2))
        let e = s + ws - 1
        if (e > totalPages) { e = totalPages; s = Math.max(1, e - ws + 1) }
        const pages = Array.from({ length: e - s + 1 }, (_, i) => s + i)
        return (
          <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {currentPage > 1 && (
              <a href={buildHref({ page: String(currentPage - 1) })} className="btn-secondary" style={{ textDecoration: 'none', padding: '0.375rem 0.75rem' }}>‹</a>
            )}
            {pages.map((p) => (
              <a
                key={p}
                href={buildHref({ page: String(p) })}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: 6,
                  fontSize: '13px',
                  textDecoration: 'none',
                  background: p === currentPage ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: p === currentPage ? 'var(--accent-text)' : 'var(--text-secondary)',
                  fontWeight: p === currentPage ? 700 : 400,
                  border: p === currentPage ? 'none' : '1px solid var(--border)',
                }}
              >
                {p}
              </a>
            ))}
            {currentPage < totalPages && (
              <a href={buildHref({ page: String(currentPage + 1) })} className="btn-secondary" style={{ textDecoration: 'none', padding: '0.375rem 0.75rem' }}>›</a>
            )}
          </div>
        )
      })()}
    </div>
  )
}
