'use client'

import { useState, useTransition } from 'react'
import { followAction, unfollowAction } from '@/lib/actions/follow'

interface Props {
  targetUserId: string
  initialFollowing: boolean
  isLoggedIn: boolean
  locale?: string
}

export function FollowButton({ targetUserId, initialFollowing, isLoggedIn, locale = 'en' }: Props) {
  const [following, setFollowing] = useState(initialFollowing)
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    if (!isLoggedIn) return
    startTransition(async () => {
      if (following) {
        await unfollowAction(targetUserId)
        setFollowing(false)
      } else {
        await followAction(targetUserId)
        setFollowing(true)
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending || !isLoggedIn}
      className={following ? 'btn-secondary' : 'btn-primary'}
    >
      {isPending
        ? '...'
        : following
          ? locale === 'fr' ? 'Ne plus suivre' : 'Unfollow'
          : locale === 'fr' ? 'Suivre' : 'Follow'}
    </button>
  )
}
