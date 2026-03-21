/**
 * Partial seed data cleanup.
 * - Keeps 200 seed users (deletes the rest and all their data)
 * - From the remaining 200, keeps only 20 long reviews + 100 micro reviews
 *
 * Usage:
 *   npx tsx scripts/seed/partial-cleanup.ts
 */
import { PrismaClient } from '@prisma/client'
import { recalculateAllScores, recalculateTrendingScores } from '../../lib/scoring/recalculate'
import { recalculateManhwaAverages } from './recalculate-averages'

const prisma = new PrismaClient()

const KEEP_USERS = 200
const KEEP_LONG_REVIEWS = 20
const KEEP_MICRO_REVIEWS = 100

async function main() {
  // ── Step 1: Delete excess seed users ──────────────────────────────────────

  const allSeedUsers = await prisma.user.findMany({
    where: { is_seed: true },
    select: { id: true },
    orderBy: { created_at: 'asc' }, // oldest first → delete oldest
  })

  const totalSeed = allSeedUsers.length
  if (totalSeed === 0) {
    console.log('No seed users found. Nothing to clean up.')
    return
  }

  const toDeleteUsers = allSeedUsers.slice(0, Math.max(0, totalSeed - KEEP_USERS))
  const deleteUserIds = toDeleteUsers.map((u) => u.id)

  console.log(`\n🧹 Seed users: ${totalSeed} total — deleting ${deleteUserIds.length}, keeping ${Math.min(totalSeed, KEEP_USERS)}\n`)

  if (deleteUserIds.length > 0) {
    console.log('  Deleting notifications...')
    await prisma.notification.deleteMany({ where: { user_id: { in: deleteUserIds } } })

    console.log('  Deleting activities...')
    await prisma.activity.deleteMany({ where: { user_id: { in: deleteUserIds } } })

    console.log('  Deleting follows...')
    await prisma.follow.deleteMany({
      where: { OR: [{ follower_id: { in: deleteUserIds } }, { following_id: { in: deleteUserIds } }] },
    })

    console.log('  Deleting character votes...')
    await prisma.characterVote.deleteMany({ where: { user_id: { in: deleteUserIds } } })

    console.log('  Deleting manhwa reactions...')
    await prisma.manhwaReaction.deleteMany({ where: { user_id: { in: deleteUserIds } } })

    console.log('  Deleting poll votes...')
    await prisma.pollVote.deleteMany({ where: { user_id: { in: deleteUserIds } } })

    // Collect review IDs before deleting, to also clean up reactions FROM others on these reviews
    const reviewsToDelete = await prisma.review.findMany({
      where: { user_id: { in: deleteUserIds } },
      select: { id: true },
    })
    const reviewIdsToDelete = reviewsToDelete.map((r) => r.id)

    console.log('  Deleting review likes...')
    await prisma.reviewLike.deleteMany({
      where: { OR: [{ user_id: { in: deleteUserIds } }, { review_id: { in: reviewIdsToDelete } }] },
    })

    console.log('  Deleting review reactions...')
    await prisma.reviewReaction.deleteMany({
      where: { OR: [{ user_id: { in: deleteUserIds } }, { review_id: { in: reviewIdsToDelete } }] },
    })

    console.log('  Deleting reviews...')
    await prisma.review.deleteMany({ where: { user_id: { in: deleteUserIds } } })

    console.log('  Deleting library entries...')
    await prisma.userLibrary.deleteMany({ where: { user_id: { in: deleteUserIds } } })

    console.log('  Deleting users...')
    await prisma.user.deleteMany({ where: { id: { in: deleteUserIds } } })

    console.log(`\n✅ Deleted ${deleteUserIds.length} seed users`)
  }

  // ── Step 2: Trim reviews from remaining seed users ─────────────────────────

  const remainingSeedUsers = await prisma.user.findMany({
    where: { is_seed: true },
    select: { id: true },
  })
  const remainingIds = remainingSeedUsers.map((u) => u.id)

  console.log(`\n📝 Trimming reviews from ${remainingIds.length} remaining seed users...`)

  // Long reviews (is_micro: false)
  const longReviews = await prisma.review.findMany({
    where: { user_id: { in: remainingIds }, is_micro: false },
    select: { id: true },
    orderBy: { created_at: 'desc' }, // keep newest
  })
  const longToDelete = longReviews.slice(KEEP_LONG_REVIEWS).map((r) => r.id)
  console.log(`  Long reviews: ${longReviews.length} total — deleting ${longToDelete.length}, keeping ${Math.min(longReviews.length, KEEP_LONG_REVIEWS)}`)

  if (longToDelete.length > 0) {
    await prisma.reviewLike.deleteMany({ where: { review_id: { in: longToDelete } } })
    await prisma.reviewReaction.deleteMany({ where: { review_id: { in: longToDelete } } })
    await prisma.review.deleteMany({ where: { id: { in: longToDelete } } })
  }

  // Micro reviews (is_micro: true)
  const microReviews = await prisma.review.findMany({
    where: { user_id: { in: remainingIds }, is_micro: true },
    select: { id: true },
    orderBy: { created_at: 'desc' }, // keep newest
  })
  const microToDelete = microReviews.slice(KEEP_MICRO_REVIEWS).map((r) => r.id)
  console.log(`  Micro reviews: ${microReviews.length} total — deleting ${microToDelete.length}, keeping ${Math.min(microReviews.length, KEEP_MICRO_REVIEWS)}`)

  if (microToDelete.length > 0) {
    await prisma.reviewLike.deleteMany({ where: { review_id: { in: microToDelete } } })
    await prisma.reviewReaction.deleteMany({ where: { review_id: { in: microToDelete } } })
    await prisma.review.deleteMany({ where: { id: { in: microToDelete } } })
  }

  console.log('\n✅ Reviews trimmed')

  // ── Step 3: Recalculate scores ─────────────────────────────────────────────

  console.log('\nRecalculating manhwa averages...')
  await recalculateManhwaAverages()

  console.log('Recalculating display scores...')
  await recalculateAllScores()
  await recalculateTrendingScores()

  const finalCount = await prisma.user.count({ where: { is_seed: true } })
  console.log(`\n🎉 Done. ${finalCount} seed users remaining.`)
}

main()
  .catch((err) => {
    console.error('❌ Cleanup failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
