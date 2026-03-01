import type { Manhwa } from '@prisma/client'

interface ExternalScoreInput {
  score: number | null
  memberCount: number | null
}

/**
 * Compute the composite external score from MAL, AniList, and Kitsu.
 * Weights are based on member counts (capped).
 *
 * MAL weight: min(members/10k, 3)
 * AniList weight: min(popularity/10k, 2.5)
 * Kitsu weight: min(members/10k, 1.5)
 */
export function computeCompositeScore(
  manhwa: Pick<
    Manhwa,
    | 'ext_score_mal'
    | 'ext_score_mal_count'
    | 'ext_score_anilist'
    | 'ext_score_anilist_count'
    | 'ext_score_kitsu'
    | 'ext_score_kitsu_count'
  >
): number | null {
  const sources: Array<{ score: number; weight: number }> = []

  if (manhwa.ext_score_mal != null && manhwa.ext_score_mal_count != null) {
    sources.push({
      score: manhwa.ext_score_mal,
      weight: Math.min(manhwa.ext_score_mal_count / 10_000, 3),
    })
  }

  if (manhwa.ext_score_anilist != null && manhwa.ext_score_anilist_count != null) {
    sources.push({
      score: manhwa.ext_score_anilist,
      weight: Math.min(manhwa.ext_score_anilist_count / 10_000, 2.5),
    })
  }

  if (manhwa.ext_score_kitsu != null && manhwa.ext_score_kitsu_count != null) {
    sources.push({
      score: manhwa.ext_score_kitsu,
      weight: Math.min(manhwa.ext_score_kitsu_count / 10_000, 1.5),
    })
  }

  if (sources.length === 0) return null

  const totalWeight = sources.reduce((sum, s) => sum + s.weight, 0)
  if (totalWeight === 0) return null

  const weightedSum = sources.reduce((sum, s) => sum + s.score * s.weight, 0)
  return Math.round((weightedSum / totalWeight) * 100) / 100
}
