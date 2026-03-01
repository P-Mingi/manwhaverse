// /scripts/seed/generators/reviews.ts
import type { PrismaClient } from '@prisma/client'
import type { SeedUser } from './users'
import type { ManhwaData } from './libraries'
import type { SEED_CONFIG } from '../config'
import { MICRO_REVIEWS_FR } from '../templates/reviews-micro-fr'
import { MICRO_REVIEWS_EN } from '../templates/reviews-micro-en'
import { LONG_REVIEWS_FR } from '../templates/reviews-long-fr'
import { LONG_REVIEWS_EN } from '../templates/reviews-long-en'
import { pickOne, randomDate, replacePlaceholders, randomInt } from '../utils'

type ScoreTier = 'high' | 'mid' | 'low'

function getTier(score: number): ScoreTier {
  if (score >= 8) return 'high'
  if (score >= 6) return 'mid'
  return 'low'
}

function getTemplate(locale: 'fr' | 'en', tier: ScoreTier, isMicro: boolean): string {
  const pool = isMicro
    ? locale === 'fr'
      ? MICRO_REVIEWS_FR[tier]
      : MICRO_REVIEWS_EN[tier]
    : locale === 'fr'
      ? LONG_REVIEWS_FR[tier]
      : LONG_REVIEWS_EN[tier]

  return pickOne(pool ?? MICRO_REVIEWS_EN['mid']!)
}

function buildReview(
  template: string,
  manhwa: ManhwaData,
  score: number,
): string {
  const drop = manhwa.chapter_count
    ? randomInt(
        Math.floor(manhwa.chapter_count * 0.1),
        Math.floor(manhwa.chapter_count * 0.5),
      )
    : randomInt(10, 50)

  return replacePlaceholders(template, {
    title: manhwa.slug.replace(/-/g, ' '),
    genre: manhwa.genres[0] ?? 'manhwa',
    chapters: manhwa.chapter_count ?? 100,
    drop_chapter: drop,
    score,
    mc: 'le MC',
  })
}

export async function generateReviews(
  prisma: PrismaClient,
  users: SeedUser[],
  allManhwas: ManhwaData[],
  config: typeof SEED_CONFIG,
): Promise<number> {
  const manhwaMap = new Map(allManhwas.map((m) => [m.id, m]))

  // Load all library entries for seed users that have scores
  const libs = await prisma.userLibrary.findMany({
    where: {
      user: { is_seed: true },
      score: { not: null },
    },
    select: { user_id: true, manhwa_id: true, score: true, created_at: true },
  })

  // Build user lookup
  const userMap = new Map(users.map((u) => [u.id, u]))

  let created = 0

  for (const lib of libs) {
    const user = userMap.get(lib.user_id)
    const manhwa = manhwaMap.get(lib.manhwa_id)
    if (!user || !manhwa || lib.score === null) continue

    const score = lib.score
    if (score < 4) continue // Very low scores rarely get reviews

    const tier = getTier(score)

    // Decide if this user/manhwa gets a micro review
    const microProb = config.MICRO_REVIEW_PROBABILITY * user.archetype.reviewMultiplier
    const longProb = config.LONG_REVIEW_PROBABILITY * user.archetype.reviewMultiplier

    const doMicro = Math.random() < microProb
    const doLong = !doMicro && Math.random() < longProb

    if (!doMicro && !doLong) continue

    const isMicro = doMicro
    const template = getTemplate(user.locale, tier, isMicro)
    const content = buildReview(template, manhwa, score)
    const created_at = randomDate(lib.created_at, new Date())

    try {
      await prisma.review.create({
        data: {
          user_id: user.id,
          manhwa_id: manhwa.id,
          content,
          score,
          is_micro: isMicro,
          has_spoilers: false,
          likes_count: 0,
          created_at,
        },
      })
      created++
    } catch {
      // Duplicate or constraint — skip
    }
  }

  return created
}
