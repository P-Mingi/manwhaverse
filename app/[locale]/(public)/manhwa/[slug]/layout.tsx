import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getManhwaBySlug } from '@/lib/db/manhwa'
import { getLibraryEntry } from '@/lib/db/library'
import { getCharactersByManhwaId } from '@/lib/db/character'
import { getUser } from '@/lib/auth/session'
import { getCurrentContentFilter, needsMatureGate } from '@/lib/nsfw'
import { getProductsForManhwa } from '@/lib/db/store'
import { MatureGate } from '@/components/features/MatureGate'
import { generateManhwaJsonLd, generateBreadcrumbJsonLd } from '@/lib/seo/jsonld'
import { JsonLd } from '@/components/ui/JsonLd'
import { ManhwaBanner } from '@/components/features/manhwa/ManhwaBanner'
import { ManhwaHero } from '@/components/features/ManhwaHero'
import { ManhwaTabNav } from '@/components/features/manhwa/ManhwaTabNav'
import { LibraryActions } from '@/components/features/library/LibraryActions'
import { formatCount } from '@/lib/utils/formatCount'
import { WhereToRead } from '@/components/features/manhwa/WhereToRead'
import { PhysicalEditions } from '@/components/features/manhwa/PhysicalEditions'
import { ControversyBadge } from '@/components/features/manhwa/ControversyBadge'

interface ManhwaLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string; slug: string }>
}

