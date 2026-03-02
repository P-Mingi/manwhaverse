import { enrichFromAniList } from './anilist-enrich'

async function main() {
  console.log('=== ManwhaBox AniList Enrichment ===\n')
  console.log(`Started at: ${new Date().toISOString()}\n`)

  // Parse optional --limit flag (e.g. --limit=50)
  const limitArg = process.argv.find(a => a.startsWith('--limit='))
  const limit = limitArg ? parseInt(limitArg.split('=')[1]!, 10) : undefined

  if (limit) console.log(`[config] Limit: ${limit} titles\n`)

  const startTime = Date.now()

  const result = await enrichFromAniList({ limit, skipEnriched: true })

  const duration = Math.round((Date.now() - startTime) / 1000)

  console.log(`\n=== Enrichment Complete ===`)
  console.log(`Duration: ${duration}s`)
  console.log(`Enriched: ${result.enriched}`)
  console.log(`Characters: ${result.totalCharacters}`)
  console.log(`Relations: ${result.totalRelations}`)
  console.log(`Errors: ${result.errors}`)

  process.exit(0)
}

main().catch((err) => {
  console.error('Enrichment failed:', err)
  process.exit(1)
})
