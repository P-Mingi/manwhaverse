// /scripts/seed/generators/follows.ts
import type { PrismaClient } from '@prisma/client'
import type { SeedUser } from './users'
import type { SEED_CONFIG } from '../config'
import { randomDate, chunk, randomInt, pickRandom } from '../utils'

export async function generateFollows(
  prisma: PrismaClient,
  users: SeedUser[],
  config: typeof SEED_CONFIG,
): Promise<number> {
  // Group users by archetype for cluster-based following
  const byArchetype = new Map<string, SeedUser[]>()
  for (const user of users) {
    const list = byArchetype.get(user.archetype.name) ?? []
    list.push(user)
    byArchetype.set(user.archetype.name, list)
  }

  const follows: { follower_id: string; following_id: string; created_at: Date }[] = []
  const seen = new Set<string>()

  for (const user of users) {
    const followCount = randomInt(config.FOLLOWS_MIN, config.FOLLOWS_MAX)
    const sameArchetype = (byArchetype.get(user.archetype.name) ?? []).filter(
      (u) => u.id !== user.id,
    )
    const others = users.filter((u) => u.id !== user.id)

    const sameCount = Math.floor(followCount * 0.6)
    const randCount = followCount - sameCount

    const targets = new Set<string>()
    for (const t of pickRandom(sameArchetype, sameCount)) targets.add(t.id)
    for (const t of pickRandom(others, randCount)) targets.add(t.id)

    for (const targetId of Array.from(targets)) {
      const key = `${user.id}:${targetId}`
      if (seen.has(key)) continue
      seen.add(key)
      follows.push({
        follower_id: user.id,
        following_id: targetId,
        created_at: randomDate(user.created_at, new Date()),
      })
    }
  }

  console.log(`  Inserting ${follows.length} follows...`)
  const batches = chunk(follows, config.BATCH_SIZE)
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
