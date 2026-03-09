import { isAdmin } from '@/lib/auth/session'
import { getUser } from '@/lib/auth/session'
import { scrapeNewsFeeds } from '@/lib/ingestion/scrape-news'
import { generateAndSaveNewsArticle } from '@/lib/ingestion/generate-news'

const MODERATOR_USERNAMES = (process.env.MODERATOR_USERNAMES ?? '').split(',').map((u) => u.trim()).filter(Boolean)

async function checkAccess() {
  const [adminOk, user] = await Promise.all([isAdmin(), getUser()])
  const isModerator = user?.username && MODERATOR_USERNAMES.includes(user.username)
  return adminOk || isModerator
}

export async function POST() {
  if (!(await checkAccess())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 })
  }

  const items = await scrapeNewsFeeds()

  if (!items.length) {
    return Response.json({ created: 0, duplicates: 0, failed: 0, message: 'No new items found' })
  }

  let created = 0
  let duplicates = 0
  let failed = 0

  for (const item of items) {
    const result = await generateAndSaveNewsArticle(item)
    if (result === 'created') created++
    else if (result === 'duplicate') duplicates++
    else failed++
  }

  return Response.json({ created, duplicates, failed })
}
