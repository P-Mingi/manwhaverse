import { prisma } from '@/lib/db/client'
import { Prisma } from '@prisma/client'
import { queryAniList, delay, RATE_LIMIT_DELAY } from '@/lib/api/anilist'
import { slugify } from '@/lib/utils/slugify'
import type { CreatorRole, CharacterRole } from '@prisma/client'

// ── GraphQL query for enrichment ──

const ENRICH_QUERY = `
query ($id: Int) {
  Media(id: $id, type: MANGA) {
    id
    bannerImage
    volumes
    characters(sort: [ROLE, RELEVANCE], perPage: 25) {
      edges {
        role
        node {
          id
          name {
            full
            native
            alternative
          }
          description(asHtml: false)
          age
          gender
          image {
            large
          }
        }
      }
    }
    staff(sort: RELEVANCE, perPage: 15) {
      edges {
        role
        node {
          id
          name {
            full
            native
          }
        }
      }
    }
    relations {
      edges {
        relationType
        node {
          id
          type
          format
          title {
            english
            romaji
          }
        }
      }
    }
    popularity
    favourites
    stats {
      scoreDistribution {
        score
        amount
      }
      statusDistribution {
        status
        amount
      }
    }
    rankings {
      id
      rank
      type
      format
      year
      season
      allTime
      context
    }
  }
}
`

// ── Types ──

interface EnrichMedia {
  id: number
  bannerImage: string | null
  volumes: number | null
  popularity: number | null
  favourites: number | null
  characters: {
    edges: Array<{
      role: string
      node: {
        id: number
        name: { full: string | null; native: string | null; alternative: string[] }
        description: string | null
        age: string | null
        gender: string | null
        image: { large: string | null }
      }
    }>
  }
  staff: {
    edges: Array<{
      role: string
      node: {
        id: number
        name: { full: string | null; native: string | null }
      }
    }>
  }
  relations: {
    edges: Array<{
      relationType: string
      node: {
        id: number
        type: string
        format: string | null
        title: { english: string | null; romaji: string | null }
      }
    }>
  }
  stats: {
    scoreDistribution: Array<{ score: number; amount: number }>
    statusDistribution: Array<{ status: string; amount: number }>
  }
  rankings: Array<{
    id: number
    rank: number
    type: string
    format: string
    year: number | null
    season: string | null
    allTime: boolean
    context: string
  }>
}

interface EnrichResult {
  Media: EnrichMedia
}

// ── Helpers ──

function mapCharacterRole(role: string): CharacterRole {
  switch (role) {
    case 'MAIN':
      return 'MAIN'
    case 'SUPPORTING':
      return 'SUPPORTING'
    default:
      return 'BACKGROUND'
  }
}

function mapRelationType(type: string): string | null {
  const map: Record<string, string> = {
    ADAPTATION: 'ADAPTATION',
    SOURCE: 'SOURCE',
    SEQUEL: 'SEQUEL',
    PREQUEL: 'PREQUEL',
    SIDE_STORY: 'SIDE_STORY',
    ALTERNATIVE: 'ALTERNATIVE',
  }
  return map[type] ?? null
}

