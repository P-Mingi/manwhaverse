import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getPublishedArticles } from '@/lib/db/article'

export const revalidate = 600

interface NewsPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: NewsPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'news' })
  return {
    title: `${t('title')} — ManhwaVerse`,
    description: t('description'),
  }
}

const ACCENT_COLORS = ['#00ffff', '#ff2d55', '#ffd700', '#a855f7', '#4ade80', '#f97316', '#3b82f6', '#ec4899']

function getArticleLabel(title: string): string {
  const stopWords = new Set(['a', 'an', 'the', 'de', 'la', 'le', 'les', 'un', 'une', 'is', 'are', 'and', 'or', 'of', 'in', 'on', 'at', 'to'])
  const words = title.split(/\s+/)
  const meaningful = words.filter(w => w.length >= 2 && !stopWords.has(w.toLowerCase().replace(/[^a-z]/g, '')))
  const label = meaningful.slice(0, 2).join(' ').replace(/[^A-Za-z0-9'\s]/g, '').trim()
  return (label.length > 14 ? label.slice(0, 12) : label).toUpperCase()
}

function formatDateShort(date: Date | null): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' }).toUpperCase()
}

function formatDateFull(date: Date | null, locale: string): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function NewsPage({ params, searchParams }: NewsPageProps) {
  const { locale } = await params
  const { page } = await searchParams
  const t = await getTranslations({ locale, namespace: 'news' })

  const currentPage = Math.max(1, parseInt(page ?? '1', 10))
  const { articles, total } = await getPublishedArticles(currentPage, 20, 'NEWS')
  const totalPages = Math.ceil(total / 20)

  const featured = articles[0]
  const rest = articles.slice(1)

  return (
    <div className="min-h-screen bg-[#060609]">
      {/* Header */}
      <div className="border-b border-white/5 px-4 py-16 text-center">
        <h1 className="font-display leading-none">
          <span className="text-6xl tracking-wide text-white">MANHWA </span>
          <span className="text-6xl tracking-wide text-[#ff2d55]">NEWS</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-[#9999b8]">{t('description')}</p>
        <div className="mt-6 flex justify-center gap-8 text-sm font-medium text-[#00ffff]">
          <span>✦ {total} articles</span>
          <span>✦ {locale === 'fr' ? 'Mis à jour quotidiennement' : 'Updated daily'}</span>
          <span>✦ ~2 {locale === 'fr' ? 'articles/jour' : 'articles/day'}</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        {articles.length === 0 ? (
          <div className="py-20 text-center text-[#6b6b88]">{t('noNews')}</div>
        ) : (
          <>
            {/* Featured article */}
            {featured && (
              <Link href={`/${locale}/news/${featured.slug}`} className="group mb-10 block">
                <div className="flex overflow-hidden rounded-xl border border-white/5 bg-[#0d0d16] transition-all duration-300 hover:border-[rgba(0,255,255,0.15)]">
                  {/* Left colored panel */}
                  <div
                    className="hidden w-44 shrink-0 items-center justify-center p-8 sm:flex"
                    style={{ backgroundColor: `${ACCENT_COLORS[0]}18` }}
                  >
                    <span
                      className="break-words text-center font-display text-2xl leading-tight tracking-widest"
                      style={{ color: ACCENT_COLORS[0] }}
                    >
                      {getArticleLabel(featured.title_en)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="rounded-full border border-[rgba(0,255,255,0.2)] bg-[rgba(0,255,255,0.1)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#00ffff]">
                        Featured
                      </span>
                      {featured.published_at && (
                        <span className="text-xs text-[#6b6b88]">
                          {formatDateFull(featured.published_at, locale)}
                        </span>
                      )}
                    </div>
                    <h2 className="mb-2 font-display text-2xl leading-snug tracking-wide text-[#e8e8f0] transition-colors group-hover:text-[#00ffff]">
                      {locale === 'fr' && featured.title_fr ? featured.title_fr : featured.title_en}
                    </h2>
                    {(locale === 'fr' ? featured.excerpt_fr ?? featured.excerpt_en : featured.excerpt_en) && (
                      <p className="mb-4 line-clamp-2 text-sm text-[#9999b8]">
                        {locale === 'fr' ? (featured.excerpt_fr ?? featured.excerpt_en) : featured.excerpt_en}
                      </p>
                    )}
                    <span className="text-sm font-medium text-[#00ffff] group-hover:underline">
                      {locale === 'fr' ? "Lire l'article →" : 'Read article →'}
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((article, i) => {
                  const accent = ACCENT_COLORS[(i + 1) % ACCENT_COLORS.length]
                  const title = locale === 'fr' && article.title_fr ? article.title_fr : article.title_en
                  const excerpt = locale === 'fr' ? (article.excerpt_fr ?? article.excerpt_en) : article.excerpt_en
                  const label = getArticleLabel(article.title_en)

                  return (
                    <Link
                      key={article.id}
                      href={`/${locale}/news/${article.slug}`}
                      className="group flex flex-col overflow-hidden rounded-xl border border-white/5 bg-[#0d0d16] transition-all duration-300 hover:border-white/10"
                      style={{ borderTopColor: accent, borderTopWidth: '2px' }}
                    >
                      <div className="flex flex-1 flex-col p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: accent }}>
                            {label}
                          </span>
                          {article.published_at && (
                            <span className="text-[10px] text-[#6b6b88]">
                              {formatDateShort(article.published_at)}
                            </span>
                          )}
                        </div>
                        <h3 className="mb-2 line-clamp-3 text-sm font-bold leading-snug text-[#e8e8f0] transition-colors group-hover:text-white">
                          {title}
                        </h3>
                        {excerpt && (
                          <p className="mb-3 line-clamp-3 text-xs text-[#6b6b88]">{excerpt}</p>
                        )}
                        <div className="mt-auto">
                          <span className="text-xs font-medium" style={{ color: accent }}>
                            {locale === 'fr' ? 'Lire →' : 'Read →'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1
              return (
                <Link
                  key={p}
                  href={`/${locale}/news?page=${p}`}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    p === currentPage
                      ? 'bg-[#00ffff] text-black'
                      : 'bg-[#111120] text-[#9999b8] hover:bg-[rgba(0,255,255,0.08)] hover:text-[#00ffff]'
                  }`}
                >
                  {p}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
