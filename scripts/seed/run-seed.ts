// /scripts/seed/run-seed.ts
// Usage: npx tsx scripts/seed/run-seed.ts
// Env vars: SEED_COUNT (default 1000), FORCE_SEED=1 (skip existing check)

import { PrismaClient } from '@prisma/client'
import { SEED_CONFIG } from './config'
import { ARCHETYPES } from './archetypes'
import { generateUsers } from './generators/users'
import { generateLibraries, type ManhwaData } from './generators/libraries'
import { generateReviews } from './generators/reviews'
import { generateReactions } from './generators/reactions'
import { generateCharacterVotes } from './generators/character-votes'
import { generateFollows } from './generators/follows'
import { recalculateManhwaAverages } from './generators/recalculate'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 ManhwaVerse Community Seed\n')

  const totalUsers = parseInt(process.env['SEED_COUNT'] ?? '1000', 10)
  const force = process.env['FORCE_SEED'] === '1'

  // Check for existing seed users
  const existing = await prisma.user.count({ where: { is_seed: true } })
  if (existing > 0 && !force) {
    console.log(`❌ Found ${existing} existing seed users.`)
    console.log('   Run with FORCE_SEED=1 to bypass, or run cleanup-seed.ts first.')
    process.exit(1)
  }
  if (existing > 0 && force) {
    console.log(`⚠ FORCE_SEED=1 — ${existing} existing seed users will remain\n`)
  }

  // Verify manhwas exist
  const manhwaCount = await prisma.manhwa.count({ where: { is_published: true } })
  if (manhwaCount === 0) {
    console.error('❌ No published manhwas in database. Run AniList enrichment first.')
    process.exit(1)
  }
  console.log(`📚 ${manhwaCount} manhwas found\n`)

  // Load manhwa data
  const allManhwas = await prisma.manhwa.findMany({
    where: { is_published: true, deleted_at: null },
    select: {
      id: true,
      slug: true,
      type: true,
      status: true,
      chapter_count: true,
      ext_score_anilist: true,
      display_popularity: true,
      genre_links: { include: { genre: { select: { name_en: true } } } },
      trope_links: { include: { trope: { select: { name: true } } } },
    },
    orderBy: { display_popularity: 'desc' },
  })

  const manhwasData: ManhwaData[] = allManhwas.map((m) => ({
    id: m.id,
    slug: m.slug,
    type: m.type,
    status: m.status,
    chapter_count: m.chapter_count,
    ext_score_anilist: m.ext_score_anilist,
    ext_popularity_anilist: m.display_popularity,
    genres: m.genre_links.map((gl) => gl.genre.name_en),
    tropes: m.trope_links.map((tl) => tl.trope.name),
  }))

  // Adjust archetype counts to match totalUsers
  const scaledArchetypes = ARCHETYPES.map((arch) => ({
    ...arch,
    count: Math.round(arch.weight * totalUsers),
  }))
  // Fix rounding drift
  const total = scaledArchetypes.reduce((s, a) => s + a.count, 0)
  if (total < totalUsers) scaledArchetypes[0]!.count += totalUsers - total

  const startTime = Date.now()
  const config = { ...SEED_CONFIG, TOTAL_USERS: totalUsers }

  // ──────── STEP 1: Create users ────────
  console.log(`1/7 👤 Creating ${totalUsers} users...`)
  const users = await generateUsers(prisma, totalUsers, scaledArchetypes)
  console.log(`   ✅ ${users.length} users created\n`)

  if (users.length === 0) {
    console.error('❌ No users created. Aborting.')
    process.exit(1)
  }

  // ──────── STEP 2: Generate libraries ────────
  console.log('2/7 📚 Generating libraries...')
  const libCount = await generateLibraries(prisma, users, manhwasData, config)
  console.log(`   ✅ ${libCount} library entries\n`)

  // ──────── STEP 3: Recalculate averages ────────
  console.log('3/7 📊 Recalculating manhwa averages...')
  await recalculateManhwaAverages(prisma)
  console.log('   ✅ Done\n')

  // ──────── STEP 4: Generate reviews ────────
  console.log('4/7 📝 Generating reviews...')
  const reviewCount = await generateReviews(prisma, users, manhwasData, config)
  console.log(`   ✅ ${reviewCount} reviews\n`)

  // ──────── STEP 5: Generate reactions ────────
  console.log('5/7 🇰🇷 Generating reactions...')
  const reactionCount = await generateReactions(prisma, users, config)
  console.log(`   ✅ ${reactionCount} reactions\n`)

  // ──────── STEP 6: Character votes + follows ────────
  console.log('6/7 🏆 Generating votes and follows...')
  const voteCount = await generateCharacterVotes(prisma, users, config)
  const followCount = await generateFollows(prisma, users, config)
  console.log(`   ✅ ${voteCount} character votes, ${followCount} follows\n`)

  // ──────── STEP 7: Recalculate display scores ────────
  console.log('7/7 🔄 Recalculating display scores...')
  try {
    const { recalculateAllScores, recalculateTrendingScores } = await import(
      '../../lib/scoring/recalculate'
    )
    await recalculateAllScores()
    await recalculateTrendingScores()
    console.log('   ✅ Done\n')
  } catch (e) {
    console.warn('   ⚠ Could not import scoring engine:', e)
    console.warn('   Run recalculate manually if needed.\n')
  }

  // ──────── FINAL STATS ────────
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  const matureCount = await prisma.manhwa.count({ where: { display_score_phase: 'MATURE' } })
  const growingCount = await prisma.manhwa.count({ where: { display_score_phase: 'GROWING' } })
  const totalLibs = await prisma.userLibrary.count({ where: { user: { is_seed: true } } })
  const totalReviews = await prisma.review.count({ where: { user: { is_seed: true } } })

  console.log('═══════════════════════════════════════')
  console.log('🎉 SEED COMPLETE!')
  console.log('═══════════════════════════════════════')
  console.log(`⏱  Time: ${elapsed}s`)
  console.log(`👤 Users: ${users.length}`)
  console.log(`📚 Library entries: ${totalLibs}`)
  console.log(`⭐ Reviews: ${totalReviews}`)
  console.log(`🏆 Manhwas MATURE (≥50 votes): ${matureCount}`)
  console.log(`📈 Manhwas GROWING (10-49 votes): ${growingCount}`)
  console.log('═══════════════════════════════════════')

  if (matureCount < 100) {
    console.warn(`\n⚠ Only ${matureCount} MATURE manhwas (target: 100+).`)
    console.warn('  Consider: SEED_COUNT=2000 npx tsx scripts/seed/run-seed.ts')
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