function mapCreatorRole(role: string): CreatorRole | null {
  const r = role.toLowerCase()
  if (r.includes('story') && r.includes('art')) return 'BOTH'
  if (r.includes('story') || r.includes('original') || r.includes('author')) return 'AUTHOR'
  if (r.includes('art') || r.includes('illust')) return 'ILLUSTRATOR'
  return null
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

// ── Enrich a single manhwa ──

async function enrichManhwa(
  manhwaId: string,
  anilistId: number,
  slug: string
): Promise<{ characters: number; relations: number }> {
  const result = await queryAniList<EnrichResult>(ENRICH_QUERY, { id: anilistId })
  const media = result.Media

  // 1. Update banner_url + volume_count (fill only if null)
  await prisma.manhwa.update({
    where: { id: manhwaId },
    data: {
      ...(media.bannerImage ? { banner_url: media.bannerImage } : {}),
      ...(media.volumes ? { volume_count: media.volumes } : {}),
      ...(media.popularity ? { reader_count: media.popularity } : {}),
      ...(media.favourites ? { favorite_count: media.favourites } : {}),
      anilist_stats: {
        scoreDistribution: media.stats.scoreDistribution,
        statusDistribution: media.stats.statusDistribution,
        rankings: media.rankings,
      },
    },
  })

  // 2. Upsert characters
  let charCount = 0
  for (const edge of media.characters.edges) {
    const node = edge.node
    const name = node.name.full ?? `Character ${node.id}`
    const charSlug = slugify(name) || `char-${node.id}`

    const character = await prisma.character.upsert({
      where: { anilist_id: node.id },
      update: {
        name_en: name,
        name_native: node.name.native,
        name_alt: node.name.alternative ?? [],
        description: stripHtml(node.description),
        age: node.age,
        gender: node.gender,
        image_url: node.image.large,
      },
      create: {
        slug: charSlug,
        name_en: name,
        name_native: node.name.native,
        name_alt: node.name.alternative ?? [],
        description: stripHtml(node.description),
        age: node.age,
        gender: node.gender,
        image_url: node.image.large,
        anilist_id: node.id,
      },
    })

    await prisma.manhwaCharacter.upsert({
      where: {
        manhwa_id_character_id: {
          manhwa_id: manhwaId,
          character_id: character.id,
        },
      },
      update: { role: mapCharacterRole(edge.role) },
      create: {
        manhwa_id: manhwaId,
        character_id: character.id,
        role: mapCharacterRole(edge.role),
      },
    })
    charCount++
  }

  // 3. Upsert relations (only if target exists in DB)
  let relCount = 0
  for (const edge of media.relations.edges) {
    const relType = mapRelationType(edge.relationType)
    if (!relType) continue

    // Find target by anilist_id
    const target = await prisma.manhwa.findUnique({
      where: { anilist_id: edge.node.id },
      select: { id: true },
    })
    if (!target) continue

    await prisma.manhwaRelation.upsert({
      where: {
        source_id_target_id_relation_type: {
          source_id: manhwaId,
          target_id: target.id,
          relation_type: relType as any,
        },
      },
      update: {},
      create: {
        source_id: manhwaId,
        target_id: target.id,
        relation_type: relType as any,
      },
    })
    relCount++
  }

  // 4. Update creator role_detail from staff edges
  for (const edge of media.staff.edges) {
    const role = mapCreatorRole(edge.role)
    if (!role) continue

    const creator = await prisma.creator.findFirst({
      where: { anilist_id: edge.node.id },
      select: { id: true },
    })
    if (!creator) continue

    await prisma.manhwaCreator.updateMany({
      where: {
        manhwa_id: manhwaId,
        creator_id: creator.id,
        role,
      },
      data: { role_detail: edge.role },
    })
  }

  console.log(`  [${slug}] ${charCount} characters, ${relCount} relations`)
  return { characters: charCount, relations: relCount }
}

// ── Main enrichment function ──

export async function enrichFromAniList(options?: {
  limit?: number
  skipEnriched?: boolean
}): Promise<{
  enriched: number
  totalCharacters: number
  totalRelations: number
  errors: number
}> {
  const limit = options?.limit
  const skipEnriched = options?.skipEnriched ?? true

  // Get manhwas with anilist_id, optionally skipping already enriched ones
  const manhwas = await prisma.manhwa.findMany({
    where: {
      anilist_id: { not: null },
      is_published: true,
      ...(skipEnriched ? { anilist_stats: { equals: Prisma.DbNull } } : {}),
    },
    select: { id: true, anilist_id: true, slug: true },
    orderBy: { reader_count: 'desc' },
    ...(limit ? { take: limit } : {}),
  })

  console.log(`[enrich] Found ${manhwas.length} manhwas to enrich${limit ? ` (limit: ${limit})` : ''}`)

  let enriched = 0
  let totalCharacters = 0
  let totalRelations = 0
  let errors = 0

  for (const manhwa of manhwas) {
    try {
      const result = await enrichManhwa(manhwa.id, manhwa.anilist_id!, manhwa.slug)
      totalCharacters += result.characters
      totalRelations += result.relations
      enriched++
    } catch (err) {
      errors++
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[enrich] Error enriching "${manhwa.slug}": ${msg.slice(0, 100)}`)
      // Wait much longer on rate limit (429)
      if (msg.includes('429')) {
        console.log('[enrich] Rate limited — waiting 30s...')
        await delay(30_000)
      } else {
        await delay(RATE_LIMIT_DELAY * 3)
      }
    }

    // ~50 req/min to stay well under 90 req/min limit
    await delay(1200)
  }

  // Log sync
  await prisma.syncLog.create({
    data: {
      source: 'anilist',
      type: 'enrich',
      items_synced: enriched,
      items_new: totalCharacters,
      items_updated: totalRelations,
      errors,
      completed_at: new Date(),
    },
  })

  return { enriched, totalCharacters, totalRelations, errors }
}
