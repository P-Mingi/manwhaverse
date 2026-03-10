import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { getAllCreators } from '@/lib/db/creator'
import { PageContainer } from '@/components/layouts/PageContainer'

export const revalidate = 3600

interface PeoplePageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string; role?: string; sort?: string }>
}

export async function generateMetadata({ params }: PeoplePageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'people' })
  return {
    title: `${t('title')} — ManhwaVerse`,
    description: t('description'),
  }
}

export default async function PeoplePage({ params, searchParams }: PeoplePageProps) {
  const { locale } = await params
  const { page, role, sort } = await searchParams
  const t = await getTranslations({ locale, namespace: 'people' })

  const currentPage = parseInt(page ?? '1', 10)
  const currentRole = (role as 'AUTHOR' | 'ILLUSTRATOR' | 'BOTH' | undefined) ?? undefined
  const sortBy = (sort as 'readers' | 'alpha') ?? 'readers'

  const { creators, total } = await getAllCreators(currentPage, 24, currentRole, sortBy)
  const totalPages = Math.ceil(total / 24)

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">{t('title')}</h1>
        <p className="mt-1 text-sm text-text-muted">{total} creators</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {/* Role filter */}
        <div className="flex gap-2">
          {([undefined, 'AUTHOR', 'ILLUSTRATOR'] as const).map((r) => (
            <Link
              key={r ?? 'all'}
              href={`/${locale}/people?sort=${sortBy}${r ? `&role=${r}` : ''}`}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                currentRole === r
                  ? 'bg-[rgba(0,255,255,0.08)] border border-[rgba(0,255,255,0.3)] text-[#00ffff]'
                  : 'bg-elevated text-text-secondary hover:bg-border'
              }`}
            >
              {r === undefined ? t('filterAll') : r === 'AUTHOR' ? t('filterAuthor') : t('filterIllustrator')}
            </Link>
          ))}
        </div>

        {/* Sort */}
        <div className="ml-auto flex gap-2">
          {(['readers', 'alpha'] as const).map((s) => (
            <Link
              key={s}
              href={`/${locale}/people?sort=${s}${currentRole ? `&role=${currentRole}` : ''}`}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                sortBy === s
                  ? 'bg-elevated text-text-primary ring-1 ring-border'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {s === 'readers' ? t('sortReaders') : t('sortAlpha')}
            </Link>
          ))}
        </div>
      </div>

      {/* Grid */}
      {creators.length === 0 ? (
        <div className="py-20 text-center text-text-muted">{t('noCreators')}</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {creators.map((creator) => (
            <Link
              key={creator.id}
              href={`/${locale}/people/${creator.slug}`}
              className="group flex flex-col items-center gap-2 rounded-xl bg-elevated p-4 text-center transition-colors hover:bg-border"
            >
              <div className="relative h-20 w-20 overflow-hidden rounded-full bg-surface">
                {creator.avatar_url ? (
                  <Image
                    src={creator.avatar_url}
                    alt={creator.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl text-text-muted">
                    {creator.name[0]}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary group-hover:text-[#00ffff]">
                  {creator.name}
                </p>
                {creator.name_native && (
                  <p className="text-xs text-text-muted">{creator.name_native}</p>
                )}
                <p className="mt-1 text-xs text-text-muted">
                  {creator._count.works} {t('works')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (() => {
          const _ws = 10
          let _s = Math.max(1, currentPage - Math.floor(_ws / 2))
          let _e = _s + _ws - 1
          if (_e > totalPages) { _e = totalPages; _s = Math.max(1, _e - _ws + 1) }
          const _pages = Array.from({ length: _e - _s + 1 }, (_, i) => _s + i)
          return (
        <div className="mt-8 flex justify-center gap-2">
          {_pages.map((p) => (
              <Link
                key={p}
                href={`/${locale}/people?sort=${sortBy}${currentRole ? `&role=${currentRole}` : ''}&page=${p}`}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  p === currentPage
                    ? 'bg-[rgba(0,255,255,0.08)] border border-[rgba(0,255,255,0.3)] text-[#00ffff]'
                    : 'bg-elevated text-text-secondary hover:bg-border'
                }`}
              >
                {p}
              </Link>
          ))}
        </div>
          )
      })()}
    </PageContainer>
  )
}
