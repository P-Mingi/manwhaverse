import { prisma } from './client'
import type { KoreanReaction } from '@prisma/client'

export async function getManhwaReactionCounts(manhwaId: string) {
  const manhwa = await prisma.manhwa.findUnique({
    where: { id: manhwaId },
    select: {
      reaction_heol: true,
      reaction_daebak: true,
      reaction_gamdong: true,
      reaction_kingbat: true,
      reaction_michyeo: true,
      reaction_jukget: true,
    },
  })
  if (!manhwa) return {}
  return {
    HEOL: manhwa.reaction_heol,
    DAEBAK: manhwa.reaction_daebak,
    GAMDONG: manhwa.reaction_gamdong,
    KINGBAT: manhwa.reaction_kingbat,
    MICHYEO: manhwa.reaction_michyeo,
    JUKGET: manhwa.reaction_jukget,
  } as Record<KoreanReaction, number>
}

export async function getUserManhwaReactions(userId: string, manhwaId: string) {
  const reactions = await prisma.manhwaReaction.findMany({
    where: { user_id: userId, manhwa_id: manhwaId },
    select: { reaction: true },
  })
  return reactions.map((r) => r.reaction)
}

const COUNTER_FIELD: Record<KoreanReaction, string> = {
  HEOL: 'reaction_heol',
  DAEBAK: 'reaction_daebak',
  GAMDONG: 'reaction_gamdong',
  KINGBAT: 'reaction_kingbat',
  MICHYEO: 'reaction_michyeo',
  JUKGET: 'reaction_jukget',
}

export async function toggleManhwaReaction(
  userId: string,
  manhwaId: string,
  reaction: KoreanReaction
) {
  const existing = await prisma.manhwaReaction.findUnique({
    where: {
      user_id_manhwa_id_reaction: { user_id: userId, manhwa_id: manhwaId, reaction },
    },
  })

  const field = COUNTER_FIELD[reaction]

  if (existing) {
    await prisma.$transaction([
      prisma.manhwaReaction.delete({
        where: {
          user_id_manhwa_id_reaction: { user_id: userId, manhwa_id: manhwaId, reaction },
        },
      }),
      prisma.manhwa.update({
        where: { id: manhwaId },
        data: { [field]: { decrement: 1 } },
      }),
    ])
    return false
  }

  await prisma.$transaction([
    prisma.manhwaReaction.create({
      data: { user_id: userId, manhwa_id: manhwaId, reaction },
    }),
    prisma.manhwa.update({
      where: { id: manhwaId },
      data: { [field]: { increment: 1 } },
    }),
  ])
  return true
}
