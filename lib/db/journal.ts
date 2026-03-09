import { prisma } from './client'
import type { ReadingStatus } from '@prisma/client'

export type JournalEventType = 'COMPLETED' | 'STARTED' | 'PAUSED' | 'DROPPED' | 'PLANNED' | 'REREADING'

export type JournalEvent = {
  id: string
  manhwa: {
    slug: string
    title_en: string
    title_fr: string | null
    cover_url: string | null
  }
  status: ReadingStatus
  score: number | null
  date: Date
  eventType: JournalEventType
}

function getEventType(status: ReadingStatus): JournalEventType {
  switch (status) {
    case 'COMPLETED': return 'COMPLETED'
    case 'READING': return 'STARTED'
    case 'ON_HOLD': return 'PAUSED'
    case 'DROPPED': return 'DROPPED'
    case 'PLAN_TO_READ': return 'PLANNED'
    case 'REREADING': return 'REREADING'
  }
}

function getEventDate(entry: {
  status: ReadingStatus
  started_at: Date | null
  completed_at: Date | null
  updated_at: Date
  created_at: Date
}): Date {
  switch (entry.status) {
    case 'COMPLETED':
      return entry.completed_at ?? entry.updated_at
    case 'READING':
      return entry.started_at ?? entry.created_at
    case 'PLAN_TO_READ':
      return entry.created_at
    default:
      return entry.updated_at
  }
}

export async function getUserJournal(
  userId: string,
  page = 1,
  limit = 60,
): Promise<{ events: JournalEvent[]; total: number }> {
  const [entries, total] = await Promise.all([
    prisma.userLibrary.findMany({
      where: { user_id: userId },
      select: {
        id: true,
        status: true,
        score: true,
        started_at: true,
        completed_at: true,
        updated_at: true,
        created_at: true,
        manhwa: {
          select: {
            slug: true,
            title_en: true,
            title_fr: true,
            cover_url: true,
          },
        },
      },
    }),
    prisma.userLibrary.count({ where: { user_id: userId } }),
  ])

  const events: JournalEvent[] = entries.map((entry) => ({
    id: entry.id,
    manhwa: entry.manhwa,
    status: entry.status,
    score: entry.score,
    date: getEventDate(entry),
    eventType: getEventType(entry.status),
  }))

  events.sort((a, b) => b.date.getTime() - a.date.getTime())

  const paginated = events.slice((page - 1) * limit, page * limit)
  return { events: paginated, total }
}
