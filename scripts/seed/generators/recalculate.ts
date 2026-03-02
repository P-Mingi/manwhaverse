// /scripts/seed/generators/recalculate.ts
// Recalculates manhwa averages from UserLibrary data after seeding

import type { PrismaClient } from '@prisma/client'
import { chunk } from '../utils'

export async function recalculateManhwaAverages(prisma: PrismaClient): Promise<void> {
  // Aggregate scores per manhwa
  const groups = await prisma.userLibrary.groupBy({
    by: ['manhwa_id'],
    where: { score: { not: null } },
    _avg: { score: true },
    _count: { score: true },
    _min: { score: true },
    _max: { score: true },
  })

  console.log(`  Updating averages for ${groups.length} manhwas...`)

  // Process in chunks to avoid too many concurrent queries
  const batches = chunk(groups, 50)
  for (const batch of batches) {
    await Promise.all(
      batch.map(async (entry) => {
        const avg = entry._avg.score!
        const count = entry._count.score

        // Fetch individual scores to compute stddev
        const scores = await prisma.userLibrary.findMany({
          where: { manhwa_id: entry.manhwa_id, score: { not: null } },
          select: { score: true },
        })

        const variance =
          scores.reduce((sum, s) => sum + Math.pow(s.score! - avg, 2), 0) / scores.length
        const stddev = Math.sqrt(variance)

        const positiveCount = scores.filter((s) => s.score! >= 7).length
        const positiveRate = positiveCount / count

        // Count unique readers (all library entries, not just scored)
        const readerCount = await prisma.userLibrary.count({
          where: { manhwa_id: entry.manhwa_id },
        })

        // Count favorites
        const favoriteCount = await prisma.userLibrary.count({
          where: { manhwa_id: entry.manhwa_id, is_favorite: true },
        })

        // Count reviews
        const reviewCount = await prisma.review.count({
          where: { manhwa_id: entry.manhwa_id },
        })

        await prisma.manhwa.update({
          where: { id: entry.manhwa_id },
          data: {
            score_avg: Math.round(avg * 100) / 100,
            score_count: count,
            score_stddev: Math.round(stddev * 1000) / 1000,
            score_positive_rate: Math.round(positiveRate * 1000) / 1000,
            reader_count: readerCount,
            favorite_count: favoriteCount,
            review_count: reviewCount,
          },
        })
      }),
    )
  }
}
