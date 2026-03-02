import { PrismaClient } from '@prisma/client'
import type { SeedUser } from './generate-users'
import type { LibraryEntry } from './generate-libraries'
import { randomInt, pickRandom, pickOne, randomDate, chunk } from './utils'

const prisma = new PrismaClient()

// ── Korean Reactions ──────────────────────────────────────────

const REACTION_MAP: Record<string, { reactions: string[]; weights: number[] }> = {
  high: { reactions: ['DAEBAK', 'MICHYEO', 'JUKGET', 'GAMDONG'], weights: [0.35, 0.25, 0.2, 0.2] },
  mid: { reactions: ['GAMDONG', 'DAEBAK', 'HEOL'], weights: [0.4, 0.3, 0.3] },
  low: { reactions: ['KINGBAT', 'HEOL', 'MICHYEO'], weights: [0.4, 0.35, 0.25] },
}

function pickReaction(score: number): string {
  const tier = score >= 8 ? 'high' : score >= 6 ? 'mid' : 'low'
  const { reactions, weights } = REACTION_MAP[tier]!
  const r = Math.random()
  let cumulative = 0
  for (let i = 0; i < reactions.length; i++) {
    cumulative += weights[i]!
    if (r <= cumulative) return reactions[i]!
  }
  return reactions[0]!
}

export async function generateReactions(
  users: SeedUser[],
  libraries: LibraryEntry[],
): Promise<number> {
  // Group libraries by user
  const userLibMap = new Map<string, LibraryEntry[]>()
  for (const entry of libraries) {
    if (entry.score === null) continue
    const list = userLibMap.get(entry.userId) ?? []
    list.push(entry)
    userLibMap.set(entry.userId, list)
  }

  const reactions: { user_id: string; manhwa_id: string; reaction: string; created_at: Date }[] = []

  for (const user of users) {
    const entries = userLibMap.get(user.id) ?? []
    for (const entry of entries) {
      // 40% chance for high scores, 20% for others
      const probability = entry.score! >= 8 ? 0.4 : 0.2
      if (Math.random() > probability) continue

      // 1-3 reactions per manhwa
      const count = entry.score! >= 9 ? randomInt(1, 3) : randomInt(1, 2)
      const usedReactions = new Set<string>()

      for (let i = 0; i < count; i++) {
        const reaction = pickReaction(entry.score!)
        if (usedReactions.has(reaction)) continue
        usedReactions.add(reaction)

        reactions.push({
          user_id: user.id,
          manhwa_id: entry.manhwaId,
          reaction,
          created_at: randomDate(entry.created_at, new Date()),
        })
      }
    }
  }

  console.log(`  Inserting ${reactions.length} reactions...`)
  const batches = chunk(reactions, 500)
  for (const batch of batches) {
    await prisma.manhwaReaction.createMany({
      data: batch.map((r) => ({
        user_id: r.user_id,
        manhwa_id: r.manhwa_id,
        reaction: r.reaction as 'HEOL' | 'DAEBAK' | 'GAMDONG' | 'KINGBAT' | 'MICHYEO' | 'JUKGET',
        created_at: r.created_at,
      })),
      skipDuplicates: true,
    })
  }

  // Update denormalized counters on manhwas
  const manhwaReactionCounts = new Map<string, Record<string, number>>()
  for (const r of reactions) {
    const counts = manhwaReactionCounts.get(r.manhwa_id) ?? {}
    const key = `reaction_${r.reaction.toLowerCase()}`
    counts[key] = (counts[key] ?? 0) + 1
    manhwaReactionCounts.set(r.manhwa_id, counts)
  }

  for (const [manhwaId, counts] of manhwaReactionCounts) {
    await prisma.manhwa.update({
      where: { id: manhwaId },
      data: {
        reaction_heol: { increment: counts.reaction_heol ?? 0 },
        reaction_daebak: { increment: counts.reaction_daebak ?? 0 },
        reaction_gamdong: { increment: counts.reaction_gamdong ?? 0 },
        reaction_kingbat: { increment: counts.reaction_kingbat ?? 0 },
        reaction_michyeo: { increment: counts.reaction_michyeo ?? 0 },
        reaction_jukget: { increment: counts.reaction_jukget ?? 0 },
      },
    })
  }

  return reactions.length
}

