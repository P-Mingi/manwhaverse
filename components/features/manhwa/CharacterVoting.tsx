'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { castCharacterVoteAction } from '@/lib/actions/character-vote'
import type { CharacterVoteRanking } from '@/lib/db/character-vote'

interface CharacterVotingProps {
  manhwaId: string
  rankings: CharacterVoteRanking[]
  userVote: string | null
  characters: Array<{
    character_id: string
    character: {
      id: string
      name_en: string
      image_url: string | null
    }
    role: string
  }>
  isLoggedIn: boolean
}

export function CharacterVoting({
  manhwaId,
  rankings,
  userVote,
  characters,
  isLoggedIn,
}: CharacterVotingProps) {
  const t = useTranslations('manhwa.characterVote')
  const [localVote, setLocalVote] = useState(userVote)
  const [localRankings, setLocalRankings] = useState(rankings)
  const [isPending, startTransition] = useTransition()

  // Merge voteable characters with rankings
  const voteable = characters
    .filter((c) => c.role === 'MAIN' || c.role === 'SUPPORTING')
    .map((c) => {
      const ranking = localRankings.find((r) => r.character_id === c.character_id)
      return {
        id: c.character_id,
        name: c.character.name_en,
        image: c.character.image_url,
        role: c.role,
        votes: ranking?.vote_count ?? 0,
      }
    })
    .sort((a, b) => b.votes - a.votes)

  const totalVotes = voteable.reduce((sum, c) => sum + c.votes, 0)

  const handleVote = (characterId: string) => {
    if (!isLoggedIn || isPending) return

    const previousVote = localVote
    const isToggleOff = previousVote === characterId

    setLocalVote(isToggleOff ? null : characterId)

    // Optimistic update
    setLocalRankings((prev) => {
      const updated = [...prev]
      // Decrement previous vote
      if (previousVote) {
        const prevIdx = updated.findIndex((r) => r.character_id === previousVote)
        if (prevIdx >= 0) {
          updated[prevIdx] = { ...updated[prevIdx]!, vote_count: Math.max(0, updated[prevIdx]!.vote_count - 1) }
        }
      }
      // Increment new vote (only if not toggling off)
      if (!isToggleOff) {
        const newIdx = updated.findIndex((r) => r.character_id === characterId)
        if (newIdx >= 0) {
          updated[newIdx] = { ...updated[newIdx]!, vote_count: updated[newIdx]!.vote_count + 1 }
        } else {
          updated.push({
            character_id: characterId,
            character_name: '',
            character_image: null,
            character_role: '',
            vote_count: 1,
          })
        }
      }
      return updated
    })

    startTransition(async () => {
      const result = await castCharacterVoteAction(manhwaId, characterId)
      if (result.error) {
        setLocalVote(previousVote)
        setLocalRankings(rankings)
      }
    })
  }

  if (voteable.length === 0) return null

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-text-muted uppercase tracking-wide">
        {t('title')}
      </h3>
      <div className="space-y-2">
        {voteable.slice(0, 8).map((char) => {
          const isSelected = localVote === char.id
          const percentage = totalVotes > 0 ? Math.round((char.votes / totalVotes) * 100) : 0

          return (
            <button
              key={char.id}
              onClick={() => handleVote(char.id)}
              disabled={!isLoggedIn || isPending}
              className={`relative flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors ${
                isSelected
                  ? 'border-crystal-blue/50 bg-crystal-blue/5'
                  : 'border-border bg-surface hover:border-text-muted'
              } ${!isLoggedIn ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {/* Progress bar bg */}
              <div
                className={`absolute inset-0 rounded-lg transition-all ${
                  isSelected ? 'bg-crystal-blue/10' : 'bg-elevated'
                }`}
                style={{ width: `${percentage}%` }}
              />

              {/* Content */}
              <div className="relative flex flex-1 items-center gap-3">
                {char.image ? (
                  <Image
                    src={char.image}
                    alt={char.name}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-elevated text-xs font-bold text-text-muted">
                    {char.name.charAt(0)}
                  </div>
                )}
                <span className="flex-1 truncate text-sm font-medium text-text-primary">
                  {char.name}
                </span>
                <span className="text-xs text-text-muted">
                  {char.votes} {t('votes')}
                </span>
                {percentage > 0 && (
                  <span className="min-w-[3ch] text-right text-xs font-medium text-text-secondary">
                    {percentage}%
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
      {localVote && (
        <p className="mt-2 text-xs text-text-muted">{t('yourVote')}</p>
      )}
    </div>
  )
}
