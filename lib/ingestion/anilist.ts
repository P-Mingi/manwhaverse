import { prisma } from '@/lib/db/client'
import {
  queryAniList,
  delay,
  RATE_LIMIT_DELAY,
  MANHWA_LIST_QUERY,
} from '@/lib/api/anilist'
import type { AniListMedia, AniListPageResult } from '@/lib/api/anilist'
import { slugify } from '@/lib/utils/slugify'
import { detectTropes, getAllTropeRules, getTropeRule } from './trope-detection'
import type { ContentType, PublicationStatus, CreatorRole, ContentRating } from '@prisma/client'

// ── Normalization helpers ──

function normalizeStatus(status: string | null): PublicationStatus {
  switch (status) {
    case 'RELEASING':
      return 'ONGOING'
    case 'FINISHED':
      return 'COMPLETED'
    case 'HIATUS':
      return 'HIATUS'
    case 'CANCELLED':
      return 'CANCELLED'
    default:
      return 'ONGOING'
  }
}

function buildSlug(media: AniListMedia): string {
  const title = media.title.english ?? media.title.romaji ?? `anilist-${media.id}`
  return slugify(title)
}

function stripHtml(html: string | null): string | null {
  if (!html) return null
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

function mapCreatorRole(role: string): CreatorRole | null {
  const r = role.toLowerCase()
  if (r.includes('story') && r.includes('art')) return 'BOTH'
  if (r.includes('story') || r.includes('original') || r.includes('author')) return 'AUTHOR'
  if (r.includes('art') || r.includes('illust')) return 'ILLUSTRATOR'
  return null
}

// ── Content rating classification ──

const NSFW_GENRES = new Set(['Hentai'])
const MATURE_GENRES = new Set(['Ecchi'])
const NSFW_TAGS = new Set(['Nudity', 'Sexual Content', 'Female Harem', 'Male Harem'])

function classifyContentRating(media: AniListMedia): {
  contentRating: ContentRating
  coverIsNsfw: boolean
} {
  // AniList isAdult flag is the most reliable signal
  if (media.isAdult) {
    const hasHentai = media.genres.some((g) => NSFW_GENRES.has(g))
    return {
      contentRating: hasHentai ? 'R18' : 'R18',
      coverIsNsfw: true,
    }
  }

  // Check genres for mature content
  if (media.genres.some((g) => MATURE_GENRES.has(g))) {
    return { contentRating: 'M', coverIsNsfw: false }
  }

  // Check tags for mature signals (high-ranked NSFW tags)
  const hasMatureTags = media.tags.some(
    (t) => NSFW_TAGS.has(t.name) && t.rank >= 60
  )
  if (hasMatureTags) {
    return { contentRating: 'M', coverIsNsfw: false }
  }

  // Default: PG13 for most manhwa (violence, dark themes are common)
  return { contentRating: 'PG13', coverIsNsfw: false }
}

// ── Seed tropes ──

async function seedTropes(): Promise<void> {
  const rules = getAllTropeRules()
  for (const rule of rules) {
    await prisma.trope.upsert({
      where: { slug: rule.slug },
      update: {},
      create: {
        slug: rule.slug,
        name: rule.name,
        category: rule.category,
      },
    })
  }
  console.log(`[seed] ${rules.length} tropes seeded`)
}

// ── Seed genres ──

async function seedGenre(name: string): Promise<string> {
  const slug = slugify(name)
  const genre = await prisma.genre.upsert({
    where: { slug },
    update: { manhwa_count: { increment: 1 } },
    create: {
      slug,
      name_en: name,
      name_fr: name, // will be translated later
      manhwa_count: 1,
    },
  })
  return genre.id
}

// ── Upsert creator ──

async function upsertCreator(staff: {
  id: number
  name: { full: string | null; native: string | null }
}): Promise<string> {
  const name = staff.name.full ?? `Creator ${staff.id}`
  const slug = slugify(name) || `creator-${staff.id}`

  const creator = await prisma.creator.upsert({
    where: { slug },
    update: {},
    create: {
      slug,
      name,
      name_native: staff.name.native,
      anilist_id: staff.id,
    },
  })
  return creator.id
}

// ── Import a single manhwa ──

async function importManhwa(
  media: AniListMedia,
  country: string
): Promise<{ created: boolean; slug: string }> {
  const slug = buildSlug(media)
  const synopsis = stripHtml(media.description)
  const { contentRating, coverIsNsfw } = classifyContentRating(media)

  // Check if already exists
  const existing = await prisma.manhwa.findFirst({
    where: { OR: [{ anilist_id: media.id }, { slug }] },
  })

  if (existing) {
    // Update with latest data
    await prisma.manhwa.update({
      where: { id: existing.id },
      data: {
        chapter_count: media.chapters ?? existing.chapter_count,
        status: normalizeStatus(media.status),
        ext_score_anilist: media.meanScore ? media.meanScore / 10 : null,
        ext_score_anilist_count: media.popularity,
        cover_url: media.coverImage.extraLarge ?? media.coverImage.large ?? existing.cover_url,
        banner_url: media.bannerImage ?? existing.banner_url,
        content_rating: contentRating,
        cover_is_nsfw: coverIsNsfw,
      },
    })
    return { created: false, slug: existing.slug }
  }

  // Build alternative titles
  const titleAlt: string[] = []
  if (media.title.romaji && media.title.romaji !== media.title.english) {
    titleAlt.push(media.title.romaji)
  }
  if (media.synonyms) {
    titleAlt.push(...media.synonyms)
  }

  // Create manhwa
  const manhwa = await prisma.manhwa.create({
    data: {
      slug,
      title_en: media.title.english ?? media.title.romaji ?? `Untitled ${media.id}`,
      title_kr: media.title.native,
      title_alt: titleAlt,
      synopsis_en: synopsis,
      cover_url: media.coverImage.extraLarge ?? media.coverImage.large,
      banner_url: media.bannerImage,
      type: (country === 'KR' ? 'MANHWA' : 'MANHUA') as ContentType,
      status: normalizeStatus(media.status),
      chapter_count: media.chapters,
      volume_count: media.volumes,
      release_year: media.startDate.year,
      end_year: media.endDate.year,
      origin_country: country,
      anilist_id: media.id,
      ext_score_anilist: media.meanScore ? media.meanScore / 10 : null,
      ext_score_anilist_count: media.popularity,
      favorite_count: media.favourites ?? 0,
      content_rating: contentRating,
      cover_is_nsfw: coverIsNsfw,
      data_source: ['anilist'],
      is_published: true,
    },
  })

  // Link genres
  for (const genreName of media.genres) {
    const genreId = await seedGenre(genreName)
    await prisma.manhwaGenre.create({
      data: { manhwa_id: manhwa.id, genre_id: genreId },
    }).catch(() => {
      // ignore duplicate
    })
  }

  // Link creators
  for (const edge of media.staff.edges) {
    const role = mapCreatorRole(edge.role)
    if (!role) continue

    const creatorId = await upsertCreator(edge.node)
    await prisma.manhwaCreator.create({
      data: { manhwa_id: manhwa.id, creator_id: creatorId, role },
    }).catch(() => {
      // ignore duplicate
    })
  }

  // Detect and link tropes from synopsis
  const detectedTropes = detectTropes(synopsis)
  for (const tropeSlug of detectedTropes) {
    const trope = await prisma.trope.findUnique({ where: { slug: tropeSlug } })
    if (trope) {
      await prisma.manhwaTrope.create({
        data: {
          manhwa_id: manhwa.id,
          trope_id: trope.id,
          is_verified: false,
        },
      }).catch(() => {
        // ignore duplicate
      })
      await prisma.trope.update({
        where: { id: trope.id },
        data: { manhwa_count: { increment: 1 } },
      })
    }
  }

  // Also map AniList tags to tropes (by matching tag names to our trope slugs)
  for (const tag of media.tags) {
    if (tag.isMediaSpoiler) continue
    if (tag.rank < 40) continue // only relevant tags

    const tagSlug = slugify(tag.name)
    const tropeRule = getTropeRule(tagSlug)
    if (tropeRule) {
      const trope = await prisma.trope.findUnique({ where: { slug: tagSlug } })
      if (trope) {
        await prisma.manhwaTrope.upsert({
          where: { manhwa_id_trope_id: { manhwa_id: manhwa.id, trope_id: trope.id } },
          update: {},
          create: {
            manhwa_id: manhwa.id,
            trope_id: trope.id,
            is_verified: false,
          },
        })
      }
    }
  }

  // Create read links from external links
  for (const link of media.externalLinks) {
    const platform = link.site.toLowerCase()
    if (['webtoon', 'tapas', 'lezhin', 'tappytoon', 'kakao', 'delitoon'].some(p => platform.includes(p))) {
      await prisma.readLink.create({
        data: {
          manhwa_id: manhwa.id,
          platform: link.site,
          url: link.url,
          language: link.language ?? 'en',
          is_free: platform.includes('webtoon'),
          is_official: true,
        },
      }).catch(() => {
        // ignore duplicate
      })
    }
  }

  return { created: true, slug }
}

// ── Main bootstrap function ──

export async function bootstrapFromAniList(options?: {
  maxPages?: number
  countries?: string[]
}): Promise<{
  total: number
  created: number
  updated: number
  errors: number
}> {
  const maxPages = options?.maxPages ?? 40 // 40 pages × 50 = 2000 titles
  const countries = options?.countries ?? ['KR', 'CN']

  console.log('[bootstrap] Starting AniList import...')
  console.log(`[bootstrap] Countries: ${countries.join(', ')}, Max pages per country: ${maxPages}`)

  // Seed tropes first
  await seedTropes()

  let totalCreated = 0
  let totalUpdated = 0
  let totalErrors = 0
  let totalProcessed = 0

  for (const country of countries) {
    console.log(`\n[bootstrap] Fetching ${country} titles...`)
    let page = 1
    let hasNextPage = true

    while (hasNextPage && page <= maxPages) {
      try {
        const result = await queryAniList<AniListPageResult>(MANHWA_LIST_QUERY, {
          page,
          perPage: 50,
          country,
          sort: ['POPULARITY_DESC'],
        })

        const { pageInfo, media } = result.Page
        console.log(`[bootstrap] Page ${page}/${pageInfo.lastPage} — ${media.length} titles`)

        for (const item of media) {
          try {
            const { created } = await importManhwa(item, country)
            if (created) totalCreated++
            else totalUpdated++
            totalProcessed++
          } catch (err) {
            totalErrors++
            const title = item.title.english ?? item.title.romaji ?? item.id
            console.error(`[bootstrap] Error importing "${title}":`, err)
          }
        }

        hasNextPage = pageInfo.hasNextPage
        page++

        // Rate limit
        await delay(RATE_LIMIT_DELAY)
      } catch (err) {
        console.error(`[bootstrap] Error fetching page ${page}:`, err)
        totalErrors++
        // Wait longer on error
        await delay(RATE_LIMIT_DELAY * 3)
        page++
      }
    }
  }

  // Log sync
  await prisma.syncLog.create({
    data: {
      source: 'anilist',
      type: 'bootstrap',
      items_synced: totalProcessed,
      items_new: totalCreated,
      items_updated: totalUpdated,
      errors: totalErrors,
      completed_at: new Date(),
    },
  })

  console.log(`\n[bootstrap] Done!`)
  console.log(`  Created: ${totalCreated}`)
  console.log(`  Updated: ${totalUpdated}`)
  console.log(`  Errors: ${totalErrors}`)
  console.log(`  Total: ${totalProcessed}`)

  return {
    total: totalProcessed,
    created: totalCreated,
    updated: totalUpdated,
    errors: totalErrors,
  }
}
