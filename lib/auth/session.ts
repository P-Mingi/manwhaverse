import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export async function getSession() {
  return await auth()
}

export async function getUser() {
  const session = await auth()
  if (!session?.user) return null
  return session.user
}

export async function isAdmin(): Promise<boolean> {
  const session = await auth()
  if (!session?.user?.username) return false
  const adminUsernames = (process.env.ADMIN_USERNAMES ?? '')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean)
  return adminUsernames.includes(session.user.username)
}

export async function requireSession(locale: string = 'en') {
  const session = await auth()
  if (!session?.user) {
    redirect(`/${locale}/sign-in`)
  }
  return session.user
}

export async function requireAdmin(locale: string = 'en') {
  const session = await auth()
  if (!session?.user) {
    redirect(`/${locale}/sign-in`)
  }
  const admin = await isAdmin()
  if (!admin) {
    redirect(`/${locale}`)
  }
}
