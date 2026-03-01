export type ControversyLevel =
  | 'consensus'
  | 'mixed'
  | 'controversial'
  | 'very_controversial'

/**
 * Get controversy level from score standard deviation.
 */
export function getControversyLevel(
  stddev: number | null | undefined
): ControversyLevel {
  if (stddev == null || stddev < 1) return 'consensus'
  if (stddev < 1.5) return 'mixed'
  if (stddev < 2.5) return 'controversial'
  return 'very_controversial'
}
