import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getManhwaBySlug, getTopManhwaSlugs, getRelatedManhwas } from '@/lib/db/manhwa'
import { getRelationsByManhwaId } from '@/lib/db/relation'
import { getCharactersByManhwaId } from '@/lib/db/character'
import { getReviewsForManhwa } from '@/lib/db/review'
import { getUser } from '@/lib/auth/session'
import { getCurrentContentFilter } from '@/lib/nsfw'
import { generateManhwaMetadata } from '@/lib/seo/metadata'
import { SynopsisSection } from '@/components/features/SynopsisSection'
import { TropeList } from '@/components/features/TropeList'
import { ManhwaCard } from '@/components/features/ManhwaCard'
import { ReviewCard } from '@/components/features/ReviewCard'
import { ReviewForm } from '@/components/features/ReviewForm'
import { ManhwaCharacters } from '@/components/features/manhwa/ManhwaCharacters'
import { ManhwaRelations } from '@/components/features/manhwa/ManhwaRelations'
import { KoreanReactions } from '@/components/features/manhwa/KoreanReactions'
import { CharacterVoting } from '@/components/features/manhwa/CharacterVoting'
import { getManhwaReactionCounts, getUserManhwaReactions } from '@/lib/db/manhwa-reaction'
import { getCharacterVoteRankings, getUserCharacterVote } from '@/lib/db/character-vote'
import { getActivePollForManhwa, getUserPollVotes } from '@/lib/db/poll'
import { PollWidget } from '@/components/features/poll/PollWidget'
import { getManhwaFanArts } from '@/lib/db/fan-art'

export const revalidate = 3600

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
  const contentFilter = await getCurrentContentFilter()

  const synopsis = locale === 'fr'
    ? (manhwa.synopsis_fr ?? manhwa.synopsis_en)
    : manhwa.synopsis_en

  const [{ reviews, total: reviewCount }, related, relations, allCharacters, reactionCounts, userReactions, charVoteRankings, userCharVote, activePoll, fanArts] = await Promise.all([
    getReviewsForManhwa(manhwa.id),
    getRelatedManhwas(manhwa.id, 6),
    getRelationsByManhwaId(manhwa.id),
    getCharactersByManhwaId(manhwa.id),
    getManhwaReactionCounts(manhwa.id),
    user ? getUserManhwaReactions(user.id, manhwa.id) : ([] as const),
    getCharacterVoteRankings(manhwa.id),
    user ? getUserCharacterVote(user.id, manhwa.id) : null,
    getActivePollForManhwa(manhwa.id),
    getManhwaFanArts(manhwa.id, 6).catch(() => []),
  ])

  const userPollVotes = activePoll && user
    ? await getUserPollVotes(user.id, activePoll.id)
    : []

  return (
    <div className="space-y-8">
      {/* 1. Synopsis */}
      {synopsis && (
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">
            {t('synopsis')}
          </h2>
          <SynopsisSection synopsis={synopsis} />
        </section>
      )}

      {/* Korean Reactions */}
      <KoreanReactions
        manhwaId={manhwa.id}
        counts={reactionCounts as Record<import('@prisma/client').KoreanReaction, number>}
        userReactions={[...userReactions]}
        isLoggedIn={!!user}
      />

      {/* Poll */}
      {activePoll && (
        <PollWidget
          poll={activePoll}
          userVotedOptionIds={userPollVotes}
          locale={locale}
          isLoggedIn={!!user}
        />
      )}

      {/* 2. Relations */}
      {relations.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">
            {t('relations')}
          </h2>
          <ManhwaRelations relations={relations} locale={locale} />
        </section>
      )}

      {/* 4. Characters preview */}
      {allCharacters.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">
            {t('characters')}
          </h2>
          <ManhwaCharacters
            characters={allCharacters}
            locale={locale}
            manhwaSlug={slug}
          />
        </section>
      )}

      {/* Character Voting */}
      {allCharacters.length > 0 && (
        <section>
          <CharacterVoting
            manhwaId={manhwa.id}
            rankings={charVoteRankings}
            userVote={userCharVote}
            characters={allCharacters}
            isLoggedIn={!!user}
          />
        </section>
      )}

      {/* 5. Tropes */}
      {manhwa.trope_links.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">
            {t('tropes')}
          </h2>
          <TropeList tropes={manhwa.trope_links} locale={locale} />
        </section>
      )}

      {/* 6. Reviews preview */}
      <section>
        <h2 className="mb-4 font-display text-lg font-semibold">{t('reviews')}</h2>

        {user && (
          <div className="mb-6">
            <ReviewForm manhwaId={manhwa.id} hasExistingReviews={reviewCount > 0} />
          </div>
        )}

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.slice(0, 3).map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                currentUserId={user?.id}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">{t('noReviewsYet')}</p>
        )}
      </section>

      {/* 7. Similar titles */}
      {related.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-lg font-semibold">{t('similar')}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {related.map((m) => (
              <ManhwaCard key={m.id} manhwa={m} locale={locale} userContentFilter={contentFilter} />
            ))}
          </div>
        </section>
      )}

      {/* 8. Fan Art */}
      {fanArts.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">{t('fanArt')}</h2>
            <a
              href={`/${locale}/artwork?manhwa=${manhwa.slug}`}
              className="text-xs text-[#00ffff] opacity-70 transition-opacity hover:opacity-100"
            >
              {t('fanArtSeeAll')} →
            </a>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {fanArts.map((post) => {
              const img = post.images[0]
              if (!img) return null
              return (
                <a
                  key={post.id}
                  href={`/${locale}/artwork/${post.id}`}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-[#0d0d16]"
                  title={post.title}
                >
                  <img
                    src={img.thumb_url || img.image_url}
                    alt={img.alt_text ?? post.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30" />
                </a>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
