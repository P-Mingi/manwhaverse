import { unstable_cache } from 'next/cache'
import { prisma } from './client'
import type { Prisma } from '@prisma/client'

const characterWithRole = {
  character: true,
} satisfies Prisma.ManhwaCharacterInclude

export type CharacterWithRole = Prisma.ManhwaCharacterGetPayload<{
  include: typeof characterWithRole
}>

export function getCharactersByManhwaId(manhwaId: string): Promise<CharacterWithRole[]> {
  return unstable_cache(
    async () => {
      return prisma.manhwaCharacter.findMany({
        where: { manhwa_id: manhwaId },
        include: characterWithRole,
        orderBy: [
          { role: 'asc' }, // MAIN first (alphabetically: BACKGROUND, MAIN, SUPPORTING)
        ],
      })
    },
    [`characters-by-manhwa-${manhwaId}`],
    { revalidate: 3600, tags: ['characters', `manhwa-${manhwaId}`] }
  )()
}

export async function getAllCharacters(
  page: number,
  take: number,
  role?: 'MAIN' | 'SUPPORTING'
) {
  const roleFilter = role
    ? { manhwa_links: { some: { role } } }
    : undefined

  const [characters, total] = await Promise.all([
    prisma.character.findMany({
      where: roleFilter,
      include: { _count: { select: { manhwa_links: true } } },
      orderBy: { name_en: 'asc' },
      skip: (page - 1) * take,
      take,
    }),
    prisma.character.count({ where: roleFilter }),
  ])

  return { characters, total }
}

export async function getCharacterBySlug(slug: string) {
  return prisma.character.findUnique({
    where: { slug },
    include: {
      manhwa_links: {
        include: {
          manhwa: {
            select: {
              id: true,
              slug: true,
              title_en: true,
              title_fr: true,
              cover_url: true,
            },
          },
        },
      },
    },
  })
}
