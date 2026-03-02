import type { ContentRating, ContentFilter } from '@prisma/client'
import { prisma } from '@/lib/db/client'
import { getUser } from '@/lib/auth/session'

/**
 * Returns true if a cover should be blurred.
 * Blur if the cover is marked NSFW — unless the user has opted into ALL content.
 */
export function shouldBlurCover(
  manhwa: { cover_is_nsfw: boolean },
  userFilter: ContentFilter,
): boolean {
  if (!manhwa.cover_is_nsfw) return false
  if (userFilter === 'ALL') return false
  return true
}

/**
 * Returns true if R18 content needs a gate (interstitial).
 * Gate shows for R18 content unless user has opted into ALL.
 */
export function needsMatureGate(
  contentRating: ContentRating,
  userFilter: ContentFilter,
): boolean {
  if (contentRating !== 'R18') return false
  if (userFilter === 'ALL') return false
  return true
}

/**
 * Fetches the current user's content_filter preference.
 * Returns 'SAFE' for anonymous users (but this only affects blur/gate, not visibility).
 */
export async function getCurrentContentFilter(): Promise<ContentFilter> {
  const user = await getUser()
  if (!user) return 'SAFE'
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { content_filter: true },
  })
  return dbUser?.content_filter ?? 'SAFE'
}
