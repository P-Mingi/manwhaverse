'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/session'
import { upsertChallenge } from '@/lib/db/challenge'

export async function setChallengeGoalAction(year: number, formData: FormData): Promise<void> {
  const user = await getUser()
  if (!user) redirect('/sign-in')

  const raw = formData.get('goal')
  const goal = parseInt(raw as string, 10)
  if (!goal || goal < 1 || goal > 999) return

  await upsertChallenge(user.id, year, goal)

  revalidatePath(`/challenge/${year}`, 'page')
  revalidatePath(`/profile`, 'page')
}
