import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getPublisherBySlug } from '@/lib/db/publisher'
import { getCurrentContentFilter } from '@/lib/nsfw'
import { ManhwaCard } from '@/components/features/ManhwaCard'
import { PageContainer } from '@/components/layouts/PageContainer'

export const revalidate = 3600

interface PublisherDetailProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: PublisherDetailProps) {
  const { slug } = await params
  const publisher = await getPublisherBySlug(slug)
  if (!publisher) return {}
  return {
    title: `${publisher.name} — ManhwaVerse`,
    description: publisher.description?.slice(0, 150) ?? `Publisher ${publisher.name}`,
  }
}

export default async function PublisherDetailPage({ params }: PublisherDetailProps) {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: 'publisher' })

  const [publisher, contentFilter] = await Promise.all([
    getPublisherBySlug(slug),
    getCurrentContentFilter(),
  ])
  if (!publisher) notFound()

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        {publisher.logo_url && (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={publisher.logo_url}
              alt={publisher.name}
              className="h-full w-full object-contain p-1"
            />
          </div>
        )}
        <div>
          <h1 className="font-display text-3xl font-bold">{publisher.name}</h1>
          {publisher.name_native && (
            <p className="text-base text-text-muted">{publisher.name_native}</p>
          )}
          <div className="mt-2 flex gap-4 text-sm text-text-muted">
            {publisher.country && <span>{publisher.country}</span>}
            <span>{publisher._count.manhwa_links} {t('titles')}</span>
          </div>
          {publisher.description && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary">
              {publisher.description}
            </p>
          )}
        </div>
      </div>

      {/* Manhwa grid */}
      <h2 className="mb-4 font-display text-lg font-semibold">{t('titles')}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {publisher.manhwa_links.map(({ manhwa }) => (
          <ManhwaCard
            key={manhwa.id}
            manhwa={manhwa}
            locale={locale}
            userContentFilter={contentFilter}
          />
        ))}
      </div>
    </PageContainer>
  )
}
