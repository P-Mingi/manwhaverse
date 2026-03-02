import { prisma } from './client'
import type { Prisma } from '@prisma/client'

const characterWithRole = {
  character: true,
} satisfies Prisma.ManhwaCharacterInclude

export type CharacterWithRole = Prisma.ManhwaCharacterGetPayload<{
  include: typeof characterWithRole
}>

export async function getCharactersByManhwaId(
  manhwaId: string
): Promise<CharacterWithRole[]> {
  return prisma.manhwaCharacter.findMany({
    where: { manhwa_id: manhwaId },
    include: characterWithRole,
    orderBy: [
      { role: 'asc' }, // MAIN first (alphabetically: BACKGROUND, MAIN, SUPPORTING)
    ],
  })
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
