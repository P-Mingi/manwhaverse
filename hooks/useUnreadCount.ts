'use client'

import { useState, useEffect, useCallback } from 'react'

export function useUnreadCount(enabled: boolean) {
  const [count, setCount] = useState(0)

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/unread-count')
      if (res.ok) {
        const data = await res.json()
        setCount(data.count)
      }
    } catch {
      // Silently fail — polling is best-effort
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    fetchCount()

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchCount()
      }
    }, 30_000)

    return () => clearInterval(interval)
  }, [enabled, fetchCount])

  useEffect(() => {
    if (!enabled) return

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchCount()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [enabled, fetchCount])

  return { count, refetch: fetchCount }
}
