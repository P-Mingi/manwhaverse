'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'
import { slugify } from '@/lib/utils/slugify'

// ─── Form-compatible update (void return for <form action> usage) ─────────────

export async function updateListFromFormAction(
  listId: string,
  locale: string,
  formData: FormData,
): Promise<void> {
  const user = await getUser()
  if (!user) return

  const list = await prisma.manhwaList.findUnique({ where: { id: listId } })
  if (!list || list.user_id !== user.id) return

  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const is_public = formData.get('is_public') === 'on'

  if (!title || title.length < 3) return

  await prisma.manhwaList.update({
    where: { id: listId },
    data: { title, description, is_public },
  })

  revalidatePath(`/${locale}/lists/${list.slug}`, 'page')
  revalidatePath(`/${locale}/lists`, 'page')
  redirect(`/${locale}/lists/${list.slug}`)
}

// ─── Search manhwas for list add ─────────────────────────────────────────────

export async function searchManhwasForListAction(query: string) {
  if (!query || query.length < 2) return []

  return prisma.manhwa.findMany({
    where: {
      OR: [
        { title_en: { contains: query, mode: 'insensitive' } },
        { title_kr: { contains: query, mode: 'insensitive' } },
        { title_fr: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: { id: true, slug: true, title_en: true, cover_url: true },
    orderBy: { reader_count: 'desc' },
    take: 8,
  })
}

export type ManhwaSearchResult = Awaited<ReturnType<typeof searchManhwasForListAction>>[number]

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function uniqueSlug(base: string): Promise<string> {
  let slug = slugify(base).slice(0, 60)
  if (!slug) slug = 'list'
  let candidate = slug
  let attempt = 0
  while (true) {
    const existing = await prisma.manhwaList.findUnique({ where: { slug: candidate } })
    if (!existing) return candidate
    attempt++
    candidate = `${slug}-${attempt}`
  }
}

// ─── Create ──────────────────────────────────────────────────────────────────

const createSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(500).optional().nullable(),
  is_public: z.boolean().default(true),
})

export async function createListAction(data: {
  title: string
  description?: string | null
  is_public?: boolean
  locale?: string
}) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const parsed = createSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const slug = await uniqueSlug(parsed.data.title)

  const list = await prisma.manhwaList.create({
    data: {
      slug,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      is_public: parsed.data.is_public ?? true,
      user_id: user.id,
    },
  })

  const locale = data.locale ?? 'en'
  revalidatePath(`/${locale}/lists`, 'page')
  redirect(`/${locale}/lists/${list.slug}`)
}

// ─── Update ──────────────────────────────────────────────────────────────────

const updateSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(500).optional().nullable(),
  is_public: z.boolean(),
})

export async function updateListAction(
  listId: string,
  data: { title: string; description?: string | null; is_public: boolean },
) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const list = await prisma.manhwaList.findUnique({ where: { id: listId } })
  if (!list || list.user_id !== user.id) return { error: 'Unauthorized' }

  const parsed = updateSchema.safeParse(data)
  if (!parsed.success) return { error: 'Invalid input' }

  await prisma.manhwaList.update({
    where: { id: listId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      is_public: parsed.data.is_public,
    },
  })

  revalidatePath(`/[locale]/lists/${list.slug}`, 'page')
  return { success: true }
}

// ─── Delete ──────────────────────────────────────────────────────────────────

export async function deleteListAction(listId: string, locale = 'en'): Promise<void> {
  const user = await getUser()
  if (!user) return

  const list = await prisma.manhwaList.findUnique({ where: { id: listId } })
  if (!list || list.user_id !== user.id) return

  await prisma.listItem.deleteMany({ where: { list_id: listId } })
  await prisma.listVote.deleteMany({ where: { list_id: listId } })
  await prisma.manhwaList.delete({ where: { id: listId } })

  revalidatePath(`/${locale}/lists`, 'page')
  redirect(`/${locale}/lists`)
}

// ─── Like / Unlike ───────────────────────────────────────────────────────────

export async function toggleListLikeAction(listId: string) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const existing = await prisma.listVote.findUnique({
    where: { user_id_list_id: { user_id: user.id, list_id: listId } },
  })

  if (existing) {
    await prisma.listVote.delete({
      where: { user_id_list_id: { user_id: user.id, list_id: listId } },
    })
    await prisma.manhwaList.update({
      where: { id: listId },
      data: { likes_count: { decrement: 1 } },
    })
    return { success: true, liked: false }
  } else {
    await prisma.listVote.create({ data: { user_id: user.id, list_id: listId } })
    await prisma.manhwaList.update({
      where: { id: listId },
      data: { likes_count: { increment: 1 } },
    })
    return { success: true, liked: true }
  }
}

// ─── Items ────────────────────────────────────────────────────────────────────

export async function addItemToListAction(listId: string, manhwaId: string, note?: string) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const list = await prisma.manhwaList.findUnique({ where: { id: listId } })
  if (!list || list.user_id !== user.id) return { error: 'Unauthorized' }

  const existing = await prisma.listItem.findUnique({
    where: { list_id_manhwa_id: { list_id: listId, manhwa_id: manhwaId } },
  })
  if (existing) return { error: 'Already in list' }

  const maxPosition = await prisma.listItem.aggregate({
    where: { list_id: listId },
    _max: { position: true },
  })
  const nextPosition = (maxPosition._max.position ?? 0) + 1

  await prisma.listItem.create({
    data: {
      list_id: listId,
      manhwa_id: manhwaId,
      position: nextPosition,
      note: note ?? null,
    },
  })

  await prisma.manhwaList.update({
    where: { id: listId },
    data: { item_count: { increment: 1 } },
  })

  // Increment manhwa list_count
  await prisma.manhwa.update({
    where: { id: manhwaId },
    data: { list_count: { increment: 1 } },
  })

  revalidatePath(`/[locale]/lists/${list.slug}`, 'page')
  return { success: true }
}

export async function removeItemFromListAction(listId: string, manhwaId: string): Promise<void> {
  const user = await getUser()
  if (!user) return

  const list = await prisma.manhwaList.findUnique({ where: { id: listId } })
  if (!list || list.user_id !== user.id) return

  await prisma.listItem.delete({
    where: { list_id_manhwa_id: { list_id: listId, manhwa_id: manhwaId } },
  })

  await prisma.manhwaList.update({
    where: { id: listId },
    data: { item_count: { decrement: 1 } },
  })

  await prisma.manhwa.update({
    where: { id: manhwaId },
    data: { list_count: { decrement: 1 } },
  })

  revalidatePath(`/[locale]/lists/${list.slug}`, 'page')
}
