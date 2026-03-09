'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'

// ─── Create post ──────────────────────────────────────────────────────────────

const createSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional().nullable(),
  manhwa_id: z.string().optional().nullable(),
  is_original: z.boolean(),
  credit_name: z.string().max(200).optional().nullable(),
  credit_url: z.string().url().optional().nullable().or(z.literal('')),
  is_nsfw: z.boolean(),
  tags: z.array(z.string().max(50)).max(10),
  image_urls: z.array(z.string().url()).min(1).max(10),
  locale: z.string().default('en'),
})

export async function createFanArtAction(data: z.input<typeof createSchema>) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const parsed = createSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const d = parsed.data

  if (!d.is_original && !d.credit_name) {
    return { error: 'Credit is required for non-original artwork' }
  }

  const post = await prisma.fanArtPost.create({
    data: {
      user_id: user.id,
      manhwa_id: d.manhwa_id ?? null,
      title: d.title,
      description: d.description ?? null,
      is_original: d.is_original,
      credit_name: d.is_original ? null : (d.credit_name ?? null),
      credit_url: d.is_original ? null : (d.credit_url || null),
      is_nsfw: d.is_nsfw,
      tags: d.tags,
    },
  })

  // Create image records (URL-based, same URL for all sizes)
  await prisma.fanArtImage.createMany({
    data: d.image_urls.map((url, i) => ({
      post_id: post.id,
      position: i + 1,
      image_url: url,
      thumb_url: url,
      alt_text: `${d.title} — image ${i + 1}`,
    })),
  })

  // Mark user as artist on first post
  await prisma.user.update({
    where: { id: user.id },
    data: { is_artist: true },
  })

  revalidatePath(`/${d.locale}/artwork`)
  redirect(`/${d.locale}/artwork/${post.id}`)
}

// ─── Like / Unlike ────────────────────────────────────────────────────────────

export async function toggleFanArtLikeAction(postId: string) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const existing = await prisma.fanArtLike.findUnique({
    where: { user_id_post_id: { user_id: user.id, post_id: postId } },
  })

  if (existing) {
    await prisma.fanArtLike.delete({
      where: { user_id_post_id: { user_id: user.id, post_id: postId } },
    })
    await prisma.fanArtPost.update({
      where: { id: postId },
      data: { like_count: { decrement: 1 } },
    })
    return { success: true, liked: false }
  } else {
    await prisma.fanArtLike.create({ data: { user_id: user.id, post_id: postId } })
    await prisma.fanArtPost.update({
      where: { id: postId },
      data: { like_count: { increment: 1 } },
    })
    return { success: true, liked: true }
  }
}

// ─── Comment ──────────────────────────────────────────────────────────────────

const commentSchema = z.object({
  postId: z.string().min(1),
  content: z.string().min(1).max(1000),
  parentId: z.string().optional().nullable(),
})

export async function addFanArtCommentAction(data: z.input<typeof commentSchema>) {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const parsed = commentSchema.safeParse(data)
  if (!parsed.success) return { error: 'Invalid input' }

  const { postId, content, parentId } = parsed.data

  await prisma.fanArtComment.create({
    data: {
      user_id: user.id,
      post_id: postId,
      content,
      parent_id: parentId ?? null,
    },
  })

  await prisma.fanArtPost.update({
    where: { id: postId },
    data: { comment_count: { increment: 1 } },
  })

  revalidatePath('/[locale]/artwork/[postId]', 'page')
  return { success: true }
}

// ─── Delete post (owner or admin) ─────────────────────────────────────────────

export async function deleteFanArtAction(postId: string, locale = 'en'): Promise<void> {
  const user = await getUser()
  if (!user) return

  const post = await prisma.fanArtPost.findUnique({ where: { id: postId } })
  if (!post || post.user_id !== user.id) return

  await prisma.fanArtComment.deleteMany({ where: { post_id: postId } })
  await prisma.fanArtLike.deleteMany({ where: { post_id: postId } })
  await prisma.fanArtImage.deleteMany({ where: { post_id: postId } })
  await prisma.fanArtPost.delete({ where: { id: postId } })

  revalidatePath(`/${locale}/artwork`)
  redirect(`/${locale}/artwork`)
}
