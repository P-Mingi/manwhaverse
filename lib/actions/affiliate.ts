'use server'

import { prisma } from '@/lib/db/client'
import { getUser } from '@/lib/auth/session'

export async function trackAffiliateClick(
  manhwaId: string,
  productId: string | null,
  platform: string,
  url: string
) {
  try {
    const user = await getUser()
    await prisma.affiliateClick.create({
      data: {
        user_id: user?.id ?? null,
        manhwa_id: manhwaId,
        product_id: productId,
        platform,
        url,
      },
    })
  } catch {
    // Fire-and-forget — never block the user
  }
}
