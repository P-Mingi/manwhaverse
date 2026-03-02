'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

interface ScrollableRowProps {
  children: React.ReactNode
}

export function ScrollableRow({ children }: ScrollableRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    const ro = new ResizeObserver(checkScroll)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      ro.disconnect()
    }
  }, [checkScroll])

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.75
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <div className="group/scroll relative">
      <div
        ref={scrollRef}
        className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-none snap-x snap-mandatory scroll-pl-4 [&>*]:snap-start"
      >
        {children}
      </div>

      {/* Left fade + arrow */}
      {canScrollLeft && (
        <>
          <div className="pointer-events-none absolute -left-4 inset-y-0 w-16 bg-gradient-to-r from-base to-transparent" />
          <button
            onClick={() => scroll('left')}
            className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full bg-elevated/90 p-2 text-text-primary opacity-0 shadow-lg backdrop-blur-sm transition-opacity hover:bg-border group-hover/scroll:opacity-100"
            aria-label="Scroll left"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 12L6 8L10 4" />
            </svg>
          </button>
        </>
      )}

      {/* Right fade + arrow */}
      {canScrollRight && (
        <>
          <div className="pointer-events-none absolute -right-4 inset-y-0 w-16 bg-gradient-to-l from-base to-transparent" />
          <button
            onClick={() => scroll('right')}
            className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full bg-elevated/90 p-2 text-text-primary opacity-0 shadow-lg backdrop-blur-sm transition-opacity hover:bg-border group-hover/scroll:opacity-100"
            aria-label="Scroll right"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 12L10 8L6 4" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}
