import type { ContentRating, ContentFilter } from '@prisma/client'
import { getUser } from '@/lib/auth/session'

/**
 * Returns true if a cover should be blurred.
 * Blur if the cover is R18 or marked NSFW — unless the user has opted into ALL content.
 */
export function shouldBlurCover(
  manhwa: { cover_is_nsfw: boolean; content_rating?: ContentRating },
  userFilter: ContentFilter,
): boolean {
  if (userFilter === 'ALL') return false
  if (manhwa.cover_is_nsfw || manhwa.content_rating === 'R18') return true
  return false
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
 * Returns the current user's content_filter preference from JWT session.
 * No DB query — reads directly from the session token.
 * Returns 'SAFE' for anonymous users.
 */
export async function getCurrentContentFilter(): Promise<ContentFilter> {
  const user = await getUser()
  return (user?.content_filter as ContentFilter) ?? 'SAFE'
}
