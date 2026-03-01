import { getTranslations } from 'next-intl/server'
import { searchManhwas } from '@/lib/db/search'
import { getPopularManhwas } from '@/lib/db/home'
import { ManhwaCard } from '@/components/features/ManhwaCard'
import { PageContainer } from '@/components/layouts/PageContainer'
import { SearchBar } from '@/components/features/SearchBar'

export const revalidate = 300

interface SearchPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string; page?: string; sort?: string; status?: string; type?: string }>
}

export async function generateMetadata({ params }: SearchPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'nav' })
  return { title: t('search') }
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale } = await params
  const { q, page, sort, status, type } = await searchParams
  const t = await getTranslations({ locale, namespace: 'nav' })

  const currentPage = parseInt(page ?? '1', 10)
  const hasQuery = q && q.trim().length > 0

  let results, total
  if (hasQuery) {
    const data = await searchManhwas({
      query: q.trim(),
      page: currentPage,
      sortBy: (sort as 'relevance' | 'score' | 'popularity' | 'recent') ?? 'relevance',
      status,
      type,
    })
    results = data.results
    total = data.total
  } else {
    results = await getPopularManhwas(24)
    total = results.length
  }

  const totalPages = Math.ceil(total / 24)

  return (
    <PageContainer>
      <h1 className="mb-6 font-display text-2xl font-bold">{t('search')}</h1>

      <SearchBar defaultValue={q ?? ''} locale={locale} />

      {hasQuery && (
        <p className="mt-4 text-sm text-text-muted">
          {total} result{total !== 1 ? 's' : ''} for &ldquo;{q}&rdquo;
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {results.map((m) => (
          <ManhwaCard key={m.id} manhwa={m} locale={locale} />
        ))}
      </div>

      {results.length === 0 && (
        <div className="py-20 text-center text-text-muted">
          No results found
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: Math.min(totalPages, 10) }).map((_, i) => {
            const p = i + 1
            const params = new URLSearchParams()
            if (q) params.set('q', q)
            if (sort) params.set('sort', sort)
            params.set('page', String(p))
            return (
              <a
                key={p}
                href={`/${locale}/search?${params.toString()}`}
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
