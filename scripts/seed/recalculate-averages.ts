import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Recalculate score_avg, score_count, score_stddev, reader_count, favorite_count
 * for all manhwas based on actual UserLibrary data.
 */
export async function recalculateManhwaAverages(): Promise<number> {
  // Get all manhwas with library entries
  const manhwaIds = await prisma.userLibrary.groupBy({
    by: ['manhwa_id'],
  })

  let updated = 0

  for (const { manhwa_id } of manhwaIds) {
    // Count readers (anyone with this in their library)
    const readerCount = await prisma.userLibrary.count({
      where: { manhwa_id },
    })

    // Count favorites
    const favoriteCount = await prisma.userLibrary.count({
      where: { manhwa_id, is_favorite: true },
    })

    // Score stats (only entries with a score)
    const scoreAgg = await prisma.userLibrary.aggregate({
      where: { manhwa_id, score: { not: null } },
      _avg: { score: true },
      _count: { score: true },
    })

    const scoreCount = scoreAgg._count.score
    const scoreAvg = scoreAgg._avg.score

    // Calculate stddev if we have scores
    let scoreStddev: number | null = null
    let positiveRate: number | null = null

    if (scoreCount >= 2 && scoreAvg !== null) {
      const scores = await prisma.userLibrary.findMany({
        where: { manhwa_id, score: { not: null } },
        select: { score: true },
      })

      const values = scores.map((s) => s.score!).filter(Boolean)
      const mean = scoreAvg
      const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
      scoreStddev = Math.sqrt(variance)
      positiveRate = values.filter((v) => v >= 7).length / values.length
    }

    // Review count
    const reviewCount = await prisma.review.count({
      where: { manhwa_id },
    })

    await prisma.manhwa.update({
      where: { id: manhwa_id },
      data: {
        score_avg: scoreAvg ? Math.round(scoreAvg * 100) / 100 : null,
        score_count: scoreCount,
        score_stddev: scoreStddev ? Math.round(scoreStddev * 100) / 100 : null,
        score_positive_rate: positiveRate ? Math.round(positiveRate * 100) / 100 : null,
        reader_count: readerCount,
        favorite_count: favoriteCount,
        review_count: reviewCount,
      },
    })

    updated++
  }

  console.log(`  Recalculated averages for ${updated} manhwas`)
  return updated
}
