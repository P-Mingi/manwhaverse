// /scripts/seed/config.ts

export const SEED_CONFIG = {
  TOTAL_USERS: 1000,

  // Distribution des votes par tier de popularité (rank AniList)
  TIERS: {
    TIER_1: { range: [1, 50] as [number, number], votesMin: 80, votesMax: 150 }, // Top 50 → MATURE
    TIER_2: { range: [51, 200] as [number, number], votesMin: 30, votesMax: 80 }, // → GROWING/MATURE
    TIER_3: { range: [201, 500] as [number, number], votesMin: 10, votesMax: 30 }, // → GROWING
    TIER_4: { range: [501, 1000] as [number, number], votesMin: 3, votesMax: 10 }, // → BOOTSTRAP
    TIER_5: { range: [1001, 99999] as [number, number], votesMin: 0, votesMax: 3 }, // → BOOTSTRAP
  },

  // Distribution des statuts dans les bibliothèques
  STATUS_WEIGHTS: {
    COMPLETED: 0.35,
    READING: 0.25,
    PLAN_TO_READ: 0.25,
    ON_HOLD: 0.08,
    DROPPED: 0.05,
    REREADING: 0.02,
  } as const,

  // Reviews
  MICRO_REVIEW_PROBABILITY: 0.12, // 12% des titres notés ≥ 6 ont un avis rapide
  LONG_REVIEW_PROBABILITY: 0.03, // 3% des titres notés ont une critique longue

  // Réactions
  REACTION_PROBABILITY: 0.30, // 30% des titres lus ont au moins une réaction

  // Favoris
  FAVORITE_PROBABILITY_HIGH: 0.20, // 20% des titres notés ≥ 8 sont favoris
  FAVORITE_PROBABILITY_MED: 0.05, // 5% des titres notés 7

  // Follows
  FOLLOWS_MIN: 5,
  FOLLOWS_MAX: 30,

  // Character votes
  CHAR_VOTE_PROBABILITY: 0.50, // 50% des lecteurs qui ont noté ≥ 7 votent

  // Dates
  SEED_PERIOD_DAYS: 90, // Activité étalée sur 90 jours

  // Batch sizes for DB inserts
  BATCH_SIZE: 500,
}
