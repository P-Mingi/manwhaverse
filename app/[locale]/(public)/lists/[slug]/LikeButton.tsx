'use client'

import { useState, useTransition } from 'react'
import { toggleListLikeAction } from '@/lib/actions/list'

interface LikeButtonProps {
  listId: string
  initialLiked: boolean
  initialCount: number
  likeLabel: string
  likedLabel: string
  disabled?: boolean
}

export function LikeButton({
  listId,
  initialLiked,
  initialCount,
  likeLabel,
  likedLabel,
  disabled,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (disabled) return
    const wasLiked = liked
    setLiked(!wasLiked)
    setCount((c) => (wasLiked ? c - 1 : c + 1))
    startTransition(async () => {
      const result = await toggleListLikeAction(listId)
      if (!result.success) {
        // Revert on error
        setLiked(wasLiked)
        setCount((c) => (wasLiked ? c + 1 : c - 1))
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending || disabled}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
        liked
          ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
          : 'bg-elevated text-text-secondary hover:bg-border'
      }`}
    >
      <span>{liked ? '♥' : '♡'}</span>
      <span>{liked ? likedLabel : likeLabel}</span>
      {count > 0 && <span className="font-mono text-xs">{count}</span>}
    </button>
  )
}
