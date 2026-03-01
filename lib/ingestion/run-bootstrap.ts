import { bootstrapFromAniList } from './anilist'

async function main() {
  console.log('=== ManhwaVerse Bootstrap Import ===\n')
  console.log(`Started at: ${new Date().toISOString()}\n`)

  const startTime = Date.now()

  const result = await bootstrapFromAniList({
    maxPages: 40, // ~2000 KR titles + ~2000 CN titles
    countries: ['KR', 'CN'],
  })

  const duration = Math.round((Date.now() - startTime) / 1000)

  console.log(`\n=== Import Complete ===`)
  console.log(`Duration: ${duration}s`)
  console.log(`Created: ${result.created}`)
  console.log(`Updated: ${result.updated}`)
  console.log(`Errors: ${result.errors}`)

  process.exit(0)
}

main().catch((err) => {
  console.error('Bootstrap failed:', err)
  process.exit(1)
})
