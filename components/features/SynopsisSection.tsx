'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface SynopsisSectionProps {
  synopsis: string | null
}

const MAX_LENGTH = 300

export function SynopsisSection({ synopsis }: SynopsisSectionProps) {
  const t = useTranslations('common')
  const [expanded, setExpanded] = useState(false)

  if (!synopsis) return null

  const isLong = synopsis.length > MAX_LENGTH
  const displayText = isLong && !expanded ? synopsis.slice(0, MAX_LENGTH) + '...' : synopsis

  return (
    <div>
      <p className="whitespace-pre-line text-sm leading-relaxed text-text-secondary">
        {displayText}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-sm font-medium text-crystal-blue hover:underline"
        >
          {expanded ? t('showLess') : t('showMore')}
        </button>
      )}
    </div>
  )
}
