import { notFound } from 'next/navigation'
import { getUserByUsername } from '@/lib/db/user'
import { PageContainer } from '@/components/layouts/PageContainer'

export const revalidate = 300

interface JournalPageProps {
  params: Promise<{ locale: string; username: string }>
}

export async function generateMetadata({ params }: JournalPageProps) {
  const { username } = await params
  return { title: `${username} — Journal` }
}

export default async function JournalPage({ params }: JournalPageProps) {
  const { username } = await params
  const user = await getUserByUsername(username)
  if (!user) notFound()

  // Journal feature removed in V2
  notFound()
}
