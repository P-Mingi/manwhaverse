'use client'

import { useState, useTransition } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { followAction, unfollowAction } from '@/lib/actions/follow'

interface FollowButtonProps {
  targetUserId: string
  initialFollowing: boolean
  isLoggedIn: boolean
}

export function FollowButton({
  targetUserId,
  initialFollowing,
  isLoggedIn,
}: FollowButtonProps) {
  const t = useTranslations('profile')
  const router = useRouter()
  const { locale } = useParams<{ locale: string }>()
  const [following, setFollowing] = useState(initialFollowing)
  const [isPending, startTransition] = useTransition()
  const [hover, setHover] = useState(false)

  function handleClick() {
    if (!isLoggedIn) {
      router.push(`/${locale}/sign-in`)
      return
    }

    const wasFollowing = following
    setFollowing(!wasFollowing)
    startTransition(async () => {
      if (wasFollowing) {
        await unfollowAction(targetUserId)
      } else {
        await followAction(targetUserId)
      }
    })
  }

  const label = following
    ? hover
      ? t('unfollow')
      : t('following')
    : t('follow')

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={isPending}
      className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
        following
          ? hover
            ? 'bg-error/10 text-error hover:bg-error/20'
            : 'bg-crystal-blue/20 text-crystal-blue'
          : 'bg-crystal-blue text-white hover:bg-crystal-blue/90'
      }`}
    >
      {label}
    </button>
  )
}
