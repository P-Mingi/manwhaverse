'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/client'
import { requireSession } from '@/lib/auth/session'

export async function toggleProductWishlist(productId: string): Promise<{ wishlisted: boolean }> {
  const session = await requireSession()

  const existing = await prisma.productWishlist.findUnique({
    where: { user_id_product_id: { user_id: session.id, product_id: productId } },
  })

  if (existing) {
    await prisma.productWishlist.delete({
      where: { user_id_product_id: { user_id: session.id, product_id: productId } },
    })
    revalidatePath('/store')
    return { wishlisted: false }
  } else {
    await prisma.productWishlist.create({
      data: { user_id: session.id, product_id: productId },
    })
    revalidatePath('/store')
    return { wishlisted: true }
  }
}
