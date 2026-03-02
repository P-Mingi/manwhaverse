/**
 * One-time script to fix content_rating on existing manhwa
 * based on their linked genres (Hentai → R18, Ecchi → M).
 *
 * Run with: npx tsx scripts/fix-content-ratings.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Mark all Hentai genre manhwa as R18 + NSFW cover
  const hentaiGenre = await prisma.genre.findUnique({ where: { slug: 'hentai' } })
  if (hentaiGenre) {
    const hentaiManhwaIds = await prisma.manhwaGenre.findMany({
      where: { genre_id: hentaiGenre.id },
      select: { manhwa_id: true },
    })
    const ids = hentaiManhwaIds.map((m) => m.manhwa_id)
    const r18Result = await prisma.manhwa.updateMany({
      where: { id: { in: ids } },
      data: { content_rating: 'R18', cover_is_nsfw: true },
    })
    console.log(`[fix] Marked ${r18Result.count} Hentai titles as R18`)
  } else {
    console.log('[fix] No "hentai" genre found')
  }

  // 2. Mark all Ecchi genre manhwa as M (if not already R18)
  const ecchiGenre = await prisma.genre.findUnique({ where: { slug: 'ecchi' } })
  if (ecchiGenre) {
    const ecchiManhwaIds = await prisma.manhwaGenre.findMany({
      where: { genre_id: ecchiGenre.id },
      select: { manhwa_id: true },
    })
    const ids = ecchiManhwaIds.map((m) => m.manhwa_id)
    const mResult = await prisma.manhwa.updateMany({
      where: { id: { in: ids }, content_rating: { not: 'R18' } },
      data: { content_rating: 'M' },
    })
    console.log(`[fix] Marked ${mResult.count} Ecchi titles as M (Mature)`)
  } else {
    console.log('[fix] No "ecchi" genre found')
  }

  // 3. Summary
  const stats = await prisma.$queryRaw<
    Array<{ content_rating: string; count: bigint }>
  >`SELECT content_rating, COUNT(*) as count FROM "Manhwa" GROUP BY content_rating ORDER BY count DESC`
  console.log('\n[fix] Content rating distribution:')
  for (const row of stats) {
    console.log(`  ${row.content_rating}: ${row.count}`)
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
