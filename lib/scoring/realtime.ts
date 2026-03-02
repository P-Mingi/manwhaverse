import { prisma } from '@/lib/db/client'
import { getDisplayScore, getDisplayPopularity } from './engine'

/**
 * Recalculate display_* fields for a single manhwa.
 * Call after each vote, score change, or library add.
 */
export async function recalculateSingleManhwaScore(manhwaId: string): Promise<void> {
  const manhwa = await prisma.manhwa.findUnique({
    where: { id: manhwaId },
    select: {
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
    },
  })

  if (!manhwa) return

  const displayScore = getDisplayScore(manhwa)
  const displayPop = getDisplayPopularity(manhwa)

  await prisma.manhwa.update({
    where: { id: manhwaId },
    data: {
      display_score: displayScore.value,
      display_score_source: displayScore.source,
      display_score_phase: displayScore.phase,
      display_score_confidence: displayScore.confidence,
      display_popularity: displayPop.value,
      display_popularity_source: displayPop.source,
    },
  })
}
