// /scripts/seed/generators/libraries.ts
import type { PrismaClient } from '@prisma/client'
import type { SeedUser } from './users'
import type { Archetype } from '../archetypes'
import type { SEED_CONFIG } from '../config'
import { randomInt, randomFloat, gaussianRandom, pickRandom, randomDate, chunk } from '../utils'

type StatusKey = 'COMPLETED' | 'READING' | 'PLAN_TO_READ' | 'ON_HOLD' | 'DROPPED' | 'REREADING'

export interface ManhwaData {
  id: string
  slug: string
  type: string
  status: string
  chapter_count: number | null
  ext_score_anilist: number | null
  ext_popularity_anilist: number | null
  genres: string[]
  tropes: string[]
}

export interface LibraryEntry {
  userId: string
  manhwaId: string
  status: StatusKey
  score: number | null
  progress: number
  is_favorite: boolean
  created_at: Date
}

function pickStatus(weights: Record<string, number>): StatusKey {
  const r = Math.random()
  let cumulative = 0
  for (const [status, weight] of Object.entries(weights)) {
    cumulative += weight
    if (r <= cumulative) return status as StatusKey
  }
  return 'COMPLETED'
}

function scoreForManhwa(
  manhwa: ManhwaData,
  archetype: Archetype,
  status: StatusKey,
): number | null {
  if (status === 'PLAN_TO_READ') return null
  if (status === 'READING' && Math.random() > 0.3) return null
  if (status === 'ON_HOLD' && Math.random() > 0.4) return null
  if (status === 'DROPPED' && Math.random() > 0.5) return null
  if (status === 'COMPLETED' && Math.random() > 0.8) return null
  if (status === 'REREADING' && Math.random() > 0.9) return null

  const base = manhwa.ext_score_anilist ?? archetype.avgScore
  const genreMatch = manhwa.genres.some((g) => archetype.preferredGenres.includes(g))
  const tropeMatch = manhwa.tropes.some((t) => archetype.preferredTropes.includes(t))

  let adj = 0
  if (genreMatch && tropeMatch) adj = randomFloat(0.3, 0.8)
  else if (genreMatch || tropeMatch) adj = randomFloat(0, 0.4)
  else adj = randomFloat(-0.5, 0.1)

  if (status === 'DROPPED') adj -= randomFloat(1.5, 3.0)

  const variance = gaussianRandom(0, archetype.scoreVariance * 0.5)
  let score = base + adj + variance
  score = Math.max(1, Math.min(10, score))
  score = Math.round(score * 2) / 2
  return score
}

function progressForStatus(status: StatusKey, chapterCount: number | null): number {
  const max = chapterCount ?? 100
  switch (status) {
    case 'COMPLETED':
    case 'REREADING':
      return max
    case 'READING':
      return randomInt(Math.floor(max * 0.1), Math.floor(max * 0.9))
    case 'ON_HOLD':
      return randomInt(Math.floor(max * 0.2), Math.floor(max * 0.6))
    case 'DROPPED':
      return randomInt(Math.floor(max * 0.05), Math.floor(max * 0.4))
    case 'PLAN_TO_READ':
      return 0
  }
}

function selectManhwasForUser(
  allManhwas: ManhwaData[],
  archetype: Archetype,
): ManhwaData[] {
  const targetSize = Math.min(
    randomInt(archetype.librarySize.min, archetype.librarySize.max),
    allManhwas.length,
  )

  const scored = allManhwas.map((m) => {
    let matchScore = 0
    if (m.genres.some((g) => archetype.preferredGenres.includes(g))) matchScore += 3
    if (m.tropes.some((t) => archetype.preferredTropes.includes(t))) matchScore += 2
    const pop = m.ext_popularity_anilist ?? 0
    matchScore += Math.log10(Math.max(pop, 1)) * 0.5
    if (archetype.name === 'MANHUA_SPECIALIST' && m.type === 'MANHUA') matchScore += 4
    matchScore += randomFloat(0, 2)
    return { manhwa: m, matchScore }
  })

  scored.sort((a, b) => b.matchScore - a.matchScore)

  const topCount = Math.floor(targetSize * 0.7)
  const randCount = targetSize - topCount
  const top = scored.slice(0, Math.min(topCount * 2, scored.length))
  const rest = scored.slice(topCount * 2)

  return [
    ...pickRandom(top.map((s) => s.manhwa), topCount),
    ...pickRandom(rest.map((s) => s.manhwa), randCount),
  ]
}

export async function generateLibraries(
  prisma: PrismaClient,
  users: SeedUser[],
  allManhwas: ManhwaData[],
  config: typeof SEED_CONFIG,
): Promise<number> {
  const allEntries: LibraryEntry[] = []
  const now = new Date()

  for (const user of users) {
    const selected = selectManhwasForUser(allManhwas, user.archetype)

    for (const manhwa of selected) {
      const status = pickStatus(config.STATUS_WEIGHTS)
      const score = scoreForManhwa(manhwa, user.archetype, status)
      const progress = progressForStatus(status, manhwa.chapter_count)
      const is_favorite =
        score !== null &&
        ((score >= 8 && Math.random() < config.FAVORITE_PROBABILITY_HIGH) ||
          (score >= 7 && score < 8 && Math.random() < config.FAVORITE_PROBABILITY_MED))

      allEntries.push({
        userId: user.id,
        manhwaId: manhwa.id,
        status,
        score,
        progress,
        is_favorite,
        created_at: randomDate(user.created_at, now),
      })
    }
  }

  console.log(`  Inserting ${allEntries.length} library entries...`)
  const batches = chunk(allEntries, config.BATCH_SIZE)

  for (let i = 0; i < batches.length; i++) {
    await prisma.userLibrary.createMany({
      data: batches[i]!.map((e) => ({
        user_id: e.userId,
        manhwa_id: e.manhwaId,
        status: e.status,
        score: e.score,
        progress: e.progress,
        is_favorite: e.is_favorite,
        created_at: e.created_at,
      })),
      skipDuplicates: true,
    })
    if ((i + 1) % 20 === 0) console.log(`    Batch ${i + 1}/${batches.length}`)
  }

  return allEntries.length
}
