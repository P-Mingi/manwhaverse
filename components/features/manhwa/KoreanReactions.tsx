'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { toggleManhwaReactionAction } from '@/lib/actions/reaction'
import type { KoreanReaction } from '@prisma/client'

const REACTION_EMOJI: Record<KoreanReaction, string> = {
  HEOL: '헐',
  DAEBAK: '대박',
  GAMDONG: '감동',
  KINGBAT: '킹받',
  MICHYEO: '미쳤',
  JUKGET: '죽겠',
}

interface KoreanReactionsProps {
  manhwaId: string
  counts: Record<KoreanReaction, number>
  userReactions: KoreanReaction[]
  isLoggedIn: boolean
}

export function KoreanReactions({
  manhwaId,
  counts,
  userReactions,
  isLoggedIn,
}: KoreanReactionsProps) {
  const t = useTranslations('manhwa.reactions')
  const [localCounts, setLocalCounts] = useState(counts)
  const [localUserReactions, setLocalUserReactions] = useState<KoreanReaction[]>(userReactions)
  const [isPending, startTransition] = useTransition()

  const handleToggle = (reaction: KoreanReaction) => {
    if (!isLoggedIn) return

    const wasActive = localUserReactions.includes(reaction)

    // Optimistic update
    setLocalCounts((prev) => ({
      ...prev,
      [reaction]: prev[reaction] + (wasActive ? -1 : 1),
    }))
    setLocalUserReactions((prev) =>
      wasActive ? prev.filter((r) => r !== reaction) : [...prev, reaction]
    )

    startTransition(async () => {
      const result = await toggleManhwaReactionAction(manhwaId, reaction)
      if (result.error) {
        // Revert on error
        setLocalCounts(counts)
        setLocalUserReactions(userReactions)
      }
    })
  }

  const reactions = Object.keys(REACTION_EMOJI) as KoreanReaction[]

  return (
    <section>
      <h2 className="mb-3 font-display text-lg font-semibold">{t('title')}</h2>
      <div className="flex flex-wrap gap-2">
        {reactions.map((reaction) => {
          const isActive = localUserReactions.includes(reaction)
          const count = localCounts[reaction] ?? 0

          return (
            <button
              key={reaction}
              onClick={() => handleToggle(reaction)}
              disabled={isPending || !isLoggedIn}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                isActive
                  ? 'border-crystal-blue/50 bg-crystal-blue/10 text-crystal-blue'
                  : 'border-border bg-surface text-text-secondary hover:border-text-muted'
              } ${!isLoggedIn ? 'cursor-default opacity-60' : 'cursor-pointer'}`}
              title={t(reaction)}
            >
              <span className="text-base">{REACTION_EMOJI[reaction]}</span>
              <span className="text-xs font-medium">{t(reaction)}</span>
              {count > 0 && (
                <span className="ml-0.5 text-xs text-text-muted">{count}</span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
