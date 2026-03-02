'use client'

import { useState, useTransition } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toggleFavoriteAction, addToLibraryAction } from '@/lib/actions/library'

interface FavoriteButtonProps {
  manhwaId: string
  isFavorite: boolean
  isInLibrary: boolean
  isLoggedIn: boolean
}

export function FavoriteButton({
  manhwaId,
  isFavorite: initialFavorite,
  isInLibrary,
  isLoggedIn,
}: FavoriteButtonProps) {
  const router = useRouter()
  const { locale } = useParams<{ locale: string }>()
  const [favorite, setFavorite] = useState(initialFavorite)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!isLoggedIn) {
      router.push(`/${locale}/sign-in`)
      return
    }

    setFavorite(!favorite)
    startTransition(async () => {
      // Auto-add to library if not already in it
      if (!isInLibrary) {
        const form = new FormData()
        form.set('manhwaId', manhwaId)
        form.set('status', 'PLAN_TO_READ')
        await addToLibraryAction(form)
      }
      await toggleFavoriteAction(manhwaId)
    })
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={isPending}
      whileTap={{ scale: 0.8 }}
      className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors disabled:opacity-50 ${
        favorite
          ? 'border-red-500/30 bg-red-500/10 text-red-500'
          : 'border-border bg-surface text-text-muted hover:border-text-muted hover:text-text-secondary'
      }`}
      aria-label="Favorite"
    >
      <motion.svg
        viewBox="0 0 24 24"
        className={`h-5 w-5 ${favorite ? 'fill-red-500' : 'fill-none'}`}
        stroke="currentColor"
        strokeWidth={2}
        animate={favorite ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        />
      </motion.svg>
    </motion.button>
  )
}
