'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { castPollVoteAction } from '@/lib/actions/poll'
import type { PollWithOptions } from '@/lib/db/poll'

interface PollWidgetProps {
  poll: PollWithOptions
  userVotedOptionIds: string[]
  locale: string
  isLoggedIn: boolean
}

export function PollWidget({
  poll,
  userVotedOptionIds,
  locale,
  isLoggedIn,
}: PollWidgetProps) {
  const t = useTranslations('poll')
  const [localVotes, setLocalVotes] = useState<string[]>(userVotedOptionIds)
  const [localOptions, setLocalOptions] = useState(poll.options)
  const [isPending, startTransition] = useTransition()

  const totalVotes = localOptions.reduce((sum, o) => sum + o.vote_count, 0)
  const hasVoted = localVotes.length > 0
  const question = locale === 'fr' && poll.question_fr ? poll.question_fr : poll.question_en

  const handleVote = (optionId: string) => {
    if (!isLoggedIn || isPending) return

    const previousVotes = localVotes
    const previousOptions = localOptions

    // Optimistic update
    setLocalVotes([optionId])
    setLocalOptions((prev) =>
      prev.map((o) => {
        let newCount = o.vote_count
        // Decrement old vote
        if (previousVotes.includes(o.id)) newCount--
        // Increment new vote
        if (o.id === optionId) newCount++
        return { ...o, vote_count: Math.max(0, newCount) }
      })
    )

    startTransition(async () => {
      const result = await castPollVoteAction(optionId)
      if (result.error) {
        setLocalVotes(previousVotes)
        setLocalOptions(previousOptions)
      }
    })
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <h3 className="mb-3 font-display text-base font-semibold text-text-primary">
        {question}
      </h3>
      <div className="space-y-2">
        {localOptions.map((option) => {
          const label = locale === 'fr' && option.label_fr ? option.label_fr : option.label_en
          const isSelected = localVotes.includes(option.id)
          const percentage = totalVotes > 0 ? Math.round((option.vote_count / totalVotes) * 100) : 0

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={!isLoggedIn || isPending}
              className={`relative flex w-full items-center rounded-lg border p-3 text-left text-sm transition-colors ${
                isSelected
                  ? 'border-crystal-blue/50 bg-crystal-blue/5'
                  : 'border-border hover:border-text-muted'
              } ${!isLoggedIn ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {/* Progress bar */}
              {hasVoted && (
                <div
                  className={`absolute inset-0 rounded-lg transition-all duration-500 ${
                    isSelected ? 'bg-crystal-blue/10' : 'bg-elevated/50'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              )}
              <span className="relative flex-1 font-medium text-text-primary">
                {label}
              </span>
              {hasVoted && (
                <span className="relative text-xs text-text-muted">{percentage}%</span>
              )}
            </button>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-text-muted">
        {t('totalVotes', { count: totalVotes })}
      </p>
    </section>
  )
}
