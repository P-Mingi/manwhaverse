import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getManhwaBySlug, getTopManhwaSlugs, getRelatedManhwas } from '@/lib/db/manhwa'
import { getRelationsByManhwaId } from '@/lib/db/relation'
import { getCharactersByManhwaId } from '@/lib/db/character'
import { getReviewsForManhwa } from '@/lib/db/review'
import { getUser } from '@/lib/auth/session'
import { generateManhwaMetadata } from '@/lib/seo/metadata'
import { SynopsisSection } from '@/components/features/manhwa/SynopsisSection'
import { ManhwaCard } from '@/components/features/manhwa/ManhwaCard'
import { ManhwaCharacters } from '@/components/features/manhwa/ManhwaCharacters'
import { ManhwaRelations } from '@/components/features/manhwa/ManhwaRelations'
import { ReviewCard } from '@/components/features/reviews/ReviewCard'
import { ReviewForm } from '@/components/features/reviews/ReviewForm'

export const revalidate = 3600
export const dynamicParams = true

interface ManhwaPageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  try {
    const slugs = await getTopManhwaSlugs(200)
    if (!slugs.length) return []
    return ['en', 'fr'].flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: ManhwaPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const manhwa = await getManhwaBySlug(slug)
  if (!manhwa) return { title: 'Not Found' }
  return generateManhwaMetadata(manhwa, locale)
}

export default async function ManhwaPage({ params }: ManhwaPageProps) {
  const { locale, slug } = await params
  const manhwa = await getManhwaBySlug(slug)
  if (!manhwa) notFound()

  const user = await getUser()

  const synopsis = locale === 'fr'
    ? (manhwa.synopsis_fr ?? manhwa.synopsis_en)
    : manhwa.synopsis_en

  const [{ reviews, total: reviewCount }, related, relations, characters] = await Promise.all([
    getReviewsForManhwa(manhwa.id),
    getRelatedManhwas(manhwa.id, 6),
    getRelationsByManhwaId(manhwa.id),
    getCharactersByManhwaId(manhwa.id),
  ])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Synopsis */}
      {synopsis && (
        <section>
          <h2 className="font-display" style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
            {locale === 'fr' ? 'Synopsis' : 'Synopsis'}
          </h2>
          <SynopsisSection synopsis={synopsis} />
        </section>
      )}

      {/* Relations */}
      {relations.length > 0 && (
        <section>
          <h2 className="font-display" style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
            {locale === 'fr' ? 'Relations' : 'Relations'}
          </h2>
          <ManhwaRelations relations={relations} locale={locale} />
        </section>
      )}

      {/* Characters preview */}
      {characters.length > 0 && (
        <section>
          <h2 className="font-display" style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
            {locale === 'fr' ? 'Personnages' : 'Characters'}
          </h2>
          <ManhwaCharacters characters={characters} locale={locale} />
        </section>
      )}

      {/* Tropes */}
      {manhwa.trope_links.length > 0 && (
        <section>
          <h2 className="font-display" style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
            Tropes
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {manhwa.trope_links.map((tl) => (
              <span
                key={tl.trope.slug}
                style={{
                  fontSize: '12px',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 999,
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                {tl.trope.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section>
        <h2 className="font-display" style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
          {locale === 'fr' ? `Avis (${reviewCount})` : `Reviews (${reviewCount})`}
        </h2>

        {user && (
          <div style={{ marginBottom: '1rem' }}>
            <ReviewForm manhwaId={manhwa.id} />
          </div>
        )}

        {reviews.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {reviews.slice(0, 3).map((review) => (
              <ReviewCard key={review.id} review={review} locale={locale} />
            ))}
            {reviewCount > 3 && (
              <a
                href={`/${locale}/manhwa/${slug}/reviews`}
                style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}
              >
                {locale === 'fr' ? `Voir tous les avis (${reviewCount}) →` : `View all reviews (${reviewCount}) →`}
              </a>
            )}
          </div>
        ) : (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {locale === 'fr' ? 'Aucun avis pour le moment.' : 'No reviews yet. Be the first!'}
          </p>
        )}
      </section>

      {/* Similar titles */}
      {related.length > 0 && (
        <section>
          <h2 className="font-display" style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
            {locale === 'fr' ? 'Titres similaires' : 'Similar Titles'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
            {related.map((m) => (
              <ManhwaCard key={m.id} manhwa={m} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