export default async function ManhwaLayout({
  children,
  params,
}: ManhwaLayoutProps) {
  const { locale, slug } = await params
  const manhwa = await getManhwaBySlug(slug)

  if (!manhwa) notFound()

  const contentFilter = await getCurrentContentFilter()
  const showGate = needsMatureGate(manhwa.content_rating, contentFilter)

  const t = await getTranslations({ locale, namespace: 'manhwa' })
  const user = await getUser()

  const [libraryEntry, allCharacters, products] = await Promise.all([
    user ? getLibraryEntry(user.id, manhwa.id) : null,
    getCharactersByManhwaId(manhwa.id),
    getProductsForManhwa(manhwa.id),
  ])

  const title = locale === 'fr' ? (manhwa.title_fr ?? manhwa.title_en) : manhwa.title_en

  const breadcrumbs = generateBreadcrumbJsonLd([
    { name: 'Home', url: `/${locale}` },
    { name: 'Manhwa', url: `/${locale}/manhwa` },
    { name: title, url: `/${locale}/manhwa/${manhwa.slug}` },
  ])

  const hasBanner = !!manhwa.banner_url

  const pageContent = (
    <>
      {/* Hero + library actions together so the blurred bg covers both */}
      <ManhwaHero
        manhwa={manhwa}
        locale={locale}
        hasBanner={hasBanner}
      >
        <LibraryActions
          manhwaId={manhwa.id}
          currentStatus={libraryEntry?.status ?? null}
          currentScore={libraryEntry?.score ?? null}
          currentProgress={libraryEntry?.progress ?? 0}
          currentIsFavorite={libraryEntry?.is_favorite ?? false}
          currentStartedAt={libraryEntry?.started_at?.toISOString() ?? null}
          currentCompletedAt={libraryEntry?.completed_at?.toISOString() ?? null}
          currentRereadCount={libraryEntry?.reread_count ?? 0}
          currentPrivateTags={libraryEntry?.private_tags ?? []}
          currentNotes={libraryEntry?.notes ?? null}
          chapterCount={manhwa.chapter_count ?? null}
          isLoggedIn={!!user}
          bannerUrl={manhwa.banner_url ?? null}
          coverUrl={manhwa.cover_url ?? null}
          title={title}
          titleKr={manhwa.title_kr ?? null}
        />
      </ManhwaHero>

      {/* Tab navigation */}
      <div className="mt-0">
        <ManhwaTabNav
          slug={slug}
          locale={locale}
          hasCharacters={allCharacters.length > 0}
          hasStaff={manhwa.creator_links.length > 0}
        />
      </div>

      {/* Content area with sidebar */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-8 md:flex-row md:gap-12">
          {/* Main content */}
          <div className="flex-1 min-w-0">{children}</div>

          {/* Sidebar */}
          <aside className="w-full space-y-6 md:w-64 flex-shrink-0">
            <div className="rounded-lg border border-white/5 bg-[#0d0d16] p-4">
              <h3 className="mb-3 text-sm font-semibold text-text-muted uppercase tracking-wide">
                {t('info')}
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-text-muted">{t('sidebar.type')}</dt>
                  <dd className="text-text-primary">{manhwa.type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">{t('sidebar.status')}</dt>
                  <dd className="text-text-primary">{t(`status.${manhwa.status}`)}</dd>
                </div>
                {manhwa.chapter_count && (
                  <div className="flex justify-between">
                    <dt className="text-text-muted">{t('sidebar.chapters')}</dt>
                    <dd className="text-text-primary">{manhwa.chapter_count}</dd>
                  </div>
                )}
                {manhwa.volume_count && (
                  <div className="flex justify-between">
                    <dt className="text-text-muted">{t('sidebar.volumes')}</dt>
                    <dd className="text-text-primary">{manhwa.volume_count}</dd>
                  </div>
                )}
                {manhwa.release_year && (
                  <div className="flex justify-between">
                    <dt className="text-text-muted">{t('sidebar.year')}</dt>
                    <dd className="text-text-primary">
                      {manhwa.release_year}
                      {manhwa.end_year ? `–${manhwa.end_year}` : ''}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-text-muted">{t('sidebar.origin')}</dt>
                  <dd className="text-text-primary">
                    {t(`countries.${manhwa.origin_country}`)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Where to Read — sidebar for affiliate revenue */}
            {manhwa.read_links.length > 0 && (
              <WhereToRead readLinks={manhwa.read_links} locale={locale} />
            )}

            {/* Physical editions / affiliate store */}
            {products.length > 0 && (
              <PhysicalEditions
                manhwaId={manhwa.id}
                manhwaSlug={manhwa.slug}
                products={products}
              />
            )}

            {/* Controversy Badge */}
            <ControversyBadge stddev={manhwa.score_stddev} scoreCount={manhwa.score_count} />

            {/* Popularity */}
            {(manhwa.reader_count > 0 || manhwa.favorite_count > 0) && (
              <div className="rounded-lg border border-white/5 bg-[#0d0d16] p-4">
                <h3 className="mb-3 text-sm font-semibold text-text-muted uppercase tracking-wide">
                  {t('sidebar.popularity')}
                </h3>
                <dl className="space-y-2 text-sm">
                  {manhwa.reader_count > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-text-muted">{t('sidebar.readers')}</dt>
                      <dd className="text-text-primary">{formatCount(manhwa.reader_count)}</dd>
                    </div>
                  )}
                  {manhwa.favorite_count > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-text-muted">{t('sidebar.favorites')}</dt>
                      <dd className="text-text-primary">{formatCount(manhwa.favorite_count)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Alt titles */}
            {manhwa.title_alt.length > 0 && (
              <div className="rounded-lg border border-white/5 bg-[#0d0d16] p-4">
                <h3 className="mb-2 text-sm font-semibold text-text-muted uppercase tracking-wide">
                  {t('sidebar.altTitles')}
                </h3>
                <ul className="space-y-1 text-xs text-text-secondary">
                  {manhwa.title_alt.slice(0, 5).map((alt, i) => (
                    <li key={i}>{alt}</li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  )

  if (showGate) {
    return (
      <>
        <JsonLd data={generateManhwaJsonLd(manhwa, locale)} />
        <JsonLd data={breadcrumbs} />
        <MatureGate>
          <ManhwaBanner
            bannerUrl={manhwa.banner_url}
            coverUrl={manhwa.cover_url}
            title={title}
          />
          {pageContent}
        </MatureGate>
      </>
    )
  }

  return (
    <>
      <JsonLd data={generateManhwaJsonLd(manhwa, locale)} />
      <JsonLd data={breadcrumbs} />
      <ManhwaBanner
        bannerUrl={manhwa.banner_url}
        coverUrl={manhwa.cover_url}
        title={title}
      />
      {pageContent}
    </>
  )
}
