import { prisma } from './client'

export interface ChallengeProgress {
  goal: number
  completed: number
  percent: number
  isCompleted: boolean
  recentCompleted: {
    manhwa_id: string
    completed_at: Date
    manhwa: { title_en: string; slug: string; cover_url: string | null }
  }[]
}

export async function getChallenge(userId: string, year: number) {
  return prisma.readingChallenge.findUnique({
    where: { user_id_year: { user_id: userId, year } },
  })
}

export async function getChallengeProgress(
  userId: string,
  year: number
): Promise<ChallengeProgress | null> {
  const challenge = await prisma.readingChallenge.findUnique({
    where: { user_id_year: { user_id: userId, year } },
  })
  if (!challenge) return null

  const start = new Date(`${year}-01-01T00:00:00.000Z`)
  const end = new Date(`${year + 1}-01-01T00:00:00.000Z`)

  const [completedEntries, recentCompleted] = await Promise.all([
    prisma.userLibrary.count({
      where: {
        user_id: userId,
        status: 'COMPLETED',
        completed_at: { gte: start, lt: end },
      },
    }),
    prisma.userLibrary.findMany({
      where: {
        user_id: userId,
        status: 'COMPLETED',
        completed_at: { gte: start, lt: end },
      },
      select: {
        manhwa_id: true,
        completed_at: true,
        manhwa: { select: { title_en: true, slug: true, cover_url: true } },
      },
      orderBy: { completed_at: 'desc' },
      take: 6,
    }),
  ])

  const percent = Math.min(100, Math.round((completedEntries / challenge.goal) * 100))

  return {
    goal: challenge.goal,
    completed: completedEntries,
    percent,
    isCompleted: completedEntries >= challenge.goal,
    recentCompleted: recentCompleted.map((e) => ({
      ...e,
      completed_at: e.completed_at!,
    })),
  }
}

export async function upsertChallenge(userId: string, year: number, goal: number) {
  return prisma.readingChallenge.upsert({
    where: { user_id_year: { user_id: userId, year } },
    create: { user_id: userId, year, goal },
    update: { goal },
  })
}

/** Lightweight version for profile widgets */
export async function getChallengeSummary(userId: string, year: number) {
  const challenge = await prisma.readingChallenge.findUnique({
    where: { user_id_year: { user_id: userId, year } },
    select: { goal: true },
  })
  if (!challenge) return null

  const start = new Date(`${year}-01-01T00:00:00.000Z`)
  const end = new Date(`${year + 1}-01-01T00:00:00.000Z`)

  const completed = await prisma.userLibrary.count({
    where: {
      user_id: userId,
      status: 'COMPLETED',
      completed_at: { gte: start, lt: end },
    },
  })

  return {
    goal: challenge.goal,
    completed,
    percent: Math.min(100, Math.round((completed / challenge.goal) * 100)),
    isCompleted: completed >= challenge.goal,
  }
}
