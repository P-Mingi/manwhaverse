/**
 * Format a number for compact display (e.g. 1200 → "1.2k")
 */
export function formatCount(count: number): string {
  if (count < 1000) return count.toString()
  if (count < 1_000_000) {
    const k = count / 1000
    return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`
  }
  const m = count / 1_000_000
  return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`
}
