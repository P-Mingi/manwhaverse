import { prisma } from './client'
import type { ReadingStatus, Prisma } from '@prisma/client'

const libraryWithManhwa = {
  manhwa: {
    select: {
      id: true,
      slug: true,
      title_en: true,
      title_fr: true,
      cover_url: true,
      type: true,
      status: true,
      score_avg: true,
      score_count: true,
      ext_score_composite: true,
      chapter_count: true,
      reader_count: true,
      genre_links: {
        include: { genre: { select: { slug: true, name_en: true, name_fr: true } } },
        take: 3,
      },
    },
  },
} satisfies Prisma.UserLibraryInclude

export type LibraryEntryWithManhwa = Prisma.UserLibraryGetPayload<{
  include: typeof libraryWithManhwa
}>

export type LibrarySort = 'updated' | 'score' | 'title' | 'added'

const sortMap: Record<LibrarySort, Prisma.UserLibraryOrderByWithRelationInput> = {
  updated: { updated_at: 'desc' },
  score: { score: { sort: 'desc', nulls: 'last' } },
  title: { manhwa: { title_en: 'asc' } },
  added: { created_at: 'desc' },
}

export async function getUserLibrary(
  userId: string,
  status?: ReadingStatus,
  sort: LibrarySort = 'updated'
): Promise<LibraryEntryWithManhwa[]> {
  return prisma.userLibrary.findMany({
    where: {
      user_id: userId,
      ...(status ? { status } : {}),
    },
    include: libraryWithManhwa,
    orderBy: sortMap[sort],
  })
}

export async function getLibraryCounts(userId: string) {
  const counts = await prisma.userLibrary.groupBy({
    by: ['status'],
    where: { user_id: userId },
    _count: true,
  })

  const result: Partial<Record<ReadingStatus, number>> = {}
  let total = 0
  for (const c of counts) {
    result[c.status] = c._count
    total += c._count
  }
  return { ...result, total }
}

export async function getLibraryEntry(userId: string, manhwaId: string) {
  return prisma.userLibrary.findUnique({
    where: { user_id_manhwa_id: { user_id: userId, manhwa_id: manhwaId } },
  })
}

export async function upsertLibraryEntry(
  userId: string,
  manhwaId: string,
  data: {
    status: ReadingStatus
    score?: number | null
    progress?: number
    is_favorite?: boolean
  }
) {
  const now = new Date()
  const entry = await prisma.userLibrary.upsert({
    where: { user_id_manhwa_id: { user_id: userId, manhwa_id: manhwaId } },
    create: {
      user_id: userId,
      manhwa_id: manhwaId,
      status: data.status,
      score: data.score,
      progress: data.progress ?? 0,
      is_favorite: data.is_favorite ?? false,
      started_at: data.status === 'READING' ? now : undefined,
      completed_at: data.status === 'COMPLETED' ? now : undefined,
    },
    update: {
      status: data.status,
      ...(data.score !== undefined ? { score: data.score } : {}),
      ...(data.progress !== undefined ? { progress: data.progress } : {}),
      ...(data.is_favorite !== undefined ? { is_favorite: data.is_favorite } : {}),
      ...(data.status === 'COMPLETED' ? { completed_at: now } : {}),
      ...(data.status === 'READING' ? { started_at: now } : {}),
    },
  })

  // Update denormalized counters
  await recalculateManhwaCounters(manhwaId)

  return entry
}

export async function removeFromLibrary(userId: string, manhwaId: string) {
  const entry = await prisma.userLibrary.findUnique({
    where: { user_id_manhwa_id: { user_id: userId, manhwa_id: manhwaId } },
  })
  if (!entry) return

  await prisma.userLibrary.delete({
    where: { user_id_manhwa_id: { user_id: userId, manhwa_id: manhwaId } },
  })

  await recalculateManhwaCounters(manhwaId)
}

async function recalculateManhwaCounters(manhwaId: string) {
  const [readerCount, scores, favoriteCount] = await Promise.all([
    prisma.userLibrary.count({ where: { manhwa_id: manhwaId } }),
    prisma.userLibrary.findMany({
      where: { manhwa_id: manhwaId, score: { not: null } },
      select: { score: true },
    }),
    prisma.userLibrary.count({ where: { manhwa_id: manhwaId, is_favorite: true } }),
  ])

  const scoreValues = scores.map((s) => s.score!).filter((s) => s > 0)
  const scoreCount = scoreValues.length
  const scoreAvg = scoreCount > 0
    ? scoreValues.reduce((a, b) => a + b, 0) / scoreCount
    : null
  const scoreStddev = scoreCount > 1
    ? Math.sqrt(
        scoreValues.reduce((sum, s) => sum + Math.pow(s - scoreAvg!, 2), 0) / (scoreCount - 1)
      )
    : null

  await prisma.manhwa.update({
    where: { id: manhwaId },
    data: {
      reader_count: readerCount,
      score_count: scoreCount,
      score_avg: scoreAvg,
      score_stddev: scoreStddev,
      favorite_count: favoriteCount,
    },
  })
}
