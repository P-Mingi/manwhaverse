'use client'

import { useState, useTransition } from 'react'
import { addToLibraryAction, toggleFavoriteAction } from '@/lib/actions/library'
import type { ReadingStatus } from '@prisma/client'

interface ManhwaCardOverlayProps {
  manhwaId: string
  libraryStatus: ReadingStatus | null
  isFavorite: boolean
  isLoggedIn: boolean
}

export function ManhwaCardOverlay({
  manhwaId,
  libraryStatus,
  isFavorite,
  isLoggedIn,
}: ManhwaCardOverlayProps) {
  const [localInLibrary, setLocalInLibrary] = useState(!!libraryStatus)
  const [localFavorite, setLocalFavorite] = useState(isFavorite)
  const [isPending, startTransition] = useTransition()

  if (!isLoggedIn) return null

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (localInLibrary) return

    setLocalInLibrary(true)
    startTransition(async () => {
      const formData = new FormData()
      formData.set('manhwaId', manhwaId)
      formData.set('status', 'PLAN_TO_READ')
      const result = await addToLibraryAction(formData)
      if (result.error) setLocalInLibrary(false)
    })
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!localInLibrary && !libraryStatus) return

    setLocalFavorite((prev) => !prev)
    startTransition(async () => {
      const result = await toggleFavoriteAction(manhwaId)
      if (result.error) setLocalFavorite(isFavorite)
    })
  }

  return (
    <div className="absolute inset-0 z-10 hidden items-start justify-end gap-1 p-1.5 group-hover:flex">
      {/* Quick add to library */}
      {!localInLibrary && (
        <button
          onClick={handleQuickAdd}
          disabled={isPending}
          className="flex h-7 w-7 items-center justify-center rounded-md bg-base/80 text-text-secondary backdrop-blur-sm transition-colors hover:bg-crystal-blue hover:text-white"
          title="Add to library"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {/* Favorite toggle */}
      {(localInLibrary || !!libraryStatus) && (
        <button
          onClick={handleFavorite}
          disabled={isPending}
          className={`flex h-7 w-7 items-center justify-center rounded-md backdrop-blur-sm transition-colors ${
            localFavorite
              ? 'bg-crystal-red/80 text-white'
              : 'bg-base/80 text-text-secondary hover:bg-crystal-red hover:text-white'
          }`}
          title="Favorite"
        >
          <svg className="h-4 w-4" fill={localFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      )}
    </div>
  )
}
