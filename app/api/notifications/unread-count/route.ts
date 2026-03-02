import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth/session'
import { getUnreadCount } from '@/lib/db/notification'

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ count: 0 })

  const count = await getUnreadCount(user.id)
  return NextResponse.json({ count })
}
