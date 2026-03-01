import { PrismaClient } from '@prisma/client'
import Anthropic from '@anthropic-ai/sdk'
import type { SeedUser } from './generate-users'
import type { LibraryEntry } from './generate-libraries'
import { chunk, sleep, randomDate } from './utils'

const prisma = new PrismaClient()

interface ManhwaInfo {
  id: string
  title_en: string
  genres: string[]
}

/**
 * Generate reviews for seed users.
 * Uses Claude API for realistic review text.
 */
export async function generateReviews(
  users: SeedUser[],
  libraries: LibraryEntry[],
): Promise<number> {
  // Load manhwa info for titles
  const manhwaMap = new Map<string, ManhwaInfo>()
  const manhwas = await prisma.manhwa.findMany({
    where: { is_published: true },
    select: {
      id: true,
      title_en: true,
      genre_links: { include: { genre: { select: { name_en: true } } }, take: 3 },
    },
  })
  for (const m of manhwas) {
    manhwaMap.set(m.id, {
      id: m.id,
      title_en: m.title_en,
      genres: m.genre_links.map((gl) => gl.genre.name_en),
    })
  }

  // Build user library map: userId -> entries with scores
  const userLibMap = new Map<string, LibraryEntry[]>()
  for (const entry of libraries) {
    if (entry.score === null) continue
    const list = userLibMap.get(entry.userId) ?? []
    list.push(entry)
    userLibMap.set(entry.userId, list)
  }

  // Determine which users write reviews based on archetype probability
  const reviewTasks: {
    user: SeedUser
    manhwaId: string
    score: number
    manhwaTitle: string
    genres: string[]
    isMicro: boolean
  }[] = []

  for (const user of users) {
    const entries = userLibMap.get(user.id) ?? []
    for (const entry of entries) {
      if (Math.random() > user.archetype.reviewProbability) continue
      const manhwa = manhwaMap.get(entry.manhwaId)
      if (!manhwa) continue

      // 80% micro reviews, 20% long reviews
      // Critical reviewers write more long reviews
      const longProbability = user.archetype.name === 'CRITICAL_REVIEWER' ? 0.5 : 0.2
      const isMicro = Math.random() > longProbability

      reviewTasks.push({
        user,
        manhwaId: entry.manhwaId,
        score: entry.score!,
        manhwaTitle: manhwa.title_en,
        genres: manhwa.genres,
        isMicro,
      })
    }
  }

  console.log(`  ${reviewTasks.length} reviews to generate`)

  if (reviewTasks.length === 0) return 0

  // Check if Anthropic API key is available
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.log('  ⚠ No ANTHROPIC_API_KEY — generating template reviews instead of AI reviews')
    return generateTemplateReviews(reviewTasks)
  }

  const anthropic = new Anthropic({ apiKey })

  // Process in batches to avoid rate limits
  const batches = chunk(reviewTasks, 10)
  let totalCreated = 0

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]!

    const results = await Promise.allSettled(
      batch.map(async (task) => {
        const prompt = buildReviewPrompt(task)

        const response = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: task.isMicro ? 100 : 600,
          messages: [{ role: 'user', content: prompt }],
        })

        const content = response.content[0]
        if (!content || content.type !== 'text') return null
        return content.text.trim()
      }),
    )

    for (let j = 0; j < results.length; j++) {
      const result = results[j]!
      if (result.status !== 'fulfilled' || !result.value) continue

      const task = batch[j]!
      try {
        await prisma.review.create({
          data: {
            user_id: task.user.id,
            manhwa_id: task.manhwaId,
            content: result.value,
            score: task.score,
            is_micro: task.isMicro,
            has_spoilers: false,
            likes_count: 0,
            created_at: randomDate(task.user.created_at, new Date()),
          },
        })
        totalCreated++
      } catch {
        // Duplicate or other error — skip
      }
    }

    if ((i + 1) % 10 === 0) {
      console.log(`    Batch ${i + 1}/${batches.length} — ${totalCreated} reviews created`)
    }

    // Rate limit: wait between batches
    await sleep(500)
  }

  return totalCreated
}

function buildReviewPrompt(task: {
  user: SeedUser
  score: number
  manhwaTitle: string
  genres: string[]
  isMicro: boolean
}): string {
  const locale = task.user.locale
  const lang = locale === 'fr' ? 'français' : 'English'
  const length = task.isMicro ? '1-2 sentences only' : '150-300 words'

  return `You are ${task.user.username}, a manhwa reader. Profile: ${task.user.archetype.description}.
You read "${task.manhwaTitle}" (${task.genres.join(', ')}) and gave it ${task.score}/10.

Write a ${length} review in ${lang}.
Rules:
- Reflect your score (${task.score}/10) — enthusiastic if high, critical if low
- Mention specific aspects (art, story, characters, pacing)
- Sound natural, like a real forum post
- Do NOT mention AniList, MyAnimeList, or other platforms
- Do NOT start with "As a..." or "I am a fan of..."
- Do NOT use quotes around the title
- Just output the review text, nothing else`
}

/**
 * Fallback: generate reviews from templates when no API key.
 */
async function generateTemplateReviews(
  tasks: {
    user: SeedUser
    manhwaId: string
    score: number
    manhwaTitle: string
    genres: string[]
    isMicro: boolean
  }[],
): Promise<number> {
  const MICRO_EN = [
    'Solid read, the art carries hard.',
    'Started strong but the pacing fell off midway.',
    'Absolutely binged this in one sitting. No regrets.',
    'The MC development is chef\'s kiss.',
    'Art is gorgeous but the story feels generic.',
    'Way better than expected. Hidden gem for sure.',
    'Dropped it after 30 chapters. Not for me.',
    'Peak fiction. Everyone needs to read this.',
    'Good but not great. Missing something.',
    'The fights are insane, love the power system.',
    'Wholesome and cute, exactly what I needed.',
    'Overrated tbh, but the art is undeniable.',
    'This got me into manhwa. Will always have a special place.',
    'Interesting concept but poor execution.',
    'Can\'t wait for the next chapters.',
  ]

  const MICRO_FR = [
    'Lecture solide, le dessin porte tout.',
    'Bon début mais le rythme se casse en milieu.',
    'Bingé en une nuit. Aucun regret.',
    'Le développement du MC est parfait.',
    'Le dessin est magnifique mais l\'histoire est générique.',
    'Bien meilleur que prévu. Pépite cachée.',
    'Abandonné après 30 chapitres. Pas pour moi.',
    'Chef-d\'œuvre. Tout le monde doit lire ça.',
    'Bon mais pas incroyable. Il manque quelque chose.',
    'Les combats sont dingues, le power system est top.',
    'Mignon et wholesome, exactement ce qu\'il me fallait.',
    'Surcôté honnêtement, mais le dessin est indéniable.',
    'C\'est ce manhwa qui m\'a fait découvrir le genre.',
    'Concept intéressant mais mauvaise exécution.',
    'Vivement la suite !',
  ]

  let created = 0

  for (const task of tasks) {
    if (!task.isMicro) continue // Skip long reviews without AI

    const templates = task.user.locale === 'fr' ? MICRO_FR : MICRO_EN
    const content = templates[Math.floor(Math.random() * templates.length)]!


    try {
      await prisma.review.create({
        data: {
          user_id: task.user.id,
          manhwa_id: task.manhwaId,
          content,
          score: task.score,
          is_micro: true,
          has_spoilers: false,
          likes_count: 0,
          created_at: randomDate(task.user.created_at, new Date()),
        },
      })
      created++
    } catch {
      // Skip duplicates
    }
  }

  return created
}
