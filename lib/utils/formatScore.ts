/**
 * Format a score for display (always 1 decimal place)
 */
export function formatScore(score: number | null | undefined): string {
  if (score == null) return '—'
  return score.toFixed(1)
}

/**
 * Get the crystal state based on score
 * ENCRÉ (9-10) | TRACÉ (7-8.9) | BROUILLON (5-6.9) | VIERGE (<5 or null)
 */
export function getCrystalState(
  score: number | null | undefined
): 'encre' | 'trace' | 'brouillon' | 'vierge' {
  if (score == null || score < 5) return 'vierge'
  if (score < 7) return 'brouillon'
  if (score < 9) return 'trace'
  return 'encre'
}

/**
 * Get the crystal color class based on score
 */
export function getCrystalColor(
  score: number | null | undefined
): string {
  const state = getCrystalState(score)
  switch (state) {
    case 'encre':
      return 'text-crystal-gold'
    case 'trace':
      return 'text-crystal-blue'
    case 'brouillon':
      return 'text-crystal-red'
    case 'vierge':
      return 'text-crystal-void'
  }
}

/**
 * Get the kanji label for a crystal state
 */
export function getCrystalLabel(
  score: number | null | undefined
): string {
  const state = getCrystalState(score)
  switch (state) {
    case 'encre':
      return '墨' // ENCRÉ
    case 'trace':
      return '線' // TRACÉ
    case 'brouillon':
      return '描' // BROUILLON
    case 'vierge':
      return '白' // VIERGE
  }
}
