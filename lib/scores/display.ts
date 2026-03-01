import type { Manhwa } from '@prisma/client'

export type ScoreDisplayMode = 'bootstrap' | 'growing' | 'mature'

export interface ScoreDisplayResult {
  mode: ScoreDisplayMode
  primaryScore: number | null
  primaryLabel: string
  showExternalScores: boolean
  externalScoresPosition: 'prominent' | 'secondary' | 'stats-only'
  ctaText: string | null
}

/**
 * Determine the score display mode based on ManhwaVerse vote count.
 *
 * bootstrap (<50 MV votes): Show composite external score as primary
 * growing (50-499 MV votes): Show MV score as primary, external secondary
 * mature (500+ MV votes): Show MV score only, external in Stats tab
 */
export function getScoreDisplayMode(scoreCount: number): ScoreDisplayMode {
  if (scoreCount < 50) return 'bootstrap'
  if (scoreCount < 500) return 'growing'
  return 'mature'
}

/**
 * Get the display score configuration for a manhwa.
 * RULE: Always call this before displaying a score.
 */
export function getDisplayScore(
  manhwa: Pick<
    Manhwa,
    'score_avg' | 'score_count' | 'ext_score_composite'
  >
): ScoreDisplayResult {
  const mode = getScoreDisplayMode(manhwa.score_count)

  switch (mode) {
    case 'bootstrap':
      return {
        mode,
        primaryScore: manhwa.ext_score_composite,
        primaryLabel: 'referenceScore',
        showExternalScores: true,
        externalScoresPosition: 'prominent',
        ctaText: 'beFirstToRate',
      }
    case 'growing':
      return {
        mode,
        primaryScore: manhwa.score_avg,
        primaryLabel: 'communityScore',
        showExternalScores: true,
        externalScoresPosition: 'secondary',
        ctaText: null,
      }
    case 'mature':
      return {
        mode,
        primaryScore: manhwa.score_avg,
        primaryLabel: 'communityScore',
        showExternalScores: true,
        externalScoresPosition: 'stats-only',
        ctaText: null,
      }
  }
}
