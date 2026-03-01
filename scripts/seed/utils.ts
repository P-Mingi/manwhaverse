// /scripts/seed/utils.ts

/**
 * Gaussian random with Box-Muller transform.
 */
export function gaussianRandom(mean: number, stddev: number): number {
  const u1 = Math.random()
  const u2 = Math.random()
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return z * stddev + mean
}

/**
 * Random integer between min and max (inclusive).
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Random float between min and max.
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/**
 * Pick N random items from an array.
 */
export function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(n, arr.length))
}

/**
 * Pick one random item from an array.
 */
export function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

/**
 * Random date between two dates.
 */
export function randomDate(start: Date, end: Date): Date {
  const startTime = start.getTime()
  const endTime = end.getTime()
  return new Date(startTime + Math.random() * (endTime - startTime))
}

/**
 * Chunk an array into smaller arrays.
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

/**
 * Sleep for ms.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Weighted random selection.
 */
export function weightedRandom<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  let random = Math.random() * totalWeight
  for (let i = 0; i < items.length; i++) {
    random -= weights[i]!
    if (random <= 0) return items[i]!
  }
  return items[items.length - 1]!
}

/**
 * Replace {placeholders} in a template string.
 */
export function replacePlaceholders(
  template: string,
  data: Record<string, string | number>,
): string {
  let result = template
  for (const [key, value] of Object.entries(data)) {
    result = result.split(`{${key}}`).join(String(value))
  }
  return result
}

/**
 * DiceBear avatar URL for a username.
 */
export function getAvatarUrl(username: string): string {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(username)}`
}
