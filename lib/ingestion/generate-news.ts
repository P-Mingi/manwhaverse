/**
 * AI news rewriter using Claude.
 * Takes raw RSS items and generates bilingual (EN/FR) news articles
 * with ManhwaVerse editorial tone. Saves as DRAFT for admin review.
 *
 * Requires: ANTHROPIC_API_KEY in .env
 */

import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '../db/client'
import type { RawNewsItem } from './scrape-news'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface GeneratedArticle {
  title_en: string
  title_fr: string
  content_en: string
  content_fr: string
  excerpt_en: string
  excerpt_fr: string
  slug: string
  reading_time: number
  manhwa_keywords: string[]
}

function buildSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

async function generateArticle(item: RawNewsItem): Promise<GeneratedArticle | null> {
  const prompt = `You are an editor at ManhwaVerse, a platform dedicated to manhwa (Korean webcomics) fans.

A news source published this item:
- Title: ${item.title}
- Source: ${item.source}
- Date: ${item.pubDate}
- Summary: ${item.description}

Write an engaging news article for our manhwa community based on this. Requirements:
- Length: 200-350 words per language
- Editorial tone: enthusiastic but factual, written for manhwa readers
- If the news relates to a specific manhwa/manhwa creator, mention it clearly
- Link readers to relevant manhwa context (e.g. "fans of [Title] will be excited")
- Do NOT invent facts that aren't in the summary

Return ONLY valid JSON (no markdown, no code blocks), exactly this shape:
{
  "title_en": "engaging English headline",
  "title_fr": "titre en français accrocheur",
  "content_en": "Full article in markdown EN (200-350 words)",
  "content_fr": "Article complet en markdown FR (200-350 mots)",
  "excerpt_en": "1-2 sentence teaser in English (max 200 chars)",
  "excerpt_fr": "Accroche 1-2 phrases en français (max 200 chars)",
  "slug": "url-friendly-slug-from-title-en",
  "reading_time": 2,
  "manhwa_keywords": ["list", "of", "manhwa", "titles", "mentioned"]
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = (response.content[0] as { type: string; text: string }).text.trim()
    // Strip markdown code fences if present
    const json = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    const parsed = JSON.parse(json) as GeneratedArticle
    return parsed
  } catch (err) {
    console.warn('  ✗ Claude parse error:', err)
    return null
  }
}

async function findManhwaLinks(keywords: string[]): Promise<string[]> {
  if (!keywords.length) return []
  const results = await prisma.manhwa.findMany({
    where: {
      OR: keywords.map((kw) => ({
        title_en: { contains: kw, mode: 'insensitive' as const },
      })),
      is_published: true,
    },
    select: { id: true },
    take: 5,
  })
  return results.map((r) => r.id)
}

export async function generateAndSaveNewsArticle(
  item: RawNewsItem
): Promise<'created' | 'duplicate' | 'failed'> {
  // Dedup check: skip if source_url already exists
  const existing = await prisma.article.findFirst({
    where: { source_url: item.guid || item.link },
  })
  if (existing) return 'duplicate'

  const generated = await generateArticle(item)
  if (!generated) return 'failed'

  // Ensure slug is unique by appending a suffix if needed
  let slug = buildSlug(generated.slug || generated.title_en)
  const slugExists = await prisma.article.findUnique({ where: { slug } })
  if (slugExists) slug = `${slug}-${Date.now()}`

  const manhwaIds = await findManhwaLinks(generated.manhwa_keywords ?? [])

  await prisma.article.create({
    data: {
      slug,
      title_en:        generated.title_en,
      title_fr:        generated.title_fr,
      content_en:      generated.content_en,
      content_fr:      generated.content_fr,
      excerpt_en:      generated.excerpt_en?.slice(0, 499),
      excerpt_fr:      generated.excerpt_fr?.slice(0, 499),
      category:        'NEWS',
      status:          'DRAFT',
      author_name:     'ManhwaVerse Editorial',
      reading_time:    generated.reading_time ?? 2,
      source_url:      item.guid || item.link,
      manhwa_links: manhwaIds.length > 0
        ? { create: manhwaIds.map((manhwa_id) => ({ manhwa_id })) }
        : undefined,
    },
  })

  return 'created'
}
