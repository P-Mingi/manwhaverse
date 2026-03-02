import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth/session'
import { getNotifications } from '@/lib/db/notification'

export async function GET(request: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ notifications: [], total: 0 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50)

  const result = await getNotifications(user.id, page, limit)
  return NextResponse.json(result)
}
