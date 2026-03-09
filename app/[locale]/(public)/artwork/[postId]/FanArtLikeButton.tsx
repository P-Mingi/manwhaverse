'use client'

import { useState, useTransition } from 'react'
import { toggleFanArtLikeAction } from '@/lib/actions/fan-art'

interface Props {
  postId: string
  initialLiked: boolean
  initialCount: number
  disabled?: boolean
}

export function FanArtLikeButton({ postId, initialLiked, initialCount, disabled }: Props) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (disabled) return
    const wasLiked = liked
    setLiked(!wasLiked)
    setCount((c) => (wasLiked ? c - 1 : c + 1))
    startTransition(async () => {
      const res = await toggleFanArtLikeAction(postId)
      if (!res.success) {
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
      <span className="text-base">{liked ? '♥' : '♡'}</span>
      <span>{count}</span>
    </button>
  )
}
