import { prisma } from './client'

export type PollWithOptions = {
  id: string
  question_en: string
  question_fr: string | null
  manhwa_id: string | null
  is_active: boolean
  ends_at: Date | null
  options: Array<{
    id: string
    label_en: string
    label_fr: string | null
    vote_count: number
    position: number
  }>
}

export async function getActivePollForManhwa(
  manhwaId: string
): Promise<PollWithOptions | null> {
  return prisma.poll.findFirst({
    where: { manhwa_id: manhwaId, is_active: true },
    include: {
      options: {
        orderBy: { position: 'asc' },
      },
    },
    orderBy: { created_at: 'desc' },
  })
}

export async function getActiveGlobalPoll(): Promise<PollWithOptions | null> {
  return prisma.poll.findFirst({
    where: { manhwa_id: null, is_active: true },
    include: {
      options: {
        orderBy: { position: 'asc' },
      },
    },
    orderBy: { created_at: 'desc' },
  })
}

export async function getUserPollVotes(
  userId: string,
  pollId: string
): Promise<string[]> {
  const votes = await prisma.pollVote.findMany({
    where: {
      user_id: userId,
      option: { poll_id: pollId },
    },
    select: { option_id: true },
  })
  return votes.map((v) => v.option_id)
}

export async function castPollVote(
  userId: string,
  optionId: string
): Promise<void> {
  // Get the poll for this option
  const option = await prisma.pollOption.findUnique({
    where: { id: optionId },
    select: { poll_id: true, poll: { select: { options: { select: { id: true } } } } },
  })
  if (!option) throw new Error('Option not found')

  // Remove any existing votes for this poll
  const optionIds = option.poll.options.map((o) => o.id)
  const existingVotes = await prisma.pollVote.findMany({
    where: { user_id: userId, option_id: { in: optionIds } },
  })

  await prisma.$transaction([
    // Remove old votes and decrement counters
    ...existingVotes.map((v) =>
      prisma.pollVote.delete({
        where: { user_id_option_id: { user_id: userId, option_id: v.option_id } },
      })
    ),
    ...existingVotes.map((v) =>
      prisma.pollOption.update({
        where: { id: v.option_id },
        data: { vote_count: { decrement: 1 } },
      })
    ),
    // Add new vote
    prisma.pollVote.create({
      data: { user_id: userId, option_id: optionId },
    }),
    prisma.pollOption.update({
      where: { id: optionId },
      data: { vote_count: { increment: 1 } },
    }),
  ])
}
