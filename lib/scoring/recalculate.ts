import { prisma } from '@/lib/db/client'
import { getDisplayScore, getDisplayPopularity } from './engine'

const SCORE_SELECT = {
  id: true,
  score_avg: true,
  score_count: true,
  score_stddev: true,
  ext_score_anilist: true,
  ext_score_mal: true,
  ext_score_composite: true,
  ext_score_anilist_count: true,
  reader_count: true,
  favorite_count: true,
} as const

/**
 * Recalculate and store display_* fields for all published manhwas.
 * Run hourly via cron.
 */
export async function recalculateAllScores(): Promise<number> {
  const manhwas = await prisma.manhwa.findMany({
    where: { is_published: true },
    select: SCORE_SELECT,
  })

  let updated = 0

  for (const manhwa of manhwas) {
    const displayScore = getDisplayScore(manhwa)
    const displayPop = getDisplayPopularity(manhwa)

    await prisma.manhwa.update({
      where: { id: manhwa.id },
      data: {
        display_score: displayScore.value,
        display_score_source: displayScore.source,
        display_score_phase: displayScore.phase,
        display_score_confidence: displayScore.confidence,
        display_popularity: displayPop.value,
        display_popularity_source: displayPop.source,
      },
    })

    updated++
  }

  console.log(`[scoring] Recalculated ${updated} manhwas`)
  return updated
}

/**
 * Recalculate trending_score based on 7-day activity.
 */
export async function recalculateTrendingScores(): Promise<number> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const recentActivity = await prisma.userLibrary.groupBy({
    by: ['manhwa_id'],
    where: { created_at: { gte: sevenDaysAgo } },
    _count: true,
  })

  const recentReviews = await prisma.review.groupBy({
    by: ['manhwa_id'],
    where: { created_at: { gte: sevenDaysAgo } },
    _count: true,
  })

  const activityMap = new Map<string, number>()

  for (const entry of recentActivity) {
    activityMap.set(
      entry.manhwa_id,
      (activityMap.get(entry.manhwa_id) ?? 0) + entry._count * 1
    )
  }

  for (const entry of recentReviews) {
    activityMap.set(
      entry.manhwa_id,
      (activityMap.get(entry.manhwa_id) ?? 0) + entry._count * 3
    )
  }

  for (const [manhwaId, score] of activityMap) {
    await prisma.manhwa.update({
      where: { id: manhwaId },
      data: { trending_score: score },
    })
  }

  // Reset manhwas with no recent activity
  await prisma.manhwa.updateMany({
    where: {
      id: { notIn: Array.from(activityMap.keys()) },
      trending_score: { gt: 0 },
    },
    data: { trending_score: 0 },
  })

  console.log(`[trending] Updated ${activityMap.size} manhwas`)
  return activityMap.size
}
