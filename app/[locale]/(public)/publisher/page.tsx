import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getAllPublishers } from '@/lib/db/publisher'
import { PageContainer } from '@/components/layouts/PageContainer'

export const revalidate = 3600

interface PublisherPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: PublisherPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'publisher' })
  return {
    title: `${t('title')} — ManhwaVerse`,
    description: t('description'),
  }
}

export default async function PublisherPage({ params, searchParams }: PublisherPageProps) {
  const { locale } = await params
  const { page } = await searchParams
  const t = await getTranslations({ locale, namespace: 'publisher' })

  const currentPage = parseInt(page ?? '1', 10)
  const { publishers, total } = await getAllPublishers(currentPage, 24)
  const totalPages = Math.ceil(total / 24)

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">{t('title')}</h1>
        <p className="mt-1 text-sm text-text-muted">{total} publishers</p>
      </div>

      {publishers.length === 0 ? (
        <div className="py-20 text-center text-text-muted">{t('noPublishers')}</div>
      ) : (
        <div className="flex flex-col gap-3">
          {publishers.map((pub) => (
            <Link
              key={pub.id}
              href={`/${locale}/publisher/${pub.slug}`}
              className="group flex items-center gap-5 rounded-xl bg-elevated px-5 py-4 transition-colors hover:bg-border"
            >
              {/* Logo */}
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface">
                {pub.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pub.logo_url}
                    alt={pub.name}
                    width={56}
                    height={56}
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl font-bold text-text-muted">
                    {pub.name[0]}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-text-primary group-hover:text-crystal-blue">
                  {pub.name}
                </p>
                {pub.description && (
                  <p className="mt-0.5 line-clamp-1 text-sm text-text-muted">{pub.description}</p>
                )}
              </div>

              {/* Count */}
              <div className="shrink-0 text-right">
                <p className="text-lg font-bold tabular-nums text-text-primary">
                  {pub._count.manhwa_links.toLocaleString()}
                </p>
                <p className="text-xs text-text-muted">{t('titles')}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: Math.min(totalPages, 10) }).map((_, i) => {
            const p = i + 1
            return (
              <Link
                key={p}
                href={`/${locale}/publisher?page=${p}`}
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
