// /scripts/seed/generators/character-votes.ts
import type { PrismaClient } from '@prisma/client'
import type { SeedUser } from './users'
import type { SEED_CONFIG } from '../config'
import { randomDate, chunk, pickOne } from '../utils'

export async function generateCharacterVotes(
  prisma: PrismaClient,
  users: SeedUser[],
  config: typeof SEED_CONFIG,
): Promise<number> {
  const userSet = new Set(users.map((u) => u.id))
  const userMap = new Map(users.map((u) => [u.id, u]))

  // Load high-scoring library entries
  const libs = await prisma.userLibrary.findMany({
    where: {
      user: { is_seed: true },
      score: { gte: 7 },
    },
    select: { user_id: true, manhwa_id: true, created_at: true },
  })

  // Load all manhwa characters grouped by manhwa
  const manhwaChars = await prisma.manhwaCharacter.findMany({
    select: { manhwa_id: true, character_id: true, role: true },
  })
  const charsByManhwa = new Map<string, { character_id: string; role: string }[]>()
  for (const mc of manhwaChars) {
    const list = charsByManhwa.get(mc.manhwa_id) ?? []
    list.push({ character_id: mc.character_id, role: mc.role })
    charsByManhwa.set(mc.manhwa_id, list)
  }

  const votes: {
    user_id: string
    manhwa_id: string
    character_id: string
    created_at: Date
  }[] = []

  for (const lib of libs) {
    if (!userSet.has(lib.user_id)) continue
    if (Math.random() > config.CHAR_VOTE_PROBABILITY) continue

    const chars = charsByManhwa.get(lib.manhwa_id)
    if (!chars || chars.length === 0) continue

    const main = chars.filter((c) => c.role === 'MAIN')
    const support = chars.filter((c) => c.role !== 'MAIN')

    let character_id: string
    if (main.length > 0 && Math.random() < 0.5) {
      character_id = pickOne(main).character_id
    } else if (support.length > 0) {
      character_id = pickOne(support).character_id
    } else {
      character_id = pickOne(chars).character_id
    }

    votes.push({
      user_id: lib.user_id,
      manhwa_id: lib.manhwa_id,
      character_id,
      created_at: randomDate(lib.created_at, new Date()),
    })
  }

  console.log(`  Inserting ${votes.length} character votes...`)
  const batches = chunk(votes, config.BATCH_SIZE)
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
