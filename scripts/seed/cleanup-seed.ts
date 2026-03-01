/**
 * Remove seed users and all their data.
 *
 * Usage:
 *   npx tsx scripts/seed/cleanup-seed.ts           # Remove ALL seed users
 *   npx tsx scripts/seed/cleanup-seed.ts --partial  # Remove 10% oldest seed users
 */
import { PrismaClient } from '@prisma/client'
import { recalculateAllScores, recalculateTrendingScores } from '../../lib/scoring/recalculate'
import { recalculateManhwaAverages } from './recalculate-averages'

const prisma = new PrismaClient()

async function main() {
  const partial = process.argv.includes('--partial')

  const totalSeed = await prisma.user.count({ where: { is_seed: true } })
  if (totalSeed === 0) {
    console.log('No seed users found. Nothing to clean up.')
    return
  }

  const toRemove = partial ? Math.ceil(totalSeed * 0.1) : totalSeed
  console.log(`🧹 Removing ${toRemove}/${totalSeed} seed users...\n`)

  const seedUsers = await prisma.user.findMany({
    where: { is_seed: true },
    select: { id: true },
    take: toRemove,
    orderBy: { created_at: 'asc' }, // Remove oldest first
  })

  const ids = seedUsers.map((u) => u.id)

  // Delete related data in order (respecting foreign keys)
  console.log('  Deleting notifications...')
  await prisma.notification.deleteMany({ where: { user_id: { in: ids } } })

  console.log('  Deleting activities...')
  await prisma.activity.deleteMany({ where: { user_id: { in: ids } } })

  console.log('  Deleting follows...')
  await prisma.follow.deleteMany({
    where: { OR: [{ follower_id: { in: ids } }, { following_id: { in: ids } }] },
  })

  console.log('  Deleting character votes...')
  await prisma.characterVote.deleteMany({ where: { user_id: { in: ids } } })

  console.log('  Deleting manhwa reactions...')
  await prisma.manhwaReaction.deleteMany({ where: { user_id: { in: ids } } })

  console.log('  Deleting poll votes...')
  await prisma.pollVote.deleteMany({ where: { user_id: { in: ids } } })

  console.log('  Deleting review likes...')
  await prisma.reviewLike.deleteMany({ where: { user_id: { in: ids } } })

  console.log('  Deleting review reactions...')
  await prisma.reviewReaction.deleteMany({ where: { user_id: { in: ids } } })

  console.log('  Deleting reviews...')
  await prisma.review.deleteMany({ where: { user_id: { in: ids } } })

  console.log('  Deleting library entries...')
  await prisma.userLibrary.deleteMany({ where: { user_id: { in: ids } } })

  console.log('  Deleting users...')
  await prisma.user.deleteMany({ where: { id: { in: ids } } })

  console.log(`\n✅ Removed ${ids.length} seed users`)

  // Recalculate scores
  console.log('\nRecalculating manhwa averages...')
  await recalculateManhwaAverages()

  console.log('Recalculating display scores...')
  await recalculateAllScores()
  await recalculateTrendingScores()

  const remaining = await prisma.user.count({ where: { is_seed: true } })
  console.log(`\n🎉 Done. ${remaining} seed users remaining.`)
}

main()
  .catch((err) => {
    console.error('❌ Cleanup failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
