import { seedUsers } from './seed-users'

async function main() {
  console.log('=== ManwhaBox User Seed ===\n')
  console.log(`Started at: ${new Date().toISOString()}\n`)

  const startTime = Date.now()
  const result = await seedUsers()
  const duration = Math.round((Date.now() - startTime) / 1000)

  console.log(`\n=== Seed Complete ===`)
  console.log(`Duration: ${duration}s`)
  console.log(`Users created: ${result.usersCreated}`)
  console.log(`Library entries: ${result.libraryEntries}`)
  console.log(`Reviews: ${result.reviews}`)
  console.log(`Follows: ${result.follows}`)
  console.log(`Manhwa recalculated: ${result.manhwaRecalculated}`)

  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
