/**
 * Seed publishers from ReadLink platform data.
 * Maps known platform names → Publisher records, then links manhwas.
 *
 * Run: npx tsx lib/ingestion/seed-publishers.ts
 */

import { prisma } from '../db/client'

// Map ReadLink.platform → publisher seed data
const PLATFORM_TO_PUBLISHER: Record<string, { slug: string; name: string; country: string; logo_url?: string; description?: string }> = {
  'WEBTOON':        { slug: 'naver-webtoon',  name: 'Naver Webtoon',  country: 'KR', logo_url: 'https://logo.clearbit.com/webtoons.com',       description: 'The world\'s largest digital comics platform, home to thousands of manhwa series.' },
  'Naver Webtoon':  { slug: 'naver-webtoon',  name: 'Naver Webtoon',  country: 'KR', logo_url: 'https://logo.clearbit.com/webtoons.com' },
  'KakaoPage':      { slug: 'kakao-page',      name: 'Kakao Page',     country: 'KR', logo_url: 'https://logo.clearbit.com/page.kakao.com',      description: 'Kakao\'s premium content platform featuring popular manhwa and webnovels.' },
  'Kakao Webtoon':  { slug: 'kakao-webtoon',  name: 'Kakao Webtoon',  country: 'KR', logo_url: 'https://logo.clearbit.com/webtoon.kakao.com',  description: 'Kakao\'s dedicated webtoon platform, known for romance and fantasy series.' },
  'Lezhin':         { slug: 'lezhin-comics',  name: 'Lezhin Comics',  country: 'KR', logo_url: 'https://logo.clearbit.com/lezhin.com',          description: 'Premium manhwa platform specializing in mature and romance content.' },
  'Tapas':          { slug: 'tapas',           name: 'Tapas',          country: 'US', logo_url: 'https://logo.clearbit.com/tapas.io',            description: 'English-language platform publishing original and translated manhwa.' },
  'Tappytoon':      { slug: 'tappytoon',       name: 'Tappytoon',      country: 'US', logo_url: 'https://logo.clearbit.com/tappytoon.com',      description: 'English platform for officially licensed Korean manhwa and webtoons.' },
}

async function main() {
  // 1. Upsert all publisher records
  const publisherMap = new Map<string, string>() // slug → id

  for (const pub of Object.values(PLATFORM_TO_PUBLISHER)) {
    const record = await prisma.publisher.upsert({
      where: { slug: pub.slug },
      update: {},
      create: {
        slug:        pub.slug,
        name:        pub.name,
        country:     pub.country,
        logo_url:    pub.logo_url ?? null,
        description: pub.description ?? null,
      },
    })
    publisherMap.set(pub.slug, record.id)
    console.log(`✓ Publisher: ${record.name} (${record.id})`)
  }

  // 2. Find all manhwas that have a ReadLink for a known platform
  const readLinks = await prisma.readLink.findMany({
    where: { platform: { in: Object.keys(PLATFORM_TO_PUBLISHER) } },
    select: { manhwa_id: true, platform: true },
  })

  console.log(`\nFound ${readLinks.length} read links to process`)

  // Build deduplicated pairs in memory
  const seen = new Set<string>()
  const pairs: { manhwa_id: string; publisher_id: string }[] = []

  for (const link of readLinks) {
    const pubData = PLATFORM_TO_PUBLISHER[link.platform]
    if (!pubData) continue
    const publisherId = publisherMap.get(pubData.slug)
    if (!publisherId) continue
    const key = `${link.manhwa_id}:${publisherId}`
    if (seen.has(key)) continue
    seen.add(key)
    pairs.push({ manhwa_id: link.manhwa_id, publisher_id: publisherId })
  }

  // Bulk insert (skipDuplicates handles re-runs safely)
  const result = await prisma.manhwaPublisher.createMany({
    data: pairs,
    skipDuplicates: true,
  })
  const linked = result.count

  console.log(`✓ Linked ${linked} manhwa–publisher pairs`)

  // 3. Summary
  const counts = await prisma.publisher.findMany({
    include: { _count: { select: { manhwa_links: true } } },
    orderBy: { name: 'asc' },
  })

  console.log('\n=== Publisher summary ===')
  for (const p of counts) {
    console.log(`  ${p.name}: ${p._count.manhwa_links} manhwa(s)`)
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
