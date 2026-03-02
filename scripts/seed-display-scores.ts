import { recalculateAllScores, recalculateTrendingScores } from '../lib/scoring/recalculate'

async function main() {
  console.log('Seeding display scores...')
  const count = await recalculateAllScores()
  console.log(`Updated ${count} manhwas`)

  console.log('Seeding trending scores...')
  await recalculateTrendingScores()

  console.log('Done!')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
