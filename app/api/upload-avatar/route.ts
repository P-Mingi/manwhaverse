import { getUser } from '@/lib/auth/session'
import { updateUserProfile } from '@/lib/db/user'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: Request) {
  const user = await getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })
  if (file.size > MAX_SIZE) return Response.json({ error: 'File too large (max 5MB)' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) return Response.json({ error: 'Invalid file type' }, { status: 400 })

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const token = process.env.CLOUDFLARE_IMAGES_TOKEN

  if (!accountId || !token) {
    return Response.json({ error: 'Image upload not configured' }, { status: 500 })
  }

  const cfForm = new FormData()
  cfForm.append('file', file)

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: cfForm,
    },
  )

  if (!res.ok) {
    return Response.json({ error: 'Upload failed' }, { status: 500 })
  }

  const data = await res.json()
  const avatarUrl: string = data.result.variants[0]

  await updateUserProfile(user.id, { avatar_url: avatarUrl })

  return Response.json({ url: avatarUrl })
}
