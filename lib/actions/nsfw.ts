'use server'

import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'
import type { ContentFilter } from '@prisma/client'

const VALID_FILTERS: ContentFilter[] = ['SAFE', 'MATURE', 'ALL']

export async function updateContentFilterAction(filter: ContentFilter) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  if (!VALID_FILTERS.includes(filter)) return { error: 'Invalid filter' }

  await prisma.user.update({
    where: { id: user.id },
    data: { content_filter: filter },
  })

  revalidatePath('/[locale]', 'layout')
  return { success: true }
}
