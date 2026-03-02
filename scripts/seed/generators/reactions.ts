// /scripts/seed/generators/reactions.ts
import type { PrismaClient } from '@prisma/client'
import type { SeedUser } from './users'
import type { SEED_CONFIG } from '../config'
import { REACTION_TIERS, getReactionTier, type ReactionType } from '../templates/reactions'
import { randomDate, chunk, weightedRandom } from '../utils'

export async function generateReactions(
  prisma: PrismaClient,
  users: SeedUser[],
  config: typeof SEED_CONFIG,
): Promise<number> {
  const userSet = new Set(users.map((u) => u.id))
  const userMap = new Map(users.map((u) => [u.id, u]))

  // Load scored library entries for seed users
  const libs = await prisma.userLibrary.findMany({
    where: {
      user: { is_seed: true },
      score: { not: null },
      status: { in: ['COMPLETED', 'READING', 'REREADING'] },
    },
    select: { user_id: true, manhwa_id: true, score: true, created_at: true },
  })

  const reactions: {
    user_id: string
    manhwa_id: string
    reaction: ReactionType
    created_at: Date
  }[] = []

  const seen = new Set<string>()

  for (const lib of libs) {
    if (!userSet.has(lib.user_id) || lib.score === null) continue
    if (Math.random() > config.REACTION_PROBABILITY) continue

    const user = userMap.get(lib.user_id)!
    const tier = getReactionTier(lib.score)
    const tierData = REACTION_TIERS[tier]

    // 1-2 reactions per manhwa
    const count = lib.score >= 9 ? (Math.random() < 0.4 ? 2 : 1) : 1
    const used = new Set<ReactionType>()

    for (let i = 0; i < count; i++) {
      const reaction = weightedRandom(tierData.reactions, tierData.weights)
      if (used.has(reaction)) continue
      used.add(reaction)

      const key = `${lib.user_id}:${lib.manhwa_id}:${reaction}`
      if (seen.has(key)) continue
      seen.add(key)

      reactions.push({
        user_id: lib.user_id,
        manhwa_id: lib.manhwa_id,
        reaction,
        created_at: randomDate(lib.created_at, new Date()),
      })
    }
  }

  console.log(`  Inserting ${reactions.length} reactions...`)
  const batches = chunk(reactions, config.BATCH_SIZE)
  for (const batch of batches) {
    await prisma.manhwaReaction.createMany({
      data: batch.map((r) => ({
        user_id: r.user_id,
        manhwa_id: r.manhwa_id,
        reaction: r.reaction,
        created_at: r.created_at,
      })),
      skipDuplicates: true,
    })
  }

  // Update denormalized counters
  const manhwaCounts = new Map<string, Record<string, number>>()
  for (const r of reactions) {
    const counts = manhwaCounts.get(r.manhwa_id) ?? {}
    const key = `reaction_${r.reaction.toLowerCase()}`
    counts[key] = (counts[key] ?? 0) + 1
    manhwaCounts.set(r.manhwa_id, counts)
  }

  for (const [manhwaId, counts] of Array.from(manhwaCounts)) {
    await prisma.manhwa.update({
      where: { id: manhwaId },
      data: {
        reaction_heol: { increment: counts['reaction_heol'] ?? 0 },
        reaction_daebak: { increment: counts['reaction_daebak'] ?? 0 },
        reaction_gamdong: { increment: counts['reaction_gamdong'] ?? 0 },
        reaction_kingbat: { increment: counts['reaction_kingbat'] ?? 0 },
        reaction_michyeo: { increment: counts['reaction_michyeo'] ?? 0 },
        reaction_jukget: { increment: counts['reaction_jukget'] ?? 0 },
      },
    })
  }

  return reactions.length
}
