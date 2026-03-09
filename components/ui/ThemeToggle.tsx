'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch — render only after mount
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return <div className="h-8 w-[68px] rounded-full bg-card animate-pulse" />

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative h-8 w-[68px] cursor-pointer rounded-full border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
      style={{
        borderColor: 'var(--color-electric-border)',
        background: isDark
          ? 'linear-gradient(135deg, #0C0E14 0%, #111420 100%)'
          : 'linear-gradient(135deg, #FFF0F3 0%, #FFE8ED 100%)',
        boxShadow: isDark
          ? '0 0 12px var(--color-electric-glow), inset 0 0 8px rgba(0,0,0,0.3)'
          : '0 0 12px rgba(232,84,122,0.15)',
      }}
    >
      {/* Stars (dark mode) */}
      {isDark && (
        <>
          <span className="absolute left-2 top-1.5 h-1 w-1 rounded-full bg-white opacity-60 animate-pulse" style={{ animationDelay: '0s' }} />
          <span className="absolute left-4 top-4 h-0.5 w-0.5 rounded-full bg-white opacity-40 animate-pulse" style={{ animationDelay: '0.4s' }} />
          <span className="absolute left-6 top-2 h-0.5 w-0.5 rounded-full bg-white opacity-50 animate-pulse" style={{ animationDelay: '0.8s' }} />
        </>
      )}
      {/* Petals (light mode) */}
      {!isDark && (
        <>
          <span className="absolute left-2 top-1.5 text-[8px] opacity-30 animate-bounce" style={{ animationDelay: '0s' }}>✿</span>
          <span className="absolute left-4 top-3.5 text-[7px] opacity-20 animate-bounce" style={{ animationDelay: '0.6s' }}>✾</span>
        </>
      )}
      {/* Label */}
      <span
        className="absolute text-[7px] font-bold uppercase tracking-wider opacity-40 transition-all duration-300"
        style={{
          left:      isDark ? '8px' : undefined,
          right:     isDark ? undefined : '8px',
          top:       '50%',
          transform: 'translateY(-50%)',
          color:     'var(--color-text-secondary)',
        }}
      >
        {isDark ? 'DARK' : 'LIGHT'}
      </span>
      {/* Thumb */}
      <span
        className="absolute top-[3px] flex h-6 w-6 items-center justify-center rounded-full text-[13px] transition-all duration-300 shadow-md"
        style={{
          left:       isDark ? '3px' : '37px',
          background: isDark
            ? 'radial-gradient(circle at 35% 35%, #ddd, #aaa)'
            : 'radial-gradient(circle at 40% 35%, #FFE066, #FFC107)',
          boxShadow: isDark
            ? 'inset -2px -2px 4px rgba(0,0,0,0.3), inset 2px 2px 4px rgba(255,255,255,0.1)'
            : '0 0 8px rgba(255,193,7,0.6)',
        }}
      >
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  )
}
