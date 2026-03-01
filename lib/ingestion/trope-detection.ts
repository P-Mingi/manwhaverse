import type { TropeCategory } from '@prisma/client'

interface TropeRule {
  slug: string
  name: string
  category: TropeCategory
  keywords: string[]
}

const TROPE_RULES: TropeRule[] = [
  // NARRATIVE
  {
    slug: 'regression',
    name: 'Regression',
    category: 'NARRATIVE',
    keywords: ['regress', 'go back in time', 'return to the past', 'turned back time', 'second chance', 'time travel'],
  },
  {
    slug: 'reincarnation',
    name: 'Reincarnation',
    category: 'NARRATIVE',
    keywords: ['reincarnated', 'reborn', 'previous life', 'past life', 'transmigrated', 'transmigration'],
  },
  {
    slug: 'system',
    name: 'System',
    category: 'NARRATIVE',
    keywords: ['system', 'status window', 'level up', 'skill tree', 'quest', 'stat window', 'game-like'],
  },
  {
    slug: 'tower-climbing',
    name: 'Tower Climbing',
    category: 'NARRATIVE',
    keywords: ['tower', 'climb the tower', 'floor', 'ascending'],
  },
  {
    slug: 'gate-dungeon',
    name: 'Gates & Dungeons',
    category: 'NARRATIVE',
    keywords: ['gate', 'dungeon', 'portal', 'rift', 'raid', 'hunter'],
  },
  {
    slug: 'revenge',
    name: 'Revenge',
    category: 'THEME',
    keywords: ['revenge', 'vengeance', 'avenge', 'retribution', 'payback'],
  },
  {
    slug: 'redemption',
    name: 'Redemption',
    category: 'THEME',
    keywords: ['redemption', 'atone', 'make amends', 'second chance'],
  },

  // PROTAGONIST_TYPE
  {
    slug: 'overpowered-mc',
    name: 'Overpowered MC',
    category: 'PROTAGONIST_TYPE',
    keywords: ['overwhelmingly strong', 'most powerful', 'overpowered', 'strongest', 'invincible', 'unbeatable'],
  },
  {
    slug: 'villain-mc',
    name: 'Villain MC',
    category: 'PROTAGONIST_TYPE',
    keywords: ['villain', 'antagonist', 'anti-hero', 'evil protagonist', 'dark protagonist'],
  },
  {
    slug: 'female-lead',
    name: 'Female Lead',
    category: 'PROTAGONIST_TYPE',
    keywords: ['female protagonist', 'heroine', 'female lead', 'she ', 'her '],
  },
  {
    slug: 'underdog',
    name: 'Underdog',
    category: 'PROTAGONIST_TYPE',
    keywords: ['weakest', 'underdog', 'zero to hero', 'looked down upon', 'bullied', 'talentless'],
  },

  // SETTING
  {
    slug: 'murim',
    name: 'Murim / Martial Arts',
    category: 'SETTING',
    keywords: ['murim', 'martial art', 'cultivation', 'qi', 'martial world', 'sect', 'wuxia', 'xianxia'],
  },
  {
    slug: 'isekai',
    name: 'Isekai / Other World',
    category: 'SETTING',
    keywords: ['isekai', 'another world', 'other world', 'summoned', 'transported to', 'fantasy world'],
  },
  {
    slug: 'modern-fantasy',
    name: 'Modern Fantasy',
    category: 'SETTING',
    keywords: ['modern world', 'modern day', 'contemporary', 'real world'],
  },
  {
    slug: 'school',
    name: 'School',
    category: 'SETTING',
    keywords: ['school', 'academy', 'student', 'campus', 'classroom', 'high school'],
  },

  // THEME
  {
    slug: 'romance',
    name: 'Romance',
    category: 'THEME',
    keywords: ['romance', 'love', 'relationship', 'romantic'],
  },
  {
    slug: 'found-family',
    name: 'Found Family',
    category: 'THEME',
    keywords: ['found family', 'companionship', 'bond', 'comrades', 'party members'],
  },
  {
    slug: 'survival',
    name: 'Survival',
    category: 'THEME',
    keywords: ['survival', 'survive', 'death game', 'battle royale', 'apocalypse'],
  },
  {
    slug: 'politics',
    name: 'Politics & Intrigue',
    category: 'THEME',
    keywords: ['politic', 'kingdom', 'noble', 'throne', 'conspiracy', 'intrigue', 'court'],
  },

  // AMBIANCE
  {
    slug: 'dark',
    name: 'Dark & Mature',
    category: 'AMBIANCE',
    keywords: ['dark', 'gore', 'brutal', 'violent', 'mature', 'grim', 'bloody'],
  },
  {
    slug: 'comedy',
    name: 'Comedy',
    category: 'AMBIANCE',
    keywords: ['comedy', 'funny', 'humor', 'hilarious', 'gag', 'parody'],
  },
]

/**
 * Detect tropes from a synopsis using keyword matching.
 * Returns trope slugs that matched.
 */
export function detectTropes(synopsis: string | null): string[] {
  if (!synopsis) return []

  const text = synopsis.toLowerCase()
  const detected: string[] = []

  for (const rule of TROPE_RULES) {
    const matches = rule.keywords.some((keyword) => text.includes(keyword))
    if (matches) {
      detected.push(rule.slug)
    }
  }

  return detected
}

/**
 * Get the full trope rule by slug.
 */
export function getTropeRule(slug: string): TropeRule | undefined {
  return TROPE_RULES.find((r) => r.slug === slug)
}

/**
 * Get all trope rules for seeding the DB.
 */
export function getAllTropeRules(): TropeRule[] {
  return TROPE_RULES
}
