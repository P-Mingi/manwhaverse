/**
 * Full AniList import — fetches ALL manhwa/manhua across all pages.
 * Checkpoint-safe: saves progress to scripts/bootstrap-checkpoint.json after each page.
 * Resume by simply re-running the script — it picks up where it left off.
 *
 * Usage:
 *   npx tsx lib/ingestion/run-full-bootstrap.ts
 *
 * After completion, run enrichment:
 *   npx tsx lib/ingestion/run-enrich.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { bootstrapFromAniList } from './anilist'

const CHECKPOINT_FILE = path.join(process.cwd(), 'scripts', 'bootstrap-checkpoint.json')
const COUNTRIES = ['KR', 'CN', 'TW']

type Checkpoint = Record<string, number> // country → last completed page

function readCheckpoint(): Checkpoint {
  try {
    const raw = fs.readFileSync(CHECKPOINT_FILE, 'utf-8')
    return JSON.parse(raw) as Checkpoint
  } catch {
    return {}
  }
}

function writeCheckpoint(checkpoint: Checkpoint): void {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2))
}

async function main() {
  console.log('=== ManhwaVerse Full Bootstrap Import ===\n')
  console.log(`Started at: ${new Date().toISOString()}`)

  const checkpoint = readCheckpoint()
  const startPages: Record<string, number> = {}

  for (const country of COUNTRIES) {
    const lastPage = checkpoint[country] ?? 0
    startPages[country] = lastPage > 0 ? lastPage + 1 : 1
    if (lastPage > 0) {
      console.log(`[resume] ${country}: resuming from page ${startPages[country]}`)
    }
  }

  const startTime = Date.now()
  let pageCount = 0
  let pageTimes: number[] = []
  let lastPageTime = Date.now()

  const result = await bootstrapFromAniList({
    countries: COUNTRIES,
    startPages,
    onPageComplete: (country, page) => {
      // Update checkpoint immediately
      checkpoint[country] = page
      writeCheckpoint(checkpoint)

      // ETA calculation every 10 pages
      pageCount++
      const now = Date.now()
      pageTimes.push(now - lastPageTime)
      lastPageTime = now

      if (pageCount % 10 === 0) {
        const avgMs = pageTimes.slice(-20).reduce((a, b) => a + b, 0) / Math.min(pageTimes.length, 20)
        // We don't know exact remaining pages, but log progress
        const elapsed = Math.round((now - startTime) / 1000)
        console.log(`[checkpoint] Saved — ${pageCount} pages done — ${elapsed}s elapsed — avg ${Math.round(avgMs / 1000)}s/page`)
      }
    },
  })

  // Clean up checkpoint on success
  try {
    fs.unlinkSync(CHECKPOINT_FILE)
    console.log('\n[checkpoint] Cleared (import completed cleanly)')
  } catch {
    // already gone
  }

  const duration = Math.round((Date.now() - startTime) / 1000)
  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration % 3600) / 60)
  const seconds = duration % 60

  console.log(`\n=== Full Import Complete ===`)
  console.log(`Duration: ${hours}h ${minutes}m ${seconds}s`)
  console.log(`Created:  ${result.created}`)
  console.log(`Updated:  ${result.updated}`)
  console.log(`Errors:   ${result.errors}`)
  console.log(`Total:    ${result.total}`)
  console.log(`\nNext step: npx tsx lib/ingestion/run-enrich.ts`)

  process.exit(0)
}

main().catch((err) => {
  console.error('Full bootstrap failed:', err)
  console.log('Checkpoint saved — re-run to resume from last completed page.')
  process.exit(1)
})
