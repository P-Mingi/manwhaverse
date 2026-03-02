import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getGenreBySlug, getManhwasByGenre, getAllGenres } from '@/lib/db/genre'
import { getCurrentContentFilter } from '@/lib/nsfw'
import { getUser } from '@/lib/auth/session'
import { getUserLibraryMap } from '@/lib/db/library-map'
import { ManhwaCard } from '@/components/features/ManhwaCard'
import { PageContainer } from '@/components/layouts/PageContainer'
import { JsonLd } from '@/components/ui/JsonLd'
import { generateBreadcrumbJsonLd } from '@/lib/seo/jsonld'

export const revalidate = 21600

interface GenrePageProps {
  params: Promise<{ locale: string; slug: string }>
  searchParams: Promise<{ page?: string; sort?: string }>
}

export async function generateStaticParams() {
  const genres = await getAllGenres()
  const params: Array<{ locale: string; slug: string }> = []
  for (const genre of genres) {
    params.push({ locale: 'en', slug: genre.slug })
    params.push({ locale: 'fr', slug: genre.slug })
  }
  return params
}

export async function generateMetadata({ params }: GenrePageProps) {
  const { locale, slug } = await params
  const genre = await getGenreBySlug(slug)
  if (!genre) return {}
  const name = locale === 'fr' ? genre.name_fr : genre.name_en
  return {
    title: `${name} Manhwa — Best Titles & Reviews`,
    description: `Discover the best ${name} manhwa on ManhwaVerse. ${genre._count.manhwa_links} titles to explore.`,
  }
}

export default async function GenrePage({ params, searchParams }: GenrePageProps) {
  const { locale, slug } = await params
  const { page, sort } = await searchParams

  const genre = await getGenreBySlug(slug)
  if (!genre) notFound()

  const name = locale === 'fr' ? genre.name_fr : genre.name_en
  const currentPage = parseInt(page ?? '1', 10)
  const sortBy = (sort as 'score' | 'popularity' | 'recent') ?? 'popularity'
  const [contentFilter, user] = await Promise.all([getCurrentContentFilter(), getUser()])
  const libraryMap = user ? await getUserLibraryMap(user.id) : new Map()

  const { results, total } = await getManhwasByGenre(slug, currentPage, 24, sortBy)
  const totalPages = Math.ceil(total / 24)

  const breadcrumb = generateBreadcrumbJsonLd([
    { name: 'Home', url: `/${locale}` },
    { name: 'Genres', url: `/${locale}/genre` },
    { name, url: `/${locale}/genre/${slug}` },
  ])

  return (
    <PageContainer>
      <JsonLd data={breadcrumb} />

      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">{name}</h1>
        <p className="mt-1 text-sm text-text-muted">{genre._count.manhwa_links} titles</p>
      </div>

      {/* Sort tabs */}
      <div className="mb-6 flex gap-2">
        {(['popularity', 'score', 'recent'] as const).map((s) => (
          <Link
            key={s}
            href={`/${locale}/genre/${slug}?sort=${s}`}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              sortBy === s
                ? 'bg-crystal-blue text-white'
                : 'bg-elevated text-text-secondary hover:bg-border'
            }`}
          >
            {s === 'popularity' ? 'Popular' : s === 'score' ? 'Top Rated' : 'Recent'}
          </Link>
        ))}
      </div>

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
                href={`/${locale}/genre/${slug}?sort=${sortBy}&page=${p}`}
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
    </PageContainer>
  )
}
