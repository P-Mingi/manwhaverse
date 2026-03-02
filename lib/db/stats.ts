import { prisma } from './client'
import type { Prisma } from '@prisma/client'

export interface ScoreDistributionBucket {
  score: number
  count: number
}

export interface StatusDistributionItem {
  status: string
  count: number
}

export interface ManhwaStatsData {
  scoreDistribution: ScoreDistributionBucket[]
  statusDistribution: StatusDistributionItem[]
  recentActivity: Array<{
    id: string
    type: string
    created_at: Date
    user: { username: string | null; display_name: string | null; avatar_url: string | null }
    metadata: Prisma.JsonValue
  }>
}

export async function getManhwaStats(manhwaId: string): Promise<ManhwaStatsData> {
  // Score distribution from user library entries
  const scoreEntries = await prisma.userLibrary.findMany({
    where: {
      manhwa_id: manhwaId,
      score: { not: null },
    },
    select: { score: true },
  })

  // Bucket scores into 1-10 ranges
  const scoreBuckets = Array.from({ length: 10 }, (_, i) => ({
    score: i + 1,
    count: 0,
  }))
  for (const entry of scoreEntries) {
    if (entry.score != null) {
      const bucket = Math.min(Math.max(Math.ceil(entry.score), 1), 10) - 1
      scoreBuckets[bucket]!.count++
    }
  }

  // Status distribution from user library
  const statusGroups = await prisma.userLibrary.groupBy({
    by: ['status'],
    where: { manhwa_id: manhwaId },
    _count: { status: true },
  })
  const statusDistribution = statusGroups.map((g) => ({
    status: g.status,
    count: g._count.status,
  }))

  // Recent activity for this manhwa
  const recentActivity = await prisma.activity.findMany({
    where: { manhwa_id: manhwaId },
    include: {
      user: {
        select: {
          username: true,
          display_name: true,
          avatar_url: true,
        },
      },
    },
    orderBy: { created_at: 'desc' },
    take: 30,
  })

  return {
    scoreDistribution: scoreBuckets,
    statusDistribution,
    recentActivity: recentActivity.map((a) => ({
      id: a.id,
      type: a.type,
      created_at: a.created_at,
      user: a.user,
      metadata: a.metadata,
    })),
  }
}

export interface AniListStats {
  scoreDistribution: Array<{ score: number; amount: number }>
  statusDistribution: Array<{ status: string; amount: number }>
  rankings: Array<{
    id: number
    rank: number
    type: string
    format: string
    year: number | null
    season: string | null
    allTime: boolean
    context: string
  }>
}

export function parseAniListStats(json: Prisma.JsonValue): AniListStats | null {
  if (!json || typeof json !== 'object') return null
  return json as unknown as AniListStats
}
