// /scripts/seed/archetypes.ts

export interface Archetype {
  name: string
  weight: number // % des 1000 comptes
  count: number // nombre exact de comptes
  description: string
  preferredGenres: string[]
  preferredTropes: string[]
  avgScore: number
  scoreVariance: number
  librarySize: { min: number; max: number }
  reviewMultiplier: number // multiplicateur sur les probabilités de review
  reviewProbability: number
  locale: 'fr' | 'en' | 'mixed'
}

export const ARCHETYPES: Archetype[] = [
  {
    name: 'ACTION_JUNKIE',
    weight: 0.25,
    count: 250,
    description: 'Fan de manhwa action/fantasy, note haut les OP MC et les systèmes',
    preferredGenres: ['Action', 'Fantasy', 'Adventure'],
    preferredTropes: ['System', 'OP MC', 'Gates & Dungeons', 'Reincarnation'],
    avgScore: 7.5,
    scoreVariance: 1.5,
    librarySize: { min: 30, max: 150 },
    reviewMultiplier: 1.0,
    reviewProbability: 0.12,
    locale: 'mixed',
  },
  {
    name: 'ROMANCE_READER',
    weight: 0.20,
    count: 200,
    description: 'Fan de romance, slice of life, drama',
    preferredGenres: ['Romance', 'Drama', 'Slice of Life'],
    preferredTropes: ['Romance', 'School', 'Female Lead'],
    avgScore: 7.0,
    scoreVariance: 1.8,
    librarySize: { min: 20, max: 120 },
    reviewMultiplier: 1.5,
    reviewProbability: 0.20,
    locale: 'mixed',
  },
  {
    name: 'MURIM_ENTHUSIAST',
    weight: 0.10,
    count: 100,
    description: 'Spécialiste murim et arts martiaux',
    preferredGenres: ['Action', 'Adventure'],
    preferredTropes: ['Murim / Martial Arts', 'Regression', 'Tower Climbing'],
    avgScore: 7.8,
    scoreVariance: 1.2,
    librarySize: { min: 40, max: 200 },
    reviewMultiplier: 0.8,
    reviewProbability: 0.12,
    locale: 'en',
  },
  {
    name: 'CRITICAL_REVIEWER',
    weight: 0.10,
    count: 100,
    description: 'Note sévèrement, écrit des reviews longues et argumentées',
    preferredGenres: ['Drama', 'Psychological', 'Thriller'],
    preferredTropes: ['Dark & Mature', 'Politics & Intrigue', 'Villain MC'],
    avgScore: 6.0,
    scoreVariance: 2.0,
    librarySize: { min: 50, max: 250 },
    reviewMultiplier: 3.0,
    reviewProbability: 0.35,
    locale: 'en',
  },
  {
    name: 'CASUAL_READER',
    weight: 0.20,
    count: 200,
    description: 'Lit un peu de tout, note rarement en dessous de 6',
    preferredGenres: ['Action', 'Comedy', 'Romance', 'Fantasy'],
    preferredTropes: [],
    avgScore: 7.2,
    scoreVariance: 1.0,
    librarySize: { min: 10, max: 60 },
    reviewMultiplier: 0.3,
    reviewProbability: 0.05,
    locale: 'mixed',
  },
  {
    name: 'BINGE_READER',
    weight: 0.10,
    count: 100,
    description: 'Lit énormément, bibliothèque massive, note vite',
    preferredGenres: ['Action', 'Fantasy', 'Adventure', 'Comedy'],
    preferredTropes: ['Reincarnation', 'System', 'Isekai / Other World'],
    avgScore: 7.0,
    scoreVariance: 1.5,
    librarySize: { min: 100, max: 400 },
    reviewMultiplier: 0.2,
    reviewProbability: 0.03,
    locale: 'mixed',
  },
  {
    name: 'MANHUA_SPECIALIST',
    weight: 0.05,
    count: 50,
    description: 'Lit principalement des manhua chinois',
    preferredGenres: ['Action', 'Fantasy', 'Romance'],
    preferredTropes: ['Reincarnation', 'OP MC', 'Murim / Martial Arts'],
    avgScore: 6.8,
    scoreVariance: 1.8,
    librarySize: { min: 30, max: 150 },
    reviewMultiplier: 0.6,
    reviewProbability: 0.08,
    locale: 'mixed',
  },
]

/**
 * Pick a random archetype weighted by its probability.
 */
export function pickArchetype(): Archetype {
  const r = Math.random()
  let cumulative = 0
  for (const arch of ARCHETYPES) {
    cumulative += arch.weight
    if (r <= cumulative) return arch
  }
  return ARCHETYPES[0]!
}
