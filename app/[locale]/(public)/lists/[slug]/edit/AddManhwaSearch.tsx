'use client'

import { useState, useTransition, useRef } from 'react'
import Image from 'next/image'
import { searchManhwasForListAction, addItemToListAction, type ManhwaSearchResult } from '@/lib/actions/list'

interface Props {
  listId: string
  existingManhwaIds: string[]
  addLabel: string
  addedLabel: string
  searchPlaceholder: string
  noResultsLabel: string
}

export function AddManhwaSearch({
  listId,
  existingManhwaIds,
  addLabel,
  addedLabel,
  searchPlaceholder,
  noResultsLabel,
}: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ManhwaSearchResult[]>([])
  const [added, setAdded] = useState<Set<string>>(new Set(existingManhwaIds))
  const [isSearching, startSearch] = useTransition()
  const [isAdding, startAdd] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleInput(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.length < 2) { setResults([]); return }
    debounceRef.current = setTimeout(() => {
      startSearch(async () => {
        const res = await searchManhwasForListAction(value)
        setResults(res)
      })
    }, 300)
  }

  function handleAdd(manhwaId: string) {
    startAdd(async () => {
      const res = await addItemToListAction(listId, manhwaId)
      if (!res?.error) {
        setAdded((prev) => new Set([...prev, manhwaId]))
      }
    })
  }

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => handleInput(e.target.value)}
        placeholder={searchPlaceholder}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-crystal-blue focus:outline-none"
      />

      {query.length >= 2 && (
        <div className="mt-2 overflow-hidden rounded-lg border border-border bg-surface">
          {isSearching ? (
            <div className="px-3 py-3 text-sm text-text-muted">Searching…</div>
          ) : results.length === 0 ? (
            <div className="px-3 py-3 text-sm text-text-muted">{noResultsLabel}</div>
          ) : (
            results.map((m) => {
              const isAdded = added.has(m.id)
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-3 border-b border-border px-3 py-2 last:border-0"
                >
                  <div className="relative h-10 w-7 shrink-0 overflow-hidden rounded bg-elevated">
                    {m.cover_url && (
                      <Image src={m.cover_url} alt={m.title_en} fill sizes="28px" className="object-cover" />
                    )}
                  </div>
                  <span className="flex-1 text-sm text-text-primary line-clamp-1">{m.title_en}</span>
                  <button
                    onClick={() => !isAdded && handleAdd(m.id)}
                    disabled={isAdded || isAdding}
                    className={`shrink-0 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      isAdded
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-crystal-blue text-white hover:bg-crystal-blue/90 disabled:opacity-50'
                    }`}
                  >
                    {isAdded ? addedLabel : addLabel}
                  </button>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
