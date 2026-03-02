import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTropeBySlug, getManhwasByTrope, getAllTropes } from '@/lib/db/trope'
import { getCurrentContentFilter } from '@/lib/nsfw'
import { getUser } from '@/lib/auth/session'
import { getUserLibraryMap } from '@/lib/db/library-map'
import { ManhwaCard } from '@/components/features/ManhwaCard'
import { PageContainer } from '@/components/layouts/PageContainer'
import { JsonLd } from '@/components/ui/JsonLd'
import { generateBreadcrumbJsonLd } from '@/lib/seo/jsonld'

export const revalidate = 21600

interface TropePageProps {
  params: Promise<{ locale: string; slug: string }>
  searchParams: Promise<{ page?: string; sort?: string }>
}

export async function generateStaticParams() {
  const tropes = await getAllTropes()
  const params: Array<{ locale: string; slug: string }> = []
  for (const trope of tropes) {
    params.push({ locale: 'en', slug: trope.slug })
    params.push({ locale: 'fr', slug: trope.slug })
  }
  return params
}

export async function generateMetadata({ params }: TropePageProps) {
  const { locale, slug } = await params
  const trope = await getTropeBySlug(slug)
  if (!trope) return {}
  const name = trope.name
  return {
    title: `${name} Manhwa — Discover Titles`,
    description: `Find the best ${name} manhwa on ManhwaVerse. ${trope._count.manhwa_links} titles with this trope.`,
  }
}

export default async function TropePage({ params, searchParams }: TropePageProps) {
  const { locale, slug } = await params
  const { page, sort } = await searchParams

  const trope = await getTropeBySlug(slug)
  if (!trope) notFound()

  const name = trope.name
  const description = locale === 'fr' ? trope.description_fr : trope.description_en
  const currentPage = parseInt(page ?? '1', 10)
  const sortBy = (sort as 'score' | 'popularity' | 'recent') ?? 'popularity'
  const [contentFilter, user] = await Promise.all([getCurrentContentFilter(), getUser()])
  const libraryMap = user ? await getUserLibraryMap(user.id) : new Map()

  const { results, total } = await getManhwasByTrope(slug, currentPage, 24, sortBy)
  const totalPages = Math.ceil(total / 24)

  const breadcrumb = generateBreadcrumbJsonLd([
    { name: 'Home', url: `/${locale}` },
    { name: 'Tropes', url: `/${locale}/trope` },
    { name, url: `/${locale}/trope/${slug}` },
  ])

  return (
    <PageContainer>
      <JsonLd data={breadcrumb} />

      <div className="mb-6">
        <div className="mb-1 text-xs font-medium uppercase tracking-wider text-text-muted">
          {trope.category.replace('_', ' ')}
        </div>
        <h1 className="font-display text-2xl font-bold">{name}</h1>
        {description && (
          <p className="mt-2 text-sm text-text-secondary">{description}</p>
        )}
        <p className="mt-1 text-sm text-text-muted">{trope._count.manhwa_links} titles</p>
      </div>

      {/* Sort tabs */}
      <div className="mb-6 flex gap-2">
        {(['popularity', 'score', 'recent'] as const).map((s) => (
          <Link
            key={s}
            href={`/${locale}/trope/${slug}?sort=${s}`}
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
                href={`/${locale}/trope/${slug}?sort=${sortBy}&page=${p}`}
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
