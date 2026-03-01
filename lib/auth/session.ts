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

export async function requireSession(locale: string = 'en') {
  const session = await auth()
  if (!session?.user) {
    redirect(`/${locale}/sign-in`)
  }
  return session.user
}
