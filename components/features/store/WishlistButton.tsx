'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toggleProductWishlist } from '@/lib/actions/wishlist'

interface WishlistButtonProps {
  productId: string
  isInWishlist: boolean
  wishlistCount: number
  isLoggedIn: boolean
  locale: string
}

export function WishlistButton({
  productId,
  isInWishlist,
  wishlistCount,
  isLoggedIn,
  locale,
}: WishlistButtonProps) {
  const t = useTranslations('store')
  const [optimistic, setOptimistic] = useState(isInWishlist)
  const [count, setCount] = useState(wishlistCount)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    if (!isLoggedIn) {
      window.location.href = `/${locale}/auth/signin`
      return
    }
    setLoading(true)
    setOptimistic((prev) => !prev)
    setCount((prev) => (optimistic ? prev - 1 : prev + 1))
    try {
      await toggleProductWishlist(productId)
    } catch {
      // Revert on error
      setOptimistic((prev) => !prev)
      setCount((prev) => (optimistic ? prev + 1 : prev - 1))
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={optimistic ? t('removeFromWishlist') : t('addToWishlist')}
      className={`flex items-center gap-1 text-xs transition-colors ${
        optimistic ? 'text-pink-400' : 'text-text-muted hover:text-pink-400'
      }`}
    >
      <svg
        className={`h-3.5 w-3.5 ${optimistic ? 'fill-current' : ''}`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        fill="none"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {count > 0 && <span>{count}</span>}
    </button>
  )
}
