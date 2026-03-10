import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getPublicFanArts } from '@/lib/db/fan-art'
import { getUser } from '@/lib/auth/session'
import { PageContainer } from '@/components/layouts/PageContainer'

export const revalidate = 120

interface ArtworkPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ sort?: string; tag?: string; page?: string }>
}

export async function generateMetadata({ params }: ArtworkPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'artwork' })
  return {
    title: `${t('title')} — ManhwaVerse`,
    description: t('subtitle'),
  }
}

export default async function ArtworkPage({ params, searchParams }: ArtworkPageProps) {
  const { locale } = await params
  const { sort, tag, page } = await searchParams
  const t = await getTranslations({ locale, namespace: 'artwork' })

  const currentPage = parseInt(page ?? '1', 10)
  const currentSort = (sort as 'recent' | 'top') ?? 'recent'
  const user = await getUser()

  let posts: Awaited<ReturnType<typeof getPublicFanArts>>['posts'] = []
  let total = 0
  try {
    const result = await getPublicFanArts({
      page: currentPage,
      limit: 24,
      sort: currentSort,
      tag: tag ?? undefined,
      showNsfw: false,
    })
    posts = result.posts
    total = result.total
  } catch {
    // FanArtPost table may not exist yet
  }

  const totalPages = Math.ceil(total / 24)

  return (
    <PageContainer className="max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">{t('title')}</h1>
          <p className="mt-1 text-sm text-text-muted">{t('subtitle')}</p>
        </div>
        {user && (
          <Link
            href={`/${locale}/artwork/new`}
            className="inline-flex items-center gap-2 rounded-lg border border-[rgba(0,255,255,0.3)] px-4 py-2 text-sm font-medium text-[#00ffff] transition-colors hover:bg-[rgba(0,255,255,0.08)]"
          >
            + {t('submit')}
          </Link>
        )}
      </div>

      {/* Sort */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(['recent', 'top'] as const).map((s) => (
          <Link
            key={s}
            href={`/${locale}/artwork?sort=${s}${tag ? `&tag=${tag}` : ''}`}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              currentSort === s
                ? 'bg-[rgba(0,255,255,0.08)] border border-[rgba(0,255,255,0.3)] text-[#00ffff]'
                : 'bg-elevated text-text-secondary hover:bg-border'
            }`}
          >
            {s === 'recent' ? t('sortRecent') : t('sortTop')}
          </Link>
        ))}
        {tag && (
          <div className="flex items-center gap-1 rounded-md bg-elevated px-3 py-1.5 text-xs">
            <span className="text-text-muted">#</span>
            <span className="text-text-secondary">{tag}</span>
            <Link
              href={`/${locale}/artwork?sort=${currentSort}`}
              className="ml-1 text-text-muted hover:text-error"
            >
              ✕
            </Link>
          </div>
        )}
      </div>

      {/* Masonry grid */}
      {posts.length === 0 ? (
        <div className="py-20 text-center text-text-muted">{t('noArtwork')}</div>
      ) : (
        <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
          {posts.map((post) => {
            const img = post.images[0]
            if (!img) return null
            return (
              <Link
                key={post.id}
                href={`/${locale}/artwork/${post.id}`}
                className="group mb-3 block break-inside-avoid overflow-hidden rounded-xl"
              >
                <div className="relative overflow-hidden rounded-xl bg-elevated">
                  {/* Image */}
                  <img
                    src={img.thumb_url}
                    alt={img.alt_text ?? post.title}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* NSFW badge */}
                  {post.is_nsfw && (
                    <span className="absolute left-2 top-2 rounded bg-error/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      NSFW
                    </span>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/75 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <p className="line-clamp-2 text-xs font-semibold text-white">{post.title}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[11px] text-white/70">
                        @{post.user.username ?? post.user.display_name ?? '?'}
                      </span>
                      <span className="text-[11px] text-white/70">♥ {post.like_count}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Tag cloud */}
      {posts.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {Array.from(new Set(posts.flatMap((p) => p.tags)))
            .slice(0, 20)
            .map((t_) => (
              <Link
                key={t_}
                href={`/${locale}/artwork?sort=${currentSort}&tag=${t_}`}
                className={`rounded-full px-3 py-1 text-xs ${
                  tag === t_
                    ? 'bg-[rgba(0,255,255,0.08)] border border-[rgba(0,255,255,0.2)] text-[#00ffff]'
                    : 'bg-elevated text-text-muted hover:text-text-secondary'
                }`}
              >
                #{t_}
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
                href={`/${locale}/artwork?sort=${currentSort}${tag ? `&tag=${tag}` : ''}&page=${p}`}
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
