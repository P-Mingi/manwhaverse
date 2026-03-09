import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/session'
import { getUser } from '@/lib/auth/session'
import { MODERATOR_USERNAMES } from '@/lib/auth/moderators'
import { prisma } from '@/lib/db/client'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const sessionUser = await getUser()
  if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminOk = await isAdmin()
  const modOk = sessionUser.username && MODERATOR_USERNAMES.includes(sessionUser.username)
  if (!adminOk && !modOk) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { username } = await params

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      display_name: true,
      avatar_url: true,
      bio: true,
      reviews: {
        where: { deleted_at: null },
        select: {
          id: true,
          content: true,
          created_at: true,
          manhwa: { select: { title_en: true, slug: true } },
        },
        orderBy: { created_at: 'desc' },
        take: 50,
      },
    },
  })

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(user)
}
