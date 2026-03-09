import { prisma } from '@/lib/db/client'
import { revalidatePath } from 'next/cache'

// Auto-publishes user-submitted draft articles that have been waiting > 2 hours
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago

  const articles = await prisma.article.findMany({
    where: {
      status: 'DRAFT',
      NOT: { category: 'NEWS' },
      created_at: { lt: cutoff },
    },
    select: { id: true },
  })

  if (articles.length === 0) {
    return Response.json({ published: 0, timestamp: new Date().toISOString() })
  }

  await prisma.article.updateMany({
    where: { id: { in: articles.map((a) => a.id) } },
    data: { status: 'PUBLISHED', published_at: new Date() },
  })

  revalidatePath('/[locale]/blog', 'page')

  return Response.json({
    published: articles.length,
    timestamp: new Date().toISOString(),
  })
}
