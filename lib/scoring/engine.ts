// ═══════════════════════════════════════════════════════════
// SCORING ENGINE — Single source of truth for display scores
// ═══════════════════════════════════════════════════════════

// Thresholds — adjust here to change transition points
export const THRESHOLDS = {
  GROWING_MIN_VOTES: 10,
  MATURE_MIN_VOTES: 50,
  GROWING_MIN_READERS: 20,
  MATURE_MIN_READERS: 200,
} as const

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export type ScoringPhase = 'BOOTSTRAP' | 'GROWING' | 'MATURE'

export interface DisplayScore {
  value: number | null
  source: string // "AniList" | "ManhwaVerse + AniList" | "ManhwaVerse"
  phase: ScoringPhase
  mvScore: number | null
  mvVotes: number
  extScore: number | null
  extVotes: number | null
  confidence: number // 0.0 - 1.0
}

export interface DisplayPopularity {
  value: number
  source: string
  phase: ScoringPhase
  mvReaders: number
  extPopularity: number | null
}

export interface ManhwaScoreData {
  score_avg: number | null
  score_count: number
  score_stddev: number | null
  ext_score_anilist: number | null
  ext_score_mal: number | null
  ext_score_composite: number | null
  ext_score_anilist_count: number | null
  reader_count: number
  favorite_count: number
}

// ═══════════════════════════════════════════════════════════
// PHASE DETECTION
// ═══════════════════════════════════════════════════════════

export function detectPhase(data: ManhwaScoreData): ScoringPhase {
  if (data.score_count >= THRESHOLDS.MATURE_MIN_VOTES) return 'MATURE'
  if (data.score_count >= THRESHOLDS.GROWING_MIN_VOTES) return 'GROWING'
  return 'BOOTSTRAP'
}

// ═══════════════════════════════════════════════════════════
// SCORE CALCULATION
// ═══════════════════════════════════════════════════════════

export function getDisplayScore(data: ManhwaScoreData): DisplayScore {
  const phase = detectPhase(data)

  const base = {
    mvScore: data.score_avg,
    mvVotes: data.score_count,
    extScore: data.ext_score_anilist ?? data.ext_score_composite ?? data.ext_score_mal,
    extVotes: data.ext_score_anilist_count,
    phase,
  }

  switch (phase) {
    case 'MATURE': {
      return {
        ...base,
        value: data.score_avg,
        source: 'ManhwaVerse',
        confidence: Math.min(data.score_count / 200, 1.0),
      }
    }

    case 'GROWING': {
      const extScore = data.ext_score_anilist ?? data.ext_score_composite ?? data.ext_score_mal

      if (data.score_avg && extScore) {
        const mvWeight =
          (data.score_count - THRESHOLDS.GROWING_MIN_VOTES) /
          (THRESHOLDS.MATURE_MIN_VOTES - THRESHOLDS.GROWING_MIN_VOTES)
        const clampedWeight = Math.max(0.2, Math.min(mvWeight, 0.98))
        const blended = data.score_avg * clampedWeight + extScore * (1 - clampedWeight)

        return {
          ...base,
          value: Math.round(blended * 10) / 10,
          source: 'ManhwaVerse + AniList',
          confidence: clampedWeight,
        }
      }

      return {
        ...base,
        value: data.score_avg,
        source: 'ManhwaVerse',
        confidence: data.score_count / THRESHOLDS.MATURE_MIN_VOTES,
      }
    }

    case 'BOOTSTRAP': {
      const extScore = data.ext_score_anilist ?? data.ext_score_composite ?? data.ext_score_mal
      let source = 'AniList'
      if (!data.ext_score_anilist && data.ext_score_mal) source = 'MAL'
      if (!data.ext_score_anilist && !data.ext_score_mal && data.ext_score_composite)
        source = 'Composite'

      return {
        ...base,
        value: extScore,
        source,
        confidence: extScore ? 0.5 : 0,
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════
// POPULARITY CALCULATION
// ═══════════════════════════════════════════════════════════

export function getDisplayPopularity(data: ManhwaScoreData): DisplayPopularity {
  const mvReaders = data.reader_count
  const extPop = data.ext_score_anilist_count

  if (mvReaders >= THRESHOLDS.MATURE_MIN_READERS) {
    return {
      value: mvReaders,
      source: 'ManhwaVerse',
      phase: 'MATURE',
      mvReaders,
      extPopularity: extPop,
    }
  }

  if (mvReaders >= THRESHOLDS.GROWING_MIN_READERS && extPop) {
    const mvWeight =
      (mvReaders - THRESHOLDS.GROWING_MIN_READERS) /
      (THRESHOLDS.MATURE_MIN_READERS - THRESHOLDS.GROWING_MIN_READERS)
    const clampedWeight = Math.max(0.1, Math.min(mvWeight, 0.9))

    return {
      value: clampedWeight > 0.5 ? mvReaders : extPop,
      source: clampedWeight > 0.5 ? 'ManhwaVerse' : 'AniList',
      phase: 'GROWING',
      mvReaders,
      extPopularity: extPop,
    }
  }

  return {
    value: extPop ?? mvReaders,
    source: extPop ? 'AniList' : 'ManhwaVerse',
    phase: 'BOOTSTRAP',
    mvReaders,
    extPopularity: extPop,
  }
}
