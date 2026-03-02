import { PrismaClient } from '@prisma/client'
import type { SeedUser } from './generate-users'
import type { Archetype } from './archetypes'
import { randomInt, randomFloat, gaussianRandom, pickRandom, randomDate, chunk } from './utils'

const prisma = new PrismaClient()

const STATUS_DISTRIBUTION = {
  COMPLETED: 0.35,
  READING: 0.25,
  PLAN_TO_READ: 0.25,
  ON_HOLD: 0.08,
  DROPPED: 0.05,
  REREADING: 0.02,
} as const

type ReadingStatus = keyof typeof STATUS_DISTRIBUTION

function pickStatus(): ReadingStatus {
  const r = Math.random()
  let cumulative = 0
  for (const [status, weight] of Object.entries(STATUS_DISTRIBUTION)) {
    cumulative += weight
    if (r <= cumulative) return status as ReadingStatus
  }
  return 'COMPLETED'
}

interface ManhwaData {
  id: string
  slug: string
  type: string
  chapter_count: number | null
  ext_score_anilist: number | null
  ext_score_anilist_count: number | null
  genres: string[]
  tropes: string[]
}

export interface LibraryEntry {
  userId: string
  manhwaId: string
  status: ReadingStatus
  score: number | null
  progress: number
  is_favorite: boolean
  created_at: Date
}

/**
 * Load all published manhwas with their genres and tropes.
 */
async function loadManhwas(): Promise<ManhwaData[]> {
  const manhwas = await prisma.manhwa.findMany({
    where: { is_published: true, deleted_at: null },
    select: {
      id: true,
      slug: true,
      type: true,
      chapter_count: true,
      ext_score_anilist: true,
      ext_score_anilist_count: true,
      genre_links: { include: { genre: { select: { name_en: true } } } },
      trope_links: { include: { trope: { select: { name: true } } } },
    },
    orderBy: { ext_score_anilist_count: 'desc' },
  })

  return manhwas.map((m) => ({
    id: m.id,
    slug: m.slug,
    type: m.type,
    chapter_count: m.chapter_count,
    ext_score_anilist: m.ext_score_anilist,
    ext_score_anilist_count: m.ext_score_anilist_count,
    genres: m.genre_links.map((gl) => gl.genre.name_en),
    tropes: m.trope_links.map((tl) => tl.trope.name),
  }))
}

/**
 * Select manhwas for a user's library based on archetype preferences.
 */
function selectManhwasForUser(
  allManhwas: ManhwaData[],
  archetype: Archetype,
): ManhwaData[] {
  const librarySize = randomInt(archetype.librarySize.min, archetype.librarySize.max)
  const targetSize = Math.min(librarySize, allManhwas.length)

  // Score each manhwa based on archetype match
  const scored = allManhwas.map((m) => {
    let matchScore = 0

    // Genre match
    const genreMatch = m.genres.some((g) => archetype.preferredGenres.includes(g))
    if (genreMatch) matchScore += 3

    // Trope match
    const tropeMatch = m.tropes.some((t) => archetype.preferredTropes.includes(t))
    if (tropeMatch) matchScore += 2

    // Popularity bonus (more popular = more likely to be in any library)
    const popScore = m.ext_score_anilist_count ?? 0
    matchScore += Math.log10(Math.max(popScore, 1)) * 0.5

    // Manhua specialist bonus
    if (archetype.name === 'MANHUA_SPECIALIST' && m.type === 'MANHUA') {
      matchScore += 4
    }

    // Add randomness
    matchScore += randomFloat(0, 2)

    return { manhwa: m, matchScore }
  })

  // Sort by match score and pick top N with some randomness
  scored.sort((a, b) => b.matchScore - a.matchScore)

  // Take 70% from top matches, 30% random from the rest
  const topCount = Math.floor(targetSize * 0.7)
  const randomCount = targetSize - topCount
  const top = scored.slice(0, Math.min(topCount * 2, scored.length))
  const rest = scored.slice(topCount * 2)

  const selected = [
    ...pickRandom(top.map((s) => s.manhwa), topCount),
    ...pickRandom(rest.map((s) => s.manhwa), randomCount),
  ]

  return selected
}

/**
 * Generate a realistic score based on archetype and manhwa.
 */
function generateScore(
  manhwa: ManhwaData,
  archetype: Archetype,
  status: ReadingStatus,
): number | null {
  // Only COMPLETED and some READING users give scores
  if (status === 'PLAN_TO_READ') return null
  if (status === 'READING' && Math.random() > 0.3) return null
  if (status === 'ON_HOLD' && Math.random() > 0.4) return null
  if (status === 'DROPPED' && Math.random() > 0.5) return null
  if (status === 'COMPLETED' && Math.random() > 0.8) return null // 80% of COMPLETED rate

  const anilistScore = manhwa.ext_score_anilist
  const baseScore = anilistScore ?? archetype.avgScore

  // Adjustment by genre/trope match
  const genreMatch = manhwa.genres.some((g) => archetype.preferredGenres.includes(g))
  const tropeMatch = manhwa.tropes.some((t) => archetype.preferredTropes.includes(t))

  let adjustment = 0
  if (genreMatch && tropeMatch) adjustment = randomFloat(0.3, 0.8)
  else if (genreMatch || tropeMatch) adjustment = randomFloat(0, 0.4)
  else adjustment = randomFloat(-0.5, 0.1)

  // DROPPED titles get lower scores
  if (status === 'DROPPED') adjustment -= randomFloat(1.5, 3.0)

  // Personal variance
  const personalVariance = gaussianRandom(0, archetype.scoreVariance * 0.5)

  let score = baseScore + adjustment + personalVariance

  // Clamp 1-10
  score = Math.max(1, Math.min(10, score))

  // Round to nearest 0.5
  score = Math.round(score * 2) / 2

  return score
}

/**
 * Generate progress based on status and chapter count.
 */
function generateProgress(status: ReadingStatus, chapterCount: number | null): number {
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

export async function generateLibraries(
  users: SeedUser[],
): Promise<LibraryEntry[]> {
  const allManhwas = await loadManhwas()
  console.log(`  Loaded ${allManhwas.length} manhwas for library generation`)

  const allEntries: LibraryEntry[] = []

  for (const user of users) {
    const selectedManhwas = selectManhwasForUser(allManhwas, user.archetype)

    for (const manhwa of selectedManhwas) {
      const status = pickStatus()
      const score = generateScore(manhwa, user.archetype, status)
      const progress = generateProgress(status, manhwa.chapter_count)
      const is_favorite = score !== null && score >= 8 && Math.random() < 0.2

      allEntries.push({
        userId: user.id,
        manhwaId: manhwa.id,
        status,
        score,
        progress,
        is_favorite,
        created_at: randomDate(user.created_at, new Date()),
      })
    }
  }

  // Batch insert
  console.log(`  Inserting ${allEntries.length} library entries...`)
  const batches = chunk(allEntries, 500)

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
    if ((i + 1) % 20 === 0) {
      console.log(`    Batch ${i + 1}/${batches.length}`)
    }
  }

  return allEntries
}
