'use client'

import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'

interface SearchBarProps {
  defaultValue: string
  locale: string
}

export function SearchBar({ defaultValue, locale }: SearchBarProps) {
  const router = useRouter()
  const [value, setValue] = useState(defaultValue)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = value.trim()
      if (trimmed) {
        router.push(`/${locale}/search?q=${encodeURIComponent(trimmed)}`)
      } else {
        router.push(`/${locale}/search`)
      }
    },
    [value, locale, router]
  )

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search manhwa..."
        className="w-full rounded-lg border border-border bg-surface px-4 py-3 pl-10 text-sm text-text-primary placeholder:text-text-muted focus:border-crystal-blue focus:outline-none focus:ring-1 focus:ring-crystal-blue"
      />
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    </form>
  )
}
