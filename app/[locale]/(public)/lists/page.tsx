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
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            borderRadius: '8px', border: '1px solid var(--accent)',
            padding: '8px 16px', fontSize: '13px', fontWeight: 600,
            color: 'var(--accent)', textDecoration: 'none',
            background: 'var(--accent-muted)',
          }}
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
            className={`filter-pill${currentSort === s ? ' active' : ''}`}
          style={{ borderRadius: '6px', fontSize: '12px' }}
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
              className="group flex flex-col rounded-xl border border-border bg-elevated transition-colors" style={{ borderColor: 'var(--border)' }}
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
                <h2 className="font-semibold line-clamp-2 leading-snug" style={{ color: 'var(--text-primary)' }}>
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
                className={`filter-pill${p === currentPage ? ' active' : ''}`}
                style={{ borderRadius: '6px', fontSize: '13px', fontWeight: p === currentPage ? 700 : 400 }}
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
