'use server'

import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth/session'
import { castPollVote } from '@/lib/db/poll'

export async function castPollVoteAction(optionId: string) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  if (!optionId || typeof optionId !== 'string') {
    return { error: 'Invalid option' }
  }

  try {
    await castPollVote(user.id, optionId)
  } catch {
    return { error: 'Failed to vote' }
  }

  revalidatePath('/[locale]/manhwa/[slug]', 'page')
  return { success: true }
}
