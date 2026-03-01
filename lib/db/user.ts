import { prisma } from './client'

export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      display_name: true,
      avatar_url: true,
      bio: true,
      locale: true,
      reader_class: true,
      reading_streak: true,
      total_chapters_read: true,
      total_manhwas_completed: true,
      created_at: true,
      _count: {
        select: {
          library: true,
          reviews: true,
          follows: true,
          followers: true,
        },
      },
    },
  })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      display_name: true,
      avatar_url: true,
      bio: true,
      locale: true,
      reader_class: true,
      reading_streak: true,
      longest_streak: true,
      total_chapters_read: true,
      total_manhwas_completed: true,
      created_at: true,
      _count: {
        select: {
          library: true,
          reviews: true,
          follows: true,
          followers: true,
        },
      },
    },
  })
}

export async function updateUserProfile(
  userId: string,
  data: {
    display_name?: string
    bio?: string
    avatar_url?: string
    locale?: string
  }
) {
  return prisma.user.update({
    where: { id: userId },
    data,
  })
}
