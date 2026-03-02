import { prisma } from './client'

export interface CharacterVoteRanking {
  character_id: string
  character_name: string
  character_image: string | null
  character_role: string
  vote_count: number
}

export async function getCharacterVoteRankings(
  manhwaId: string
): Promise<CharacterVoteRanking[]> {
  const results = await prisma.characterVote.groupBy({
    by: ['character_id'],
    where: { manhwa_id: manhwaId },
    _count: { character_id: true },
    orderBy: { _count: { character_id: 'desc' } },
    take: 20,
  })

  if (results.length === 0) return []

  const characterIds = results.map((r) => r.character_id)
  const characters = await prisma.character.findMany({
    where: { id: { in: characterIds } },
    select: { id: true, name_en: true, image_url: true },
  })

  const charMap = new Map(characters.map((c) => [c.id, c]))

  // Get roles for these characters in this manhwa
  const roles = await prisma.manhwaCharacter.findMany({
    where: { manhwa_id: manhwaId, character_id: { in: characterIds } },
    select: { character_id: true, role: true },
  })
  const roleMap = new Map(roles.map((r) => [r.character_id, r.role]))

  return results.map((r) => {
    const char = charMap.get(r.character_id)
    return {
      character_id: r.character_id,
      character_name: char?.name_en ?? 'Unknown',
      character_image: char?.image_url ?? null,
      character_role: roleMap.get(r.character_id) ?? 'SUPPORTING',
      vote_count: r._count.character_id,
    }
  })
}

export async function getUserCharacterVote(
  userId: string,
  manhwaId: string
): Promise<string | null> {
  const vote = await prisma.characterVote.findUnique({
    where: { user_id_manhwa_id: { user_id: userId, manhwa_id: manhwaId } },
    select: { character_id: true },
  })
  return vote?.character_id ?? null
}

export async function castCharacterVote(
  userId: string,
  manhwaId: string,
  characterId: string
): Promise<{ removed: boolean }> {
  const existing = await prisma.characterVote.findUnique({
    where: { user_id_manhwa_id: { user_id: userId, manhwa_id: manhwaId } },
  })

  // Toggle off: same character clicked again
  if (existing?.character_id === characterId) {
    await prisma.characterVote.delete({
      where: { user_id_manhwa_id: { user_id: userId, manhwa_id: manhwaId } },
    })
    return { removed: true }
  }

  // Vote or change vote
  await prisma.characterVote.upsert({
    where: { user_id_manhwa_id: { user_id: userId, manhwa_id: manhwaId } },
    create: { user_id: userId, manhwa_id: manhwaId, character_id: characterId },
    update: { character_id: characterId },
  })
  return { removed: false }
}
