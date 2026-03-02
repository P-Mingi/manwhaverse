'use server'

import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth/session'
import { toggleManhwaReaction } from '@/lib/db/manhwa-reaction'
import type { KoreanReaction } from '@prisma/client'

const VALID_REACTIONS: KoreanReaction[] = [
  'HEOL',
  'DAEBAK',
  'GAMDONG',
  'KINGBAT',
  'MICHYEO',
  'JUKGET',
]

export async function toggleManhwaReactionAction(
  manhwaId: string,
  reaction: string
) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  if (!VALID_REACTIONS.includes(reaction as KoreanReaction)) {
    return { error: 'Invalid reaction' }
  }

  const added = await toggleManhwaReaction(
    user.id,
    manhwaId,
    reaction as KoreanReaction
  )

  revalidatePath('/[locale]/manhwa/[slug]', 'page')
  return { success: true, added }
}
