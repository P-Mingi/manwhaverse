import { unstable_cache } from 'next/cache'
import { prisma } from './client'

const published = { is_published: true, deleted_at: null } as const

export interface RankedManhwa {
  rank: number
  slug: string
  title: string
  cover_url: string | null
  score: number | null
  reader_count: number
  genres: string[]
}

export const getTopRankedManhwas = unstable_cache(
  async (limit: number, locale: string): Promise<RankedManhwa[]> => {
    const manhwas = await prisma.manhwa.findMany({
      where: {
        ...published,
        display_score: { not: null },
      },
      orderBy: [{ display_score: 'desc' }, { display_popularity: 'desc' }],
      take: limit,
      select: {
        slug: true,
        title_en: true,
        title_fr: true,
        cover_url: true,
        display_score: true,
        reader_count: true,
        genre_links: {
          include: { genre: { select: { name_en: true, name_fr: true } } },
          take: 3,
        },
      },
    })

    return manhwas.map((m, i) => ({
      rank: i + 1,
      slug: m.slug,
      title: locale === 'fr' && m.title_fr ? m.title_fr : m.title_en,
      cover_url: m.cover_url,
      score: m.display_score,
      reader_count: m.reader_count,
      genres: m.genre_links.map((gl) =>
        locale === 'fr' ? gl.genre.name_fr : gl.genre.name_en,
      ),
    }))
  },
  ['top-ranked-manhwas'],
  { revalidate: 300, tags: ['rankings'] }
)

export async function getTopRankedByGenre(
  genreSlug: string,
  limit: number,
  locale: string,
): Promise<RankedManhwa[]> {
  const manhwas = await prisma.manhwa.findMany({
    where: {
      ...published,
      genre_links: { some: { genre: { slug: genreSlug } } },
      display_score: { not: null },
    },
    orderBy: [{ display_score: 'desc' }, { display_popularity: 'desc' }],
    take: limit,
    select: {
      slug: true,
      title_en: true,
      title_fr: true,
      cover_url: true,
      display_score: true,
      reader_count: true,
      genre_links: {
        include: { genre: { select: { name_en: true, name_fr: true } } },
        take: 3,
      },
    },
  })

  return manhwas.map((m, i) => ({
    rank: i + 1,
    slug: m.slug,
    title: locale === 'fr' && m.title_fr ? m.title_fr : m.title_en,
    cover_url: m.cover_url,
    score: m.display_score,
    reader_count: m.reader_count,
    genres: m.genre_links.map((gl) =>
      locale === 'fr' ? gl.genre.name_fr : gl.genre.name_en,
    ),
  }))
}
