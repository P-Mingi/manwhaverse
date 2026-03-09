/**
 * RSS scraper for manhwa-relevant news.
 * Parses feeds from ANN and Crunchyroll without external XML libraries.
 */

export interface RawNewsItem {
  title: string
  link: string
  description: string
  pubDate: string
  guid: string
  source: string
}

const FEEDS = [
  {
    name: 'Anime News Network',
    url: 'https://www.animenewsnetwork.com/news/rss.xml?ann-edition=us',
  },
  {
    name: 'Crunchyroll',
    url: 'https://feeds.feedburner.com/crunchyroll/animenews',
  },
]

// Keywords that indicate manhwa/webtoon relevance
const MANHWA_KEYWORDS = [
  'manhwa', 'webtoon', 'korean comic', 'naver', 'kakao',
  'solo leveling', 'tower of god', 'true beauty', 'lore olympus',
  'omniscient reader', 'return of the blossoming blade',
  'manhua', 'donghua', 'murim',
]

// Simple CDATA-aware tag extractor
function extractTag(xml: string, tag: string): string {
  // Match <tag>...</tag> with optional CDATA wrapper
  const re = new RegExp(
    `<${tag}[^>]*>(?:<!\[CDATA\[)?([\\s\\S]*?)(?:\]\]>)?<\/${tag}>`,
    'i'
  )
  const m = xml.match(re)
  if (!m?.[1]) return ''
  return m[1]
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/<[^>]+>/g, ' ') // strip remaining HTML tags
    .replace(/\s+/g, ' ')
    .trim()
}

function parseRSS(xml: string, sourceName: string): RawNewsItem[] {
  const items: RawNewsItem[] = []
  for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const block = match[1] ?? ''
    const item: RawNewsItem = {
      title:       extractTag(block, 'title'),
      link:        extractTag(block, 'link'),
      description: extractTag(block, 'description'),
      pubDate:     extractTag(block, 'pubDate'),
      guid:        extractTag(block, 'guid'),
      source:      sourceName,
    }
    items.push(item)
  }
  return items
}

function isManhwaRelevant(item: RawNewsItem): boolean {
  const text = `${item.title} ${item.description}`.toLowerCase()
  return MANHWA_KEYWORDS.some((kw) => text.includes(kw))
}

export async function scrapeNewsFeeds(): Promise<RawNewsItem[]> {
  const results: RawNewsItem[] = []

  for (const feed of FEEDS) {
    try {
      console.log(`  Fetching ${feed.name}...`)
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'ManhwaVerse-NewsBot/1.0' },
        signal: AbortSignal.timeout(10_000),
      })
      if (!res.ok) {
        console.warn(`  ✗ ${feed.name}: HTTP ${res.status}`)
        continue
      }
      const xml = await res.text()
      const items = parseRSS(xml, feed.name)
      const relevant = items.filter(isManhwaRelevant)
      console.log(`  ✓ ${feed.name}: ${items.length} items, ${relevant.length} relevant`)
      results.push(...relevant)
    } catch (err) {
      console.warn(`  ✗ ${feed.name}: ${err}`)
    }
  }

  // Deduplicate by guid/link
  const seen = new Set<string>()
  return results.filter((item) => {
    const key = item.guid || item.link
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
