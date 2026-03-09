import { prisma } from '@/lib/db/client'

export type ProductWithLinks = {
  id: string
  type: string
  title_en: string
  title_fr: string | null
  cover_url: string | null
  language: string | null
  price_amount: number | null
  price_currency: string | null
  price_updated_at: Date | null
  asin: string | null
  is_featured: boolean
  position: number
  manhwa: {
    id: string
    slug: string
    title_en: string
    title_fr: string | null
    cover_url: string | null
  }
  links: Array<{
    id: string
    marketplace_id: string
    url: string
    price_amount: number | null
    price_currency: string | null
    price_updated_at: Date | null
    is_available: boolean
  }>
  _count: {
    wishlists: number
  }
}

const PRODUCT_SELECT = {
  id: true,
  type: true,
  title_en: true,
  title_fr: true,
  cover_url: true,
  language: true,
  price_amount: true,
  price_currency: true,
  price_updated_at: true,
  asin: true,
  is_featured: true,
  position: true,
  manhwa: {
    select: {
      id: true,
      slug: true,
      title_en: true,
      title_fr: true,
      cover_url: true,
    },
  },
  links: {
    select: {
      id: true,
      marketplace_id: true,
      url: true,
      price_amount: true,
      price_currency: true,
      price_updated_at: true,
      is_available: true,
    },
    where: { is_available: true },
  },
  _count: {
    select: { wishlists: true },
  },
} as const

export async function getFeaturedProducts(limit = 8): Promise<ProductWithLinks[]> {
  return prisma.manhwaProduct.findMany({
    where: { is_featured: true },
    select: PRODUCT_SELECT,
    orderBy: { position: 'asc' },
    take: limit,
  }) as unknown as ProductWithLinks[]
}

export async function getProductsForStore(opts: {
  category?: string
  manhwaSlug?: string
  q?: string
  limit?: number
}): Promise<ProductWithLinks[]> {
  const { category, manhwaSlug, q, limit = 100 } = opts
  return prisma.manhwaProduct.findMany({
    where: {
      ...(category ? { type: category as never } : {}),
      ...(manhwaSlug ? { manhwa: { slug: manhwaSlug } } : {}),
      ...(q ? { OR: [
        { title_en: { contains: q, mode: 'insensitive' } },
        { title_fr: { contains: q, mode: 'insensitive' } },
      ]} : {}),
    },
    select: PRODUCT_SELECT,
    orderBy: [{ position: 'asc' }, { created_at: 'desc' }],
    take: limit,
  }) as unknown as ProductWithLinks[]
}

export async function getProductsForManhwa(manhwaId: string): Promise<ProductWithLinks[]> {
  return prisma.manhwaProduct.findMany({
    where: { manhwa_id: manhwaId },
    select: PRODUCT_SELECT,
    orderBy: [{ position: 'asc' }, { type: 'asc' }],
    take: 6,
  }) as unknown as ProductWithLinks[]
}

export async function getRecommendedProducts(userId: string, limit = 8): Promise<ProductWithLinks[]> {
  const userLibrary = await prisma.userLibrary.findMany({
    where: { user_id: userId, status: { in: ['COMPLETED', 'READING'] } },
    select: { manhwa_id: true },
    take: 50,
    orderBy: { score: 'desc' },
  })
  const manhwaIds = userLibrary.map((l) => l.manhwa_id)
  if (manhwaIds.length === 0) return []

  return prisma.manhwaProduct.findMany({
    where: {
      manhwa_id: { in: manhwaIds },
      NOT: { wishlists: { some: { user_id: userId } } },
    },
    select: PRODUCT_SELECT,
    orderBy: { wishlists: { _count: 'desc' } },
    take: limit,
  }) as unknown as ProductWithLinks[]
}

export async function getUserWishlist(userId: string): Promise<ProductWithLinks[]> {
  const items = await prisma.productWishlist.findMany({
    where: { user_id: userId },
    select: { product: { select: PRODUCT_SELECT } },
    orderBy: { created_at: 'desc' },
  })
  return items.map((i) => i.product) as unknown as ProductWithLinks[]
}

export async function getUserWishlistSet(userId: string): Promise<Set<string>> {
  const items = await prisma.productWishlist.findMany({
    where: { user_id: userId },
    select: { product_id: true },
  })
  return new Set(items.map((i) => i.product_id))
}
