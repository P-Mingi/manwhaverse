// /scripts/seed/templates/reactions.ts

// Korean reaction types and their probability weights per score tier

export type ReactionType = 'HEOL' | 'DAEBAK' | 'GAMDONG' | 'KINGBAT' | 'MICHYEO' | 'JUKGET'

export interface ReactionTier {
  reactions: ReactionType[]
  weights: number[]
}

export const REACTION_TIERS: Record<'high' | 'mid' | 'low', ReactionTier> = {
  // Score 8-10: positive reactions
  high: {
    reactions: ['DAEBAK', 'MICHYEO', 'JUKGET', 'GAMDONG'],
    weights: [0.35, 0.25, 0.2, 0.2],
  },
  // Score 6-7: mixed reactions
  mid: {
    reactions: ['GAMDONG', 'DAEBAK', 'HEOL'],
    weights: [0.4, 0.3, 0.3],
  },
  // Score 1-5: negative reactions
  low: {
    reactions: ['KINGBAT', 'HEOL', 'MICHYEO'],
    weights: [0.4, 0.35, 0.25],
  },
}

export function getReactionTier(score: number): 'high' | 'mid' | 'low' {
  if (score >= 8) return 'high'
  if (score >= 6) return 'mid'
  return 'low'
}
