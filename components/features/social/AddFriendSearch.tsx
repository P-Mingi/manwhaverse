'use client'

import { useState, useEffect, useRef, useTransition, useCallback } from 'react'
import Link from 'next/link'
import {
  sendFriendRequestAction,
  acceptFriendRequestFromUserAction,
  declineFriendRequestFromUserAction,
} from '@/lib/actions/friendRequest'
import type { FriendRequestStatusValue } from '@/lib/db/friendRequest'

interface SearchUser {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  followers_count: number
  is_following: boolean
  friend_request_status: FriendRequestStatusValue
}

interface Props {
  locale: string
}

const strings = {
  en: {
    placeholder: 'Search by username...',
    addFriend: 'Add friend',
    requestSent: 'Request sent',
    friends: 'Friends ✓',
    accept: 'Accept',
    decline: 'Decline',
    followers: 'followers',
    noResults: 'No users found',
  },
  fr: {
    placeholder: 'Rechercher par nom d\'utilisateur...',
    addFriend: 'Ajouter',
    requestSent: 'Demande envoyée',
    friends: 'Amis ✓',
    accept: 'Accepter',
    decline: 'Refuser',
    followers: 'abonnés',
    noResults: 'Aucun utilisateur trouvé',
  },
}

export function AddFriendSearch({ locale }: Props) {
  const lang = locale === 'fr' ? strings.fr : strings.en
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchUser[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [statuses, setStatuses] = useState<Record<string, FriendRequestStatusValue>>({})
  const [isPending, startTransition] = useTransition()
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      setOpen(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      const users: SearchUser[] = data.users ?? []
      setResults(users)
      const s: Record<string, FriendRequestStatusValue> = {}
      for (const u of users) s[u.id] = u.friend_request_status
      setStatuses(s)
      setOpen(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setResults([])
      setOpen(false)
      return
    }
    debounceRef.current = setTimeout(() => search(query), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, search])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleAddFriend(userId: string) {
    setStatuses((prev) => ({ ...prev, [userId]: 'PENDING_SENT' }))
    startTransition(async () => {
      await sendFriendRequestAction(userId)
    })
  }

  function handleAccept(userId: string) {
    setStatuses((prev) => ({ ...prev, [userId]: 'FRIENDS' }))
    startTransition(async () => {
      await acceptFriendRequestFromUserAction(userId)
    })
  }

  function handleDecline(userId: string) {
    setStatuses((prev) => ({ ...prev, [userId]: 'NONE' }))
    startTransition(async () => {
      await declineFriendRequestFromUserAction(userId)
    })
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          placeholder={lang.placeholder}
          className="w-full rounded-xl border border-border bg-elevated py-2.5 pl-9 pr-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-border border-t-accent" />
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-text-muted">{lang.noResults}</div>
          ) : (
            <ul>
              {results.map((user) => {
                const status = statuses[user.id] ?? user.friend_request_status
                return (
                  <li
                    key={user.id}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-elevated"
                  >
                    <Link
                      href={`/${locale}/profile/${user.username}`}
                      className="flex flex-1 items-center gap-3 min-w-0"
                      onClick={() => setOpen(false)}
                    >
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-elevated text-sm text-text-muted">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.username ?? ''}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          (user.username ?? '?').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-text-primary">
                          {user.display_name ?? user.username}
                        </p>
                        <p className="text-xs text-text-muted">
                          @{user.username} · {user.followers_count} {lang.followers}
                        </p>
                      </div>
                    </Link>

                    <div className="flex flex-shrink-0 gap-1.5">
                      {status === 'NONE' && (
                        <button
                          onClick={() => handleAddFriend(user.id)}
                          disabled={isPending}
                          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent/80 disabled:opacity-60"
                        >
                          {lang.addFriend}
                        </button>
                      )}
                      {status === 'PENDING_SENT' && (
                        <span className="rounded-lg bg-elevated px-3 py-1.5 text-xs font-medium text-text-muted">
                          {lang.requestSent}
                        </span>
                      )}
                      {status === 'FRIENDS' && (
                        <span className="rounded-lg bg-elevated px-3 py-1.5 text-xs font-medium text-text-muted">
                          {lang.friends}
                        </span>
                      )}
                      {status === 'PENDING_RECEIVED' && (
                        <>
                          <button
                            onClick={() => handleAccept(user.id)}
                            disabled={isPending}
                            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60"
                          >
                            {lang.accept}
                          </button>
                          <button
                            onClick={() => handleDecline(user.id)}
                            disabled={isPending}
                            className="rounded-lg bg-elevated px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-border disabled:opacity-60"
                          >
                            {lang.decline}
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
