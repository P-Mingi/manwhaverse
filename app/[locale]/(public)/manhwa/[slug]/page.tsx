import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getManhwaBySlug, getTopManhwaSlugs, getRelatedManhwas } from '@/lib/db/manhwa'
import { getReviewsForManhwa } from '@/lib/db/review'
import { getLibraryEntry } from '@/lib/db/library'
import { getUser } from '@/lib/auth/session'
import { generateManhwaMetadata } from '@/lib/seo/metadata'
import { generateManhwaJsonLd, generateBreadcrumbJsonLd } from '@/lib/seo/jsonld'
import { JsonLd } from '@/components/ui/JsonLd'
import { ManhwaHero } from '@/components/features/ManhwaHero'
import { SynopsisSection } from '@/components/features/SynopsisSection'
import { TropeList } from '@/components/features/TropeList'
import { ManhwaCard } from '@/components/features/ManhwaCard'
import { LibraryButton } from '@/components/features/LibraryButton'
import { ReviewCard } from '@/components/features/ReviewCard'
import { ReviewForm } from '@/components/features/ReviewForm'

export const revalidate = 3600 // ISR: 1 hour

interface ManhwaPageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getTopManhwaSlugs(100)
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: ManhwaPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const manhwa = await getManhwaBySlug(slug)
  if (!manhwa) return { title: 'Not Found' }
  return generateManhwaMetadata(manhwa, locale)
}

export default async function ManhwaPage({ params }: ManhwaPageProps) {
  const { locale, slug } = await params
  const manhwa = await getManhwaBySlug(slug)

  if (!manhwa) notFound()

  const t = await getTranslations({ locale, namespace: 'manhwa' })
  const user = await getUser()
  const title = locale === 'fr' ? (manhwa.title_fr ?? manhwa.title_en) : manhwa.title_en
  const synopsis = locale === 'fr'
    ? (manhwa.synopsis_fr ?? manhwa.synopsis_en)
    : manhwa.synopsis_en

  // Fetch library entry and reviews in parallel
  const [libraryEntry, { reviews }, related] = await Promise.all([
    user ? getLibraryEntry(user.id, manhwa.id) : null,
    getReviewsForManhwa(manhwa.id),
    getRelatedManhwas(manhwa.id, 6),
  ])

  const breadcrumbs = generateBreadcrumbJsonLd([
    { name: 'Home', url: `/${locale}` },
    { name: 'Manhwa', url: `/${locale}/manhwa` },
    { name: title, url: `/${locale}/manhwa/${manhwa.slug}` },
  ])

  return (
    <>
      <JsonLd data={generateManhwaJsonLd(manhwa, locale)} />
      <JsonLd data={breadcrumbs} />

      <ManhwaHero manhwa={manhwa} locale={locale} />

      {/* Library action */}
      <div className="mx-auto max-w-5xl px-4 pt-4">
        <LibraryButton manhwaId={manhwa.id} currentStatus={libraryEntry?.status ?? null} />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Tab-like sections */}
        <div className="flex flex-col gap-8 md:flex-row md:gap-12">
          {/* Main content */}
          <div className="flex-1 space-y-8">
            {/* Synopsis */}
            {synopsis && (
              <section>
                <h2 className="mb-3 font-display text-lg font-semibold">
                  {t('synopsis')}
                </h2>
                <SynopsisSection synopsis={synopsis} />
              </section>
            )}

            {/* Tropes */}
            {manhwa.trope_links.length > 0 && (
              <section>
                <h2 className="mb-3 font-display text-lg font-semibold">
                  {t('tropes')}
                </h2>
                <TropeList tropes={manhwa.trope_links} locale={locale} />
              </section>
            )}

            {/* External scores */}
            {(manhwa.ext_score_mal || manhwa.ext_score_anilist) && (
              <section>
                <h2 className="mb-3 font-display text-lg font-semibold">
                  External Scores
                </h2>
                <div className="flex flex-wrap gap-4">
                  {manhwa.ext_score_mal && (
                    <a
                      href={manhwa.mal_id ? `https://myanimelist.net/manga/${manhwa.mal_id}` : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-elevated px-4 py-3 transition-colors hover:bg-border"
                    >
                      <span className="font-mono text-lg font-bold text-crystal-blue">
                        {manhwa.ext_score_mal.toFixed(1)}
                      </span>
                      <span className="text-sm text-text-secondary">MyAnimeList</span>
                    </a>
                  )}
                  {manhwa.ext_score_anilist && (
                    <a
                      href={`https://anilist.co/manga/${manhwa.anilist_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-elevated px-4 py-3 transition-colors hover:bg-border"
                    >
                      <span className="font-mono text-lg font-bold text-crystal-blue">
                        {manhwa.ext_score_anilist.toFixed(1)}
                      </span>
                      <span className="text-sm text-text-secondary">AniList</span>
                    </a>
                  )}
                </div>
              </section>
            )}

            {/* Read links */}
            {manhwa.read_links.length > 0 && (
              <section>
                <h2 className="mb-3 font-display text-lg font-semibold">
                  {t('readLegally')}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {manhwa.read_links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-elevated px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-border"
                    >
                      {link.platform}
                      {link.is_free && (
                        <span className="ml-1.5 text-success">Free</span>
                      )}
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar info */}
          <aside className="w-full space-y-6 md:w-64">
            <div className="rounded-lg bg-surface p-4">
              <h3 className="mb-3 text-sm font-semibold text-text-muted uppercase tracking-wide">
                {t('info')}
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-text-muted">Type</dt>
                  <dd className="text-text-primary">{manhwa.type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">Status</dt>
                  <dd className="text-text-primary">{t(`status.${manhwa.status}`)}</dd>
                </div>
                {manhwa.chapter_count && (
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Chapters</dt>
                    <dd className="text-text-primary">{manhwa.chapter_count}</dd>
                  </div>
                )}
                {manhwa.release_year && (
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Year</dt>
                    <dd className="text-text-primary">
                      {manhwa.release_year}
                      {manhwa.end_year ? `–${manhwa.end_year}` : ''}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-text-muted">Origin</dt>
                  <dd className="text-text-primary">
                    {manhwa.origin_country === 'KR' ? 'Korea' : 'China'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Alt titles */}
            {manhwa.title_alt.length > 0 && (
              <div className="rounded-lg bg-surface p-4">
                <h3 className="mb-2 text-sm font-semibold text-text-muted uppercase tracking-wide">
                  Also Known As
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

        {/* Reviews section */}
        <section className="mt-10">
          <h2 className="mb-4 font-display text-lg font-semibold">{t('reviews')}</h2>

          {user && (
            <div className="mb-6">
              <ReviewForm manhwaId={manhwa.id} />
            </div>
          )}

          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">No reviews yet. Be the first!</p>
          )}
        </section>

        {/* Similar titles */}
        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 font-display text-lg font-semibold">{t('similar')}</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
              {related.map((m) => (
                <ManhwaCard key={m.id} manhwa={m} locale={locale} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
