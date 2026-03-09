/**
 * News pipeline orchestrator.
 *
 * Run: npx tsx lib/ingestion/run-news-pipeline.ts
 *
 * 1. Scrapes RSS feeds (ANN, Crunchyroll)
 * 2. Filters manhwa-relevant items
 * 3. Rewrites each with Claude AI (EN + FR)
 * 4. Saves as DRAFT articles for admin review
 *
 * Requires: ANTHROPIC_API_KEY in .env
 */

import { scrapeNewsFeeds } from './scrape-news'
import { generateAndSaveNewsArticle } from './generate-news'
import { prisma } from '../db/client'

const DELAY_MS = 1500 // Rate limit between Claude calls

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  console.log('=== ManhwaVerse News Pipeline ===\n')

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('✗ ANTHROPIC_API_KEY is not set in .env')
    process.exit(1)
  }

  // Step 1: Scrape
  console.log('📡 Scraping RSS feeds...')
  const items = await scrapeNewsFeeds()
  console.log(`\n→ ${items.length} manhwa-relevant items found\n`)

  if (!items.length) {
    console.log('No new items to process.')
    await prisma.$disconnect()
    return
  }

  // Step 2: Generate + save
  console.log('🤖 Generating articles with Claude...\n')
  let created = 0
  let duplicates = 0
  let failed = 0

  for (const [i, item] of items.entries()) {
    console.log(`[${i + 1}/${items.length}] ${item.title.slice(0, 60)}`)
    const result = await generateAndSaveNewsArticle(item)
    if (result === 'created') {
      console.log('  ✓ Saved as DRAFT')
      created++
    } else if (result === 'duplicate') {
      console.log('  → Already exists, skipping')
      duplicates++
    } else {
      console.log('  ✗ Failed to generate')
      failed++
    }
    if (i < items.length - 1) await sleep(DELAY_MS)
  }

  console.log('\n=== Summary ===')
  console.log(`  Created:    ${created} draft articles`)
  console.log(`  Duplicates: ${duplicates} skipped`)
  console.log(`  Failed:     ${failed}`)
  console.log('\n✅ Done. Visit /admin/news to review and publish.')

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
