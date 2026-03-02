import { recalculateAllScores, recalculateTrendingScores } from '@/lib/scoring/recalculate'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const scores = await recalculateAllScores()
  const trending = await recalculateTrendingScores()

  return Response.json({
    recalculated_scores: scores,
    recalculated_trending: trending,
    timestamp: new Date().toISOString(),
  })
}
