const ANILIST_ENDPOINT = 'https://graphql.anilist.co'
const RATE_LIMIT_DELAY = 700 // ms between requests (90 req/min limit)

interface AniListResponse<T> {
  data: T
}

export async function queryAniList<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const response = await fetch(ANILIST_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`AniList API error ${response.status}: ${text}`)
  }

  const json = (await response.json()) as AniListResponse<T>
  return json.data
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export { RATE_LIMIT_DELAY }

// ── GraphQL Queries ──

export const MANHWA_LIST_QUERY = `
query ($page: Int, $perPage: Int, $country: CountryCode, $sort: [MediaSort]) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
    }
    media(
      type: MANGA
      countryOfOrigin: $country
      sort: $sort
    ) {
      id
      title {
        english
        romaji
        native
      }
      synonyms
      description(asHtml: false)
      coverImage {
        extraLarge
        large
      }
      bannerImage
      format
      status
      chapters
      volumes
      startDate {
        year
      }
      endDate {
        year
      }
      genres
      tags {
        id
        name
        description
        category
        rank
        isMediaSpoiler
      }
      meanScore
      popularity
      favourites
      staff(sort: RELEVANCE, perPage: 10) {
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
      externalLinks {
        url
        site
        language
        type
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
    }
  }
}
`

// ── Types ──

export interface AniListPageInfo {
  total: number
  currentPage: number
  lastPage: number
  hasNextPage: boolean
}

export interface AniListMedia {
  id: number
  title: {
    english: string | null
    romaji: string | null
    native: string | null
  }
  synonyms: string[]
  description: string | null
  coverImage: {
    extraLarge: string | null
    large: string | null
  }
  bannerImage: string | null
  format: string | null
  status: string | null
  chapters: number | null
  volumes: number | null
  startDate: { year: number | null }
  endDate: { year: number | null }
  genres: string[]
  tags: Array<{
    id: number
    name: string
    description: string | null
    category: string | null
    rank: number
    isMediaSpoiler: boolean
  }>
  meanScore: number | null
  popularity: number | null
  favourites: number | null
  staff: {
    edges: Array<{
      role: string
      node: {
        id: number
        name: {
          full: string | null
          native: string | null
        }
      }
    }>
  }
  externalLinks: Array<{
    url: string
    site: string
    language: string | null
    type: string | null
  }>
  relations: {
    edges: Array<{
      relationType: string
      node: {
        id: number
        type: string
        format: string | null
        title: {
          english: string | null
          romaji: string | null
        }
      }
    }>
  }
}

export interface AniListPageResult {
  Page: {
    pageInfo: AniListPageInfo
    media: AniListMedia[]
  }
}
