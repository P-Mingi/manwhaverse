import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getPublicLists } from '@/lib/db/list'
import { PageContainer } from '@/components/layouts/PageContainer'

export const revalidate = 300

interface ListsPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string; sort?: string }>
}

export async function generateMetadata({ params }: ListsPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'lists' })
  return {
    title: `${t('title')} — ManhwaVerse`,
    description: t('description'),
  }
}

export default async function ListsPage({ params, searchParams }: ListsPageProps) {
  const { locale } = await params
  const { page, sort } = await searchParams
  const t = await getTranslations({ locale, namespace: 'lists' })

  const currentPage = parseInt(page ?? '1', 10)
  const currentSort = (sort as 'popular' | 'recent' | 'size') ?? 'popular'

  const { lists, total } = await getPublicLists(currentPage, 24, currentSort)
  const totalPages = Math.ceil(total / 24)

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">{t('title')}</h1>
          <p className="mt-1 text-sm text-text-muted">{total} {t('title').toLowerCase()}</p>
        </div>
        <Link
          href={`/${locale}/lists/new`}
          className="inline-flex items-center gap-2 rounded-lg border border-[rgba(0,255,255,0.3)] px-4 py-2 text-sm font-medium text-[#00ffff] transition-colors hover:bg-[rgba(0,255,255,0.08)]"
        >
          + {t('new')}
        </Link>
      </div>

      {/* Sort filters */}
      <div className="mb-6 flex gap-2">
        {(['popular', 'recent', 'size'] as const).map((s) => (
          <Link
            key={s}
            href={`/${locale}/lists?sort=${s}`}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              currentSort === s
                ? 'bg-[rgba(0,255,255,0.08)] border border-[rgba(0,255,255,0.3)] text-[#00ffff]'
                : 'bg-elevated text-text-secondary hover:bg-border'
            }`}
          >
            {s === 'popular' ? t('sortPopular') : s === 'recent' ? t('sortRecent') : t('sortSize')}
          </Link>
        ))}
      </div>

      {/* Grid */}
      {lists.length === 0 ? (
        <div className="py-20 text-center text-text-muted">{t('noLists')}</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <Link
              key={list.id}
              href={`/${locale}/lists/${list.slug}`}
              className="group flex flex-col rounded-xl border border-border bg-elevated hover:border-[rgba(0,255,255,0.25)] transition-colors"
            >
              {/* Cover strip */}
              <div className="flex h-24 overflow-hidden rounded-t-xl">
                {list.preview_covers.length > 0 ? (
                  list.preview_covers.slice(0, 4).map((cover, i) => (
                    <div
                      key={i}
                      className="relative flex-1 overflow-hidden"
                    >
                      <Image
                        src={cover}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                  ))
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface text-text-muted text-xs">
                    {t('emptyList')}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col gap-1.5 p-4">
                <h2 className="font-semibold text-text-primary group-hover:text-[#00ffff] line-clamp-2 leading-snug">
                  {list.title}
                </h2>
                {list.description && (
                  <p className="text-xs text-text-muted line-clamp-2">{list.description}</p>
                )}
                <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-text-muted">
                  <span>{t('items', { count: list.item_count })}</span>
                  <span>·</span>
                  <span>♥ {list.likes_count}</span>
                  <span>·</span>
                  <span>
                    {t('by')} {list.user.display_name ?? list.user.username ?? '?'}
                  </span>
                </div>
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
                href={`/${locale}/lists?sort=${currentSort}&page=${p}`}
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
