/**
 * Returns the appropriate Anilist CDN URL variant based on display size.
 * Anilist supports /large/ (full res) and /medium/ (~200px wide).
 * Non-Anilist URLs are returned unchanged.
 */
export function getAnilistCover(
  url: string | null | undefined,
  size: 'card' | 'thumb' | 'hero' = 'card',
): string {
  if (!url) return '/images/cover-placeholder.jpg'
  if (size === 'hero') return url
  if (url.includes('s4.anilist.co') || url.includes('s1.anilist.co')) {
    return url.replace('/large/', '/medium/')
  }
  return url
}
