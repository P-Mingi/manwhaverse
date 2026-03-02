'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth/session'
import { castCharacterVote } from '@/lib/db/character-vote'

const schema = z.object({
  manhwaId: z.string().min(1),
  characterId: z.string().min(1),
})

export async function castCharacterVoteAction(
  manhwaId: string,
  characterId: string
) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const parsed = schema.safeParse({ manhwaId, characterId })
  if (!parsed.success) return { error: 'Invalid input' }

  await castCharacterVote(user.id, parsed.data.manhwaId, parsed.data.characterId)

  revalidatePath('/[locale]/manhwa/[slug]', 'page')
  return { success: true }
}