// ── Character Votes ──────────────────────────────────────────

export async function generateCharacterVotes(
  users: SeedUser[],
  libraries: LibraryEntry[],
): Promise<number> {
  // Load manhwas that have characters
  const manhwasWithChars = await prisma.manhwaCharacter.findMany({
    select: {
      manhwa_id: true,
      character_id: true,
      role: true,
    },
  })

  // Group characters by manhwa
  const charsByManhwa = new Map<string, { character_id: string; role: string }[]>()
  for (const mc of manhwasWithChars) {
    const list = charsByManhwa.get(mc.manhwa_id) ?? []
    list.push({ character_id: mc.character_id, role: mc.role })
    charsByManhwa.set(mc.manhwa_id, list)
  }

  const userLibMap = new Map<string, LibraryEntry[]>()
  for (const entry of libraries) {
    if (entry.score === null || entry.score < 7) continue
    const list = userLibMap.get(entry.userId) ?? []
    list.push(entry)
    userLibMap.set(entry.userId, list)
  }

  const votes: { user_id: string; manhwa_id: string; character_id: string; created_at: Date }[] = []

  for (const user of users) {
    const entries = userLibMap.get(user.id) ?? []
    for (const entry of entries) {
      if (Math.random() > 0.6) continue // 60% vote

      const chars = charsByManhwa.get(entry.manhwaId)
      if (!chars || chars.length === 0) continue

      // Main char gets ~50% of votes
      const mainChars = chars.filter((c) => c.role === 'MAIN')
      const supportChars = chars.filter((c) => c.role !== 'MAIN')

      let chosen: string
      if (mainChars.length > 0 && Math.random() < 0.5) {
        chosen = pickOne(mainChars).character_id
      } else if (supportChars.length > 0) {
        chosen = pickOne(supportChars).character_id
      } else {
        chosen = pickOne(chars).character_id
      }

      votes.push({
        user_id: user.id,
        manhwa_id: entry.manhwaId,
        character_id: chosen,
        created_at: randomDate(entry.created_at, new Date()),
      })
    }
  }

  console.log(`  Inserting ${votes.length} character votes...`)
  const batches = chunk(votes, 500)
  for (const batch of batches) {
    await prisma.characterVote.createMany({
      data: batch.map((v) => ({
        user_id: v.user_id,
        manhwa_id: v.manhwa_id,
        character_id: v.character_id,
        created_at: v.created_at,
      })),
      skipDuplicates: true,
    })
  }

  return votes.length
}

// ── Follows ──────────────────────────────────────────────────

export async function generateFollows(users: SeedUser[]): Promise<number> {
  const follows: { follower_id: string; following_id: string; created_at: Date }[] = []

  // Group users by archetype for cluster-based following
  const byArchetype = new Map<string, SeedUser[]>()
  for (const user of users) {
    const list = byArchetype.get(user.archetype.name) ?? []
    list.push(user)
    byArchetype.set(user.archetype.name, list)
  }

  for (const user of users) {
    const followCount = randomInt(5, 30)

    // 60% from same archetype, 40% random
    const sameArchetype = byArchetype.get(user.archetype.name) ?? []
    const otherUsers = users.filter((u) => u.id !== user.id)

    const sameCount = Math.floor(followCount * 0.6)
    const randomCount = followCount - sameCount

    const targets = new Set<string>()

    // Same archetype follows
    const sameTargets = pickRandom(
      sameArchetype.filter((u) => u.id !== user.id),
      sameCount,
    )
    for (const t of sameTargets) targets.add(t.id)

    // Random follows
    const randomTargets = pickRandom(otherUsers, randomCount)
    for (const t of randomTargets) targets.add(t.id)

    // Critical reviewers get extra followers
    for (const targetId of targets) {
      follows.push({
        follower_id: user.id,
        following_id: targetId,
        created_at: randomDate(user.created_at, new Date()),
      })
    }
  }

  console.log(`  Inserting ${follows.length} follows...`)
  const batches = chunk(follows, 500)
  for (const batch of batches) {
    await prisma.follow.createMany({
      data: batch.map((f) => ({
        follower_id: f.follower_id,
        following_id: f.following_id,
        created_at: f.created_at,
      })),
      skipDuplicates: true,
    })
  }

  return follows.length
}
