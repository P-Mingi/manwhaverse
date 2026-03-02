import { prisma } from './client'
import type { ReadingStatus } from '@prisma/client'

export type LibraryMapEntry = {
  status: ReadingStatus
  is_favorite: boolean
}

export async function getUserLibraryMap(
  userId: string
): Promise<Map<string, LibraryMapEntry>> {
  const entries = await prisma.userLibrary.findMany({
    where: { user_id: userId },
    select: {
      manhwa_id: true,
      status: true,
      is_favorite: true,
    },
  })

  const map = new Map<string, LibraryMapEntry>()
  for (const e of entries) {
    map.set(e.manhwa_id, { status: e.status, is_favorite: e.is_favorite })
  }
  return map
}
