# MANHWAVERSE — FULL UI/UX REDESIGN PROMPT
> Branch: `feat/redesign-ui-letterboxd`  
> Based on: REDESIGN_AUDIT.md + approved HTML prototype  
> Stack: Next.js 16 · React 19 · Tailwind CSS v4 · Framer Motion 12 · next-intl · Auth.js  
> Do NOT touch: database schema, Prisma models, server actions, API routes, auth logic, scoring engine

---

## 0. BEFORE ANYTHING — READ THIS FULLY

You have access to `REDESIGN_AUDIT.md` in this repo. Read it before touching a single file. Every decision in this prompt is informed by that audit. Key facts you must internalize:

- Tailwind v4 — all tokens live in `globals.css` `@theme inline`, NOT `tailwind.config.ts` (that file doesn't exist)
- Zero CSS modules, zero CSS-in-JS, zero component libraries — everything is hand-built Tailwind
- `framer-motion@12` is installed and used in 48+ places — respect existing animation patterns
- `RankBadge.tsx` uses `inline style={{ color-mix() }}` — must be edited directly, cannot be overridden by class
- `ScoreBadge.tsx` has a hardcoded `BAR_COLORS` array — update it in one place only
- `<html className="dark">` is currently hardcoded — we are replacing this with `next-themes`
- All icons are inline SVG — no icon library to import
- `@tailwindcss/typography` prose plugin is active
- Fonts loaded via `app/fonts.ts` using `next/font/google`

---

## 1. BRANCH SETUP

```bash
git checkout -b feat/redesign-ui-letterboxd
```

Work only on this branch. Never touch `main`.

---

## 2. INSTALL REQUIRED PACKAGES

```bash
npm install next-themes
```

That is the only new dependency. Do not install anything else.

---

## 3. THEME SYSTEM — PERSISTENT DUAL THEME (CRITICAL, DO FIRST)

This is the foundation. Every other change depends on it being correct.

### 3.1 — Wrap the app with ThemeProvider

**File: `app/[locale]/layout.tsx`**

Add `ThemeProvider` from `next-themes` wrapping the entire provider tree:

```tsx
import { ThemeProvider } from 'next-themes'

// Inside the JSX, wrap everything:
<ThemeProvider
  attribute="data-theme"
  defaultTheme="dark"
  enableSystem={false}
  storageKey="manhwaverse-theme"
>
  {/* existing provider tree: NextIntlClientProvider > SessionProvider > PostHogTracker > Header > content > Footer > MobileNav */}
</ThemeProvider>
```

**File: `app/layout.tsx`**

Change `<html className="dark">` to:
```tsx
<html lang={locale} suppressHydrationWarning>
```

Remove `className="dark"` entirely. `next-themes` will add `data-theme="dark"` or `data-theme="light"` on the `<html>` element automatically. `suppressHydrationWarning` is already there — keep it.

### 3.2 — Rewrite `globals.css` completely

Replace the entire `globals.css` with the following. This is the single source of truth for ALL visual tokens.

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

/* ============================================================
   THEME TOKENS — applied via data-theme on <html>
   ============================================================ */

/* ── NIGHT MODE (Hunter / Ranker — default) ─────────────────── */
[data-theme="dark"],
:root {
  /* Backgrounds */
  --color-void:     #080A0F;
  --color-deep:     #0C0E14;
  --color-card:     #111420;
  --color-section:  #0C0E14;
  --color-elevated: #181C2A;
  --color-border-raw: 30, 34, 53;        /* #1E2235 as RGB for alpha variants */

  /* Electric brand */
  --color-electric:              #00E5CC;
  --color-electric-dim:          #00BFAA;
  --color-electric-glow:         rgba(0, 229, 204, 0.12);
  --color-electric-border:       rgba(0, 229, 204, 0.12);
  --color-electric-border-hover: rgba(0, 229, 204, 0.30);

  /* Text */
  --color-text-primary:   #E8E8F0;
  --color-text-secondary: #8890AA;
  --color-text-muted:     #454A60;

  /* Accents */
  --color-gold:    #F5C842;
  --color-red:     #FF4455;
  --color-success: #4ADE80;
  --color-warning: #FBBF24;
  --color-error:   #EF4444;

  /* Legacy aliases (keep for backwards compat) */
  --color-base:         #080A0F;
  --color-surface:      #111420;
  --color-border:       rgba(0, 229, 204, 0.12);
  --color-crystal-blue: #00E5CC;
  --color-crystal-gold: #F5C842;
  --color-crystal-red:  #FF4455;

  /* Rank badge base (used in color-mix in RankBadge.tsx) */
  --rank-badge-base: 8 10 15;   /* rgb for dark surface */

  /* Medal colors */
  --color-medal-gold:   #F5C842;
  --color-medal-silver: #C0C0C0;
  --color-medal-bronze: #CD7F32;

  /* External brand (immutable) */
  --color-anilist: #02A9FF;
  --color-mal:     #2E51A2;

  /* Card hover glow */
  --card-hover-border:  rgba(0, 229, 204, 0.25);
  --card-hover-shadow:  0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,229,204,0.10), 0 4px 20px rgba(0,229,204,0.08);

  /* Section bar */
  --section-bar-color:  #00E5CC;
  --section-bar-glow:   rgba(0, 229, 204, 0.6);

  /* Scrollbar */
  --scrollbar-thumb:       rgba(0, 229, 204, 0.20);
  --scrollbar-thumb-hover: rgba(0, 229, 204, 0.35);

  /* Fonts */
  --font-display: 'Bebas Neue', sans-serif;
  --font-sans:    'Sora', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;

  /* Radii */
  --radius-sm:   2px;
  --radius-md:   6px;
  --radius-lg:   8px;
  --radius-xl:   12px;
  --radius-2xl:  16px;
  --radius-full: 9999px;
}

/* ── DAY MODE (Shōjo / Slice of Life — white & pale pink) ───── */
[data-theme="light"] {
  /* Backgrounds */
  --color-void:     #FFFAFB;
  --color-deep:     #FFF5F7;
  --color-card:     #FFF0F3;
  --color-section:  #FFF5F7;
  --color-elevated: #FFE8ED;
  --color-border-raw: 245, 214, 222;     /* #F5D6DE as RGB */

  /* Rose brand */
  --color-electric:              #E8547A;
  --color-electric-dim:          #D43F66;
  --color-electric-glow:         rgba(232, 84, 122, 0.10);
  --color-electric-border:       rgba(232, 84, 122, 0.20);
  --color-electric-border-hover: rgba(232, 84, 122, 0.45);

  /* Text */
  --color-text-primary:   #2D1B24;
  --color-text-secondary: #8C6070;
  --color-text-muted:     #C4A0AE;

  /* Accents */
  --color-gold:    #C4883C;
  --color-red:     #D43F5E;
  --color-success: #3D9E6A;
  --color-warning: #C47A20;
  --color-error:   #C43A3A;

  /* Legacy aliases */
  --color-base:         #FFFAFB;
  --color-surface:      #FFF0F3;
  --color-border:       rgba(232, 84, 122, 0.20);
  --color-crystal-blue: #E8547A;
  --color-crystal-gold: #C4883C;
  --color-crystal-red:  #D43F5E;

  /* Rank badge base */
  --rank-badge-base: 255 245 247;   /* rgb for light surface */

  /* Medal colors — same in both themes (real metal colors) */
  --color-medal-gold:   #C4883C;
  --color-medal-silver: #9090A0;
  --color-medal-bronze: #A06030;

  /* External brand (immutable) */
  --color-anilist: #02A9FF;
  --color-mal:     #2E51A2;

  /* Card hover */
  --card-hover-border:  rgba(232, 84, 122, 0.30);
  --card-hover-shadow:  0 8px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(232,84,122,0.12);

  /* Section bar */
  --section-bar-color: #E8547A;
  --section-bar-glow:  rgba(232, 84, 122, 0.40);

  /* Scrollbar */
  --scrollbar-thumb:       rgba(232, 84, 122, 0.20);
  --scrollbar-thumb-hover: rgba(232, 84, 122, 0.40);

  /* Fonts — Crimson Pro for display in light mode */
  --font-display: 'Crimson Pro', Georgia, serif;
  --font-sans:    'DM Sans', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', monospace;

  /* Radii — slightly rounder in light mode */
  --radius-sm:   3px;
  --radius-md:   8px;
  --radius-lg:   10px;
  --radius-xl:   14px;
  --radius-2xl:  18px;
  --radius-full: 9999px;
}

/* ============================================================
   TAILWIND THEME REGISTRATION
   ============================================================ */
@theme inline {
  --color-void:                    var(--color-void);
  --color-deep:                    var(--color-deep);
  --color-card:                    var(--color-card);
  --color-section:                 var(--color-section);
  --color-elevated:                var(--color-elevated);
  --color-electric:                var(--color-electric);
  --color-electric-dim:            var(--color-electric-dim);
  --color-electric-glow:           var(--color-electric-glow);
  --color-electric-border:         var(--color-electric-border);
  --color-electric-border-hover:   var(--color-electric-border-hover);
  --color-text-primary:            var(--color-text-primary);
  --color-text-secondary:          var(--color-text-secondary);
  --color-text-muted:              var(--color-text-muted);
  --color-gold:                    var(--color-gold);
  --color-red:                     var(--color-red);
  --color-success:                 var(--color-success);
  --color-warning:                 var(--color-warning);
  --color-error:                   var(--color-error);
  --color-base:                    var(--color-base);
  --color-surface:                 var(--color-surface);
  --color-border:                  var(--color-border);
  --color-crystal-blue:            var(--color-crystal-blue);
  --color-crystal-gold:            var(--color-crystal-gold);
  --color-crystal-red:             var(--color-crystal-red);
  --color-medal-gold:              var(--color-medal-gold);
  --color-medal-silver:            var(--color-medal-silver);
  --color-medal-bronze:            var(--color-medal-bronze);
  --color-anilist:                 var(--color-anilist);
  --color-mal:                     var(--color-mal);
  --font-display:                  var(--font-display);
  --font-sans:                     var(--font-sans);
  --font-mono:                     var(--font-mono);
  --radius-sm:                     var(--radius-sm);
  --radius-md:                     var(--radius-md);
  --radius-lg:                     var(--radius-lg);
  --radius-xl:                     var(--radius-xl);
  --radius-2xl:                    var(--radius-2xl);
  --radius-full:                   var(--radius-full);
}

/* ============================================================
   BASE STYLES
   ============================================================ */
body {
  background:           var(--color-void);
  color:                var(--color-text-primary);
  font-family:          var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background 0.4s cubic-bezier(0.4,0,0.2,1),
              color      0.4s cubic-bezier(0.4,0,0.2,1);
}

/* ============================================================
   UTILITY CLASSES (keep all existing ones, update colors)
   ============================================================ */

.section-alt {
  background:  var(--color-section);
  border-top:    1px solid rgba(var(--color-border-raw), 0.06);
  border-bottom: 1px solid rgba(var(--color-border-raw), 0.06);
}

.electric-glow {
  text-shadow: 0 0 20px var(--color-electric-glow);
}

.card-hover {
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}
.card-hover:hover {
  transform:    translateY(-4px) scale(1.01);
  border-color: var(--card-hover-border);
  box-shadow:   var(--card-hover-shadow);
}

.section-title-bar {
  display:     flex;
  align-items: center;
  gap:         12px;
}
.section-title-bar::before {
  content:      '';
  width:        3px;
  height:       1.25rem;
  background:   var(--section-bar-color);
  box-shadow:   0 0 8px var(--section-bar-glow);
  border-radius: 2px;
  flex-shrink:  0;
}

/* ============================================================
   KEYFRAME ANIMATIONS (unchanged)
   ============================================================ */
@keyframes crystal-fill {
  from { clip-path: inset(100% 0 0 0); }
  to   { clip-path: inset(0 0 0 0); }
}
@keyframes crystal-shimmer {
  0%, 100% { opacity: 0.6; }
  50%       { opacity: 1; }
}
@keyframes count-up {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes stagger-reveal {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes rank-glow {
  from { box-shadow: 0 0 8px var(--rank-glow); }
  to   { box-shadow: 0 0 20px var(--rank-glow), 0 0 40px var(--rank-glow); }
}
@utility animate-rank-glow {
  animation: rank-glow 2s ease-in-out infinite alternate;
}
@keyframes ticker {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@keyframes blob-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%       { transform: translate(30px, -20px) scale(1.05); }
  66%       { transform: translate(-20px, 15px) scale(0.95); }
}
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ============================================================
   UTILITIES
   ============================================================ */
@utility scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width:    none;
  &::-webkit-scrollbar { display: none; }
}

/* ============================================================
   SCROLLBAR
   ============================================================ */
::-webkit-scrollbar       { width: 5px; }
::-webkit-scrollbar-track { background: var(--color-void); }
::-webkit-scrollbar-thumb {
  background:    var(--scrollbar-thumb);
  border-radius: 3px;
  transition:    background 0.3s ease;
}
::-webkit-scrollbar-thumb:hover { background: var(--scrollbar-thumb-hover); }

/* ============================================================
   LIGHT MODE — FONT LOADING FALLBACK
   Light mode uses Crimson Pro + DM Sans. These are loaded via
   next/font in fonts.ts — see Section 4 for the update.
   ============================================================ */
[data-theme="light"] body {
  font-family: var(--font-sans);
}
[data-theme="light"] .font-display {
  font-family: var(--font-display);
  font-style:  italic;
}
```

### 3.3 — Update `app/fonts.ts`

Add Crimson Pro and DM Sans for light mode. Keep Bebas Neue, Sora, JetBrains Mono for dark mode.

```typescript
import { Bebas_Neue, Sora, JetBrains_Mono, Crimson_Pro, DM_Sans } from 'next/font/google'

export const bebasNeue = Bebas_Neue({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})

export const sora = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sora',
  display: 'swap',
})

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
})

export const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-crimson',
  display: 'swap',
})

export const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm',
  display: 'swap',
})
```

**File: `app/layout.tsx`** — update the body className to include all font variables:

```tsx
import { bebasNeue, sora, jetbrainsMono, crimsonPro, dmSans } from '@/app/fonts'

// html element:
<html lang={locale} suppressHydrationWarning>

// body element:
<body className={`
  ${bebasNeue.variable}
  ${sora.variable}
  ${jetbrainsMono.variable}
  ${crimsonPro.variable}
  ${dmSans.variable}
  overflow-x-hidden bg-void text-text-primary antialiased
`}>
```

**Update globals.css** — the `--font-display` and `--font-sans` variables in both themes now reference the CSS font variables:

```css
/* In [data-theme="dark"] block: */
--font-display: var(--font-bebas);   /* Bebas Neue */
--font-sans:    var(--font-sora);    /* Sora */

/* In [data-theme="light"] block: */
--font-display: var(--font-crimson); /* Crimson Pro */
--font-sans:    var(--font-dm);      /* DM Sans */
```

### 3.4 — Create the ThemeToggle component

**New file: `components/ui/ThemeToggle.tsx`**

```tsx
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
          left: isDark ? '8px' : undefined,
          right: isDark ? undefined : '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--color-text-secondary)',
        }}
      >
        {isDark ? 'DARK' : 'LIGHT'}
      </span>
      {/* Thumb */}
      <span
        className="absolute top-[3px] flex h-6 w-6 items-center justify-center rounded-full text-[13px] transition-all duration-300 shadow-md"
        style={{
          left: isDark ? '3px' : '37px',
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
```

### 3.5 — Add ThemeToggle to Header

**File: `components/layouts/Header.tsx`**

Import and add `<ThemeToggle />` in the right-side nav area, between the locale switcher and the notification bell.

```tsx
import { ThemeToggle } from '@/components/ui/ThemeToggle'

// In the right-side div (before NotificationBell):
<ThemeToggle />
```

Also add ThemeToggle to `MobileNav.tsx` in the top bar area (desktop: it's in header, mobile: add a small toggle icon in the header's right side since MobileNav is bottom-fixed).

---

## 4. TOKEN MIGRATION — HARDCODED HEX → TOKEN CLASSES

Run this migration **after** the theme system is in place. This is a find-and-replace pass across all component files. The audit identified ~100+ occurrences.

**Replacement map (Tailwind arbitrary → token class):**

| Find | Replace |
|------|---------|
| `bg-[#0d0d16]` or `bg-[#060609]` | `bg-card` |
| `bg-[#111120]` | `bg-elevated` |
| `bg-[#08080e]` | `bg-deep` |
| `bg-[#0a0a13]` | `bg-section` |
| `text-[#e8e8f0]` | `text-text-primary` |
| `text-[#9999b8]` | `text-text-secondary` |
| `text-[#6b6b88]` | `text-text-muted` |
| `text-[#00ffff]` | `text-electric` |
| `text-[#00bfff]` | `text-electric-dim` |
| `bg-[#ff2d55]` | `bg-red` |
| `text-[#ff2d55]` | `text-red` |
| `border-[rgba(0,255,255,0.12)]` | `border-electric-border` |
| `border-[rgba(0,255,255,0.2)]` | `border-electric-border` |
| `border-[rgba(0,255,255,0.07)]` | `border-electric-border` |
| `bg-[rgba(0,255,255,0.08)]` | `bg-electric-glow` |
| `bg-[rgba(0,255,255,0.15)]` | `bg-electric-glow` |
| `hover:border-[rgba(0,255,255,0.4)]` | `hover:border-electric-border-hover` |
| `hover:text-[#00ffff]` | `hover:text-electric` |
| `group-hover:text-[#00ffff]` | `group-hover:text-electric` |
| `text-[#ffd700]` | `text-gold` |
| `bg-[#ffd700]` | `bg-gold` |

Do this pass systematically on every `.tsx` file under `components/`.

**Critical component fixes (beyond find-and-replace):**

### `RankBadge.tsx`
The `color-mix()` uses a hardcoded dark base. Update it to reference the CSS variable:

```tsx
// BEFORE:
backgroundColor: `color-mix(in srgb, ${rank.color} 22%, rgb(8 8 12 / 0.85))`  // compact
backgroundColor: `color-mix(in srgb, ${rank.color} 12%, transparent)`           // full

// AFTER:
backgroundColor: `color-mix(in srgb, ${rank.color} 20%, rgb(var(--rank-badge-base) / 0.90))`  // compact
backgroundColor: `color-mix(in srgb, ${rank.color} 10%, rgb(var(--rank-badge-base) / 0.15))`  // full
```

In globals.css dark mode: `--rank-badge-base: 8 10 15;`
In globals.css light mode: `--rank-badge-base: 255 245 247;`

### `ScoreBadge.tsx`
The `BAR_COLORS` array is fine as-is (these are score-specific semantic colors, not brand colors). Do NOT change them.

### `HomePodium.tsx`
Replace medal hardcoded values with token classes:
```tsx
// BEFORE:
ring-[#ffd700] shadow-[0_0_24px_rgba(255,215,0,0.3)]

// AFTER:
ring-medal-gold shadow-[0_0_24px_rgba(var(--color-medal-gold),0.3)]
```

Or keep the shadow hardcoded — medal colors don't change between themes (gold/silver/bronze are intentional real-world references), just update ring to use `ring-gold`, `ring-[var(--color-medal-silver)]`, `ring-[var(--color-medal-bronze)]`.

---

## 5. HOMEPAGE REDESIGN

This is the most visible change. Refer to the approved prototype for exact visual reference. Redesign these components to match:

### 5.1 — Hero Section

**Target:** Split-column editorial layout. Left: editorial text + stats + CTAs. Right: manhwa cover collage (3×3 grid with featured 2×2 top item).

**File: likely `app/[locale]/(public)/page.tsx` or `components/features/home/HomeHero.tsx`**

Structure:
```
<section> [min-h: 88vh on desktop, auto on mobile]
  <!-- Left -->
  <div> [flex-col, justify-center, px-6 md:px-12 lg:px-16]
    <div class="section-title-bar text-electric text-xs uppercase tracking-widest mb-5">
      Featured Manhwa · #1 This Week
    </div>
    <h1 class="font-display leading-[0.92] mb-6">
      Track every<br>
      <span class="text-electric">manhwa</span><br>
      you've ever loved.
    </h1>
    <p class="text-text-secondary font-serif italic mb-8 max-w-sm">  [italic only in light mode via font-serif]
      Your personal universe for Korean webtoons...
    </p>
    <!-- Stats row -->
    <div class="flex gap-8 mb-10">
      {[{ num: '3,973', label: 'Titles' }, { num: '12.4K', label: 'Readers' }, { num: '89.2K', label: 'Reviews' }].map(...)}
    </div>
    <!-- CTAs -->
    <div class="flex gap-3 flex-wrap">
      <button primary>Start Tracking →</button>
      <button secondary>See Rankings</button>
    </div>
  </div>
  <!-- Right: collage -->
  <div> [relative, overflow-hidden, bg-elevated]
    <!-- 3×3 grid, featured item spans 2×2 -->
    <!-- gradient fade left edge → transitions into hero bg -->
  </div>
</section>
```

**Mobile (< md):** Stack vertically. Collage becomes a horizontal scrollable strip of 3 cards below the editorial text. No 3×3 grid on mobile.

### 5.2 — Genre/Trope Pill Bar

**New component: `components/features/home/HomeGenreBar.tsx`**

Horizontal scrollable pill bar (no scrollbar visible). Pills: All, ⚔️ Action, 🔄 Regression, 💕 Romance, 🏯 Murim, 🎮 System, 🌀 Isekai, 👑 Villainess, ✅ Completed, 🗡️ Dark & Mature.

Active pill: `border-electric text-electric bg-electric-glow`.
Inactive: `border-electric-border text-text-muted bg-card`.
Clicking a pill navigates to `/[locale]/explore?genre=X` or `/[locale]/trope/X`.

**Mobile:** Same, just scrollable horizontally with `scrollbar-none`.

### 5.3 — Trending Section

**5 card grid** using the existing `ManhwaCard` component. Add rank number overlay (1–5) as a large semi-transparent `font-display` number positioned `top-2 left-2` inside the card cover.

```tsx
// Extend ManhwaCard props or wrap:
interface ManhwaCardWithRankProps extends ManhwaCardProps {
  rank?: number  // 1-5, shows as overlay
}
```

Grid: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4`

### 5.4 — Two-Column Middle Section

**Left: Top Rated compact list (ranking)**

Use existing `HomeRankingList` component as base. Redesign to Letterboxd compact list style:

```
[rank#] [thumb 52×70px] [title + genres] [score ★X.X]
```

Each row: `grid grid-cols-[28px_52px_1fr_auto] items-center gap-3 py-3 border-b border-electric-border cursor-pointer hover:bg-elevated rounded px-2`

Rank 1 number: `text-gold`, rank 2: `text-text-secondary`, rank 3: `text-[var(--color-medal-bronze)]`, rest: `text-text-muted`.

**Right: Community Activity Feed**

**New component: `components/features/home/HomeActivityFeed.tsx`**

Query: last 20 activity events from the `activity` table. Each row:

```
[avatar 36px] [text: "username rated/completed/added manhwa-title"] [time ago] [score if applicable]
```

Grid: `grid grid-cols-[36px_1fr_auto] items-start gap-3 py-3 border-b border-electric-border`

Event types to display: `RATE`, `COMPLETE`, `ADD_TO_LIBRARY`, `REVIEW`, `CREATE_LIST`.

**Mobile:** Stack both sections vertically (rankings first, feed second).

### 5.5 — Recent Reviews Section

**3-column grid** of `ReviewCard` components. On mobile: single column.

Each `ReviewCard` must show: user avatar + name + time + score, the manhwa thumbnail + title, the review text (4-line clamp), Korean reaction chips.

### 5.6 — Hidden Gems Section

**6-column grid** (mobile: 3 cols) of small manhwa cards with 💎 badge and low reader count. 

Query: `score_avg >= 8.0 AND reader_count <= 200` ordered by score descending.

### 5.7 — Top Lists Section

**3-column grid** (mobile: 1 col) of community list cards showing: 4 cover thumbnails mosaic, list title, item count, heart count.

---

## 6. LAYOUT & SHELL COMPONENTS

### 6.1 — Header (`components/layouts/Header.tsx`)

Full rewrite aligned with the prototype. Keep the same routes. Changes:

- Remove all `bg-[#...]` hardcoded classes → use token classes
- Add `ThemeToggle` component (between locale switcher and notification bell)
- Scrolled state: add `backdrop-blur-md` + semi-transparent `bg-void/85` when `scrollY > 20` (use `useScrollPosition` hook or inline `useEffect`)
- Logo: `font-display text-electric tracking-[0.08em] text-xl`
- In light mode the logo uses `font-display` which is now Crimson Pro italic — this is intentional

**Mobile header:** Keep logo centered + locale switcher right + ThemeToggle accessible (add to mobile header right side, NOT in MobileNav bottom bar — the bottom bar has no room).

### 6.2 — MobileNav (`components/layouts/MobileNav.tsx`)

- Replace all hardcoded hex with token classes
- Keep same 5-tab structure and routes
- Active tab: `text-electric`
- Inactive: `text-text-muted`
- Background: `bg-deep/90 backdrop-blur-md border-t border-electric-border`
- Notification badge: `bg-red` (already correct once token migrated)

### 6.3 — Footer (`components/layouts/Footer.tsx`)

- Replace all hardcoded hex with token classes
- `border-t border-electric-border`
- `bg-void`
- Tagline: `font-serif italic text-text-muted` (in light mode this will be Crimson Pro)

---

## 7. MANHWACARD REDESIGN

**File: `components/features/ManhwaCard.tsx`**

Full class replacement (logic stays identical):

```tsx
// Card wrapper:
className="group flex flex-col overflow-hidden rounded-lg border border-electric-border bg-card card-hover"

// Cover bg:
className="relative aspect-[5/7] w-full overflow-hidden bg-elevated"

// No-cover text:
className="flex h-full items-center justify-center text-xs text-text-muted"

// 18+ badge:
className="rounded-md bg-red/80 px-2 py-1 text-xs font-bold text-white"

// Score box:
className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-void/80 px-1.5 py-0.5 backdrop-blur-sm"

// Score value (high):
className={`font-mono text-xs font-bold ${displayScore >= 8 ? 'text-electric' : 'text-text-primary'}`}

// Title:
className="truncate text-sm font-semibold text-text-primary transition-colors group-hover:text-electric"

// User score line:
className="mt-0.5 text-[11px] text-text-muted"

// User score value:
className="font-mono font-semibold text-electric"

// Genre pill:
className="rounded bg-elevated px-1.5 py-0.5 text-[10px] text-text-muted"
```

---

## 8. MANHWA DETAIL PAGE

**File: `components/features/ManhwaHero.tsx`**

Replace all hardcoded hex with token classes. The external score section with AniList/MAL brand colors (`#02A9FF`, `#2E51A2`) is correct to keep hardcoded — these are external brand identities.

**`components/features/manhwa/ManhwaTabNav.tsx`**

Active tab:
```tsx
className="... text-electric border-b-2 border-electric"
```

---

## 9. NEW FEATURE — LETTERBOXD DIARY

This is a new feature. Implement it properly and completely.

### 9.1 — Database

The `user_library` table already has `started_at`, `completed_at`, `updated_at`. We need `read_at` as a user-settable date representing "the date I watched/read this". This is different from `completed_at` (system-set) — it's the meaningful diary date.

**Add to Prisma schema** (migration needed):
```prisma
model UserLibrary {
  // ... existing fields ...
  read_at     DateTime?   // user-settable diary date — "when I read this"
  reread_count Int        @default(0)
}
```

Run: `npx prisma migrate dev --name add_diary_read_at`

### 9.2 — Diary Page

**New file: `app/[locale]/(auth)/diary/page.tsx`**

Protected route. Shows the user's reading history as a timeline.

Layout:
```
/diary
├── Header: "My Reading Diary"
├── Year tabs: [2026] [2025] [2024] ...
├── Month sections: each month shows entries logged that month
│   └── Each entry: [cover thumb] [title] [read_at date] [score] [status badge]
└── Stats bar: X manhwas read this year · X chapters · avg score X.X
```

Calendar heatmap (optional Phase 2): GitHub-style grid of the year showing reading activity density.

**Mobile:** Single column, month sections collapse to accordions.

### 9.3 — Diary Entry Logging

When a user adds/updates a library entry (via `LibraryActions` or `ListEditorModal`), add a `read_at` date picker field. Default: today's date if status is COMPLETED or REREADING.

**Update `library/ListEditorModal.tsx`:**

Add a date input field for `read_at`:
```tsx
<input
  type="date"
  value={readAt ?? ''}
  onChange={(e) => setReadAt(e.target.value || null)}
  className="w-full rounded-md border border-electric-border bg-elevated px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-electric"
  max={new Date().toISOString().split('T')[0]}  // cannot set future dates
/>
```

### 9.4 — MobileNav: Add Diary Link

Add "Diary" as a route accessible from the mobile nav. On mobile replace the `journal` sub-link. On desktop add to the profile dropdown.

---

## 10. NEW FEATURE — REVIEW AS SOCIAL OBJECT

### 10.1 — Remove Fake/Seed Account Reviews

**IMPORTANT: Do this with a careful migration, not a destructive DELETE.**

First, identify seed accounts: they have `is_seed = true` in the `user_profile` table (or equivalent flag from the audit).

```sql
-- Migration: soft-delete all content from seed accounts
-- Step 1: create deleted_seed_content backup
-- Step 2: delete reviews, reactions, library entries, ratings
-- Step 3: delete the seed accounts themselves
-- Step 4: recalculate scores for affected manhwas via recalculateSingleManhwaScore()
```

Create a server action or admin script:
```typescript
// /scripts/cleanup-seed-accounts.ts
// Query all users where is_seed = true
// Delete: reviews, review_likes, reactions, library entries, user scores
// Then delete the user accounts
// Then trigger score recalculation for all affected manhwas
```

This should be run once via `npx ts-node scripts/cleanup-seed-accounts.ts` after the migration.

### 10.2 — ReviewCard Redesign

**File: `components/features/ReviewCard.tsx`**

Redesign to match the prototype. The review card is a social atom — it must be self-contained and look beautiful in any context (manhwa page, profile, home feed).

New structure:
```tsx
<article className="rounded-lg border border-electric-border bg-card p-5 flex flex-col gap-4">
  {/* Header */}
  <div className="flex items-center gap-3">
    <Avatar />
    <div>
      <span className="font-semibold text-text-primary">{username}</span>
      <span className="text-xs text-text-muted ml-2">{timeAgo}</span>
    </div>
    <span className="ml-auto font-bold text-gold">★ {score}</span>
  </div>

  {/* Manhwa reference (shows when used outside manhwa page) */}
  {showManhwa && (
    <div className="flex items-center gap-3 rounded bg-elevated p-2">
      <ManhwaThumbnail />
      <span className="text-sm font-semibold text-text-secondary">{manhwaTitle}</span>
    </div>
  )}

  {/* Review text */}
  <p className="text-text-secondary leading-relaxed [data-theme=light]:font-serif [data-theme=light]:italic line-clamp-4">
    {content}
  </p>

  {/* Reactions + like count */}
  <div className="flex items-center justify-between">
    <KoreanReactions ... />
    <LikeButton count={likes_count} />
  </div>
</article>
```

**`showManhwa` prop:** default `false` on manhwa page (redundant), `true` on profile, activity feed, home.

### 10.3 — Review Shareable OG Image

Each review at `/[locale]/manhwa/[slug]/review/[id]` already has its own route. Ensure it has a proper `generateMetadata()` with a dynamic OG image using `@vercel/og`. The OG image should show: manhwa cover, reviewer name + avatar, score, and a truncated quote.

---

## 11. NEW FEATURE — LISTS AS FIRST-CLASS CONTENT

### 11.1 — Audit current lists implementation

Before building, verify what exists:
- Check `/app/[locale]/(public)/lists/` routes
- Check `List` and `ListItem` Prisma models
- Check if `/lists/[slug]` has a proper `generateMetadata()` and Schema.org structured data

### 11.2 — List Detail Page SEO

**File: `app/[locale]/(public)/lists/[slug]/page.tsx`**

Must have:
```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const list = await getListBySlug(params.slug)
  return {
    title: `${list.title} — ManhwaVerse`,
    description: list.description ?? `A curated list of ${list.item_count} manhwa titles`,
    openGraph: {
      title: list.title,
      description: list.description,
      images: [{ url: `/api/og/list/${list.id}` }],
    },
    alternates: {
      canonical: `/${params.locale}/lists/${params.slug}`,
    },
  }
}
```

Add JSON-LD ItemList schema:
```tsx
<JsonLd data={{
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: list.title,
  description: list.description,
  numberOfItems: list.items.length,
  itemListElement: list.items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.manhwa.title_en,
    url: `https://manhwaverse.com/${locale}/manhwa/${item.manhwa.slug}`,
  })),
}} />
```

### 11.3 — ListCard Component

**New/Updated file: `components/features/lists/ListCard.tsx`**

```tsx
interface ListCardProps {
  list: {
    id: string
    slug: string
    title: string
    description?: string
    item_count: number
    likes_count: number
    user: { username: string; avatar_url?: string }
    preview_covers: string[]  // first 4 cover URLs
  }
  locale: string
}
```

Visual: 4-cover mosaic (2×2 grid), list title, author, item count, heart count. Subtle hover lift.

### 11.4 — Lists on Homepage

Feature top 6 lists in a 3-column grid on the homepage `HomeSection`. Query: most liked lists created in the last 30 days.

---

## 12. NEW FEATURE — FRIENDS-FIRST ACTIVITY FEED

### 12.1 — Feed Toggle on Homepage (logged-in users)

**File: `components/features/home/HomeActivityFeed.tsx`**

When user is logged in, show a toggle: `[Friends] [Everyone]`. Default: Friends if they follow at least 3 people, otherwise Everyone.

```tsx
const [feedMode, setFeedMode] = useState<'friends' | 'everyone'>('friends')

// Friends mode: WHERE activity.user_id IN (SELECT following_id FROM follows WHERE follower_id = currentUser.id)
// Everyone mode: global feed
```

The toggle is a small pill switcher:
```tsx
<div className="flex rounded-lg border border-electric-border overflow-hidden">
  <button className={feedMode === 'friends' ? 'bg-electric-glow text-electric px-3 py-1 text-xs font-semibold' : 'text-text-muted px-3 py-1 text-xs'}>
    Friends
  </button>
  <button className={feedMode === 'everyone' ? 'bg-electric-glow text-electric px-3 py-1 text-xs font-semibold' : 'text-text-muted px-3 py-1 text-xs'}>
    Everyone
  </button>
</div>
```

### 12.2 — Dedicated Activity Feed Page

**New file: `app/[locale]/(auth)/feed/page.tsx`**

Full-page friends activity feed. Similar to Letterboxd's home for logged-in users. Show: reading activity, new reviews, new lists, completions. 

Add to MobileNav as an icon (social/feed icon) and to Header dropdown under Community.

---

## 13. NEW FEATURE — PROFILE AS IDENTITY

### 13.1 — Profile Header Redesign

**File: `app/[locale]/(public)/profile/[username]/page.tsx`** or equivalent profile component.

New profile header structure:

```tsx
<div>
  {/* Banner (optional blurred cover from top-read manhwa) */}
  <div className="h-32 md:h-48 w-full relative overflow-hidden bg-elevated">
    {topManhwaCover && <Image src={topManhwaCover} fill className="object-cover blur-sm opacity-30" />}
  </div>

  {/* Profile info */}
  <div className="max-w-7xl mx-auto px-4 -mt-12 flex flex-col md:flex-row gap-6">
    {/* Avatar */}
    <div className="relative">
      <img className="w-24 h-24 rounded-full border-4 border-void ring-2 ring-electric" />
    </div>

    {/* Name + stats */}
    <div className="flex-1 pt-2">
      <h1 className="font-display text-2xl text-text-primary">{displayName}</h1>
      <p className="text-text-muted text-sm">@{username} · Member since {memberSince}</p>
      <p className="text-text-secondary mt-1">{bio}</p>

      {/* Stats row */}
      <div className="flex gap-6 mt-3">
        <span><strong>{titleCount}</strong> <span className="text-text-muted text-xs">Titles</span></span>
        <span><strong>{reviewCount}</strong> <span className="text-text-muted text-xs">Reviews</span></span>
        <span><strong>{followerCount}</strong> <span className="text-text-muted text-xs">Followers</span></span>
        <span><strong>{followingCount}</strong> <span className="text-text-muted text-xs">Following</span></span>
      </div>
    </div>

    {/* Follow button / Edit profile (own profile) */}
    <div className="flex gap-2 self-start pt-2">
      <FollowButton ... />
    </div>
  </div>

  {/* 4 Pinned Favorite Manhwas */}
  <div className="max-w-7xl mx-auto px-4 mt-6">
    <p className="text-xs uppercase tracking-widest text-text-muted mb-2">Favorites</p>
    <div className="flex gap-3">
      {[0,1,2,3].map(i => (
        <div key={i} className="w-16 h-[92px] rounded-md border border-electric-border bg-elevated overflow-hidden relative group cursor-pointer">
          {favorites[i]
            ? <Image src={favorites[i].cover_url} fill className="object-cover" />
            : isOwnProfile && <div className="flex h-full items-center justify-center text-text-muted text-xl">+</div>
          }
        </div>
      ))}
    </div>
  </div>

  {/* Taste signature */}
  <div className="max-w-7xl mx-auto px-4 mt-4">
    <div className="flex flex-wrap gap-2">
      <span className="text-xs text-text-muted">Top genres:</span>
      {topGenres.map(g => <span className="rounded-full bg-electric-glow text-electric text-xs px-3 py-1">{g}</span>)}
      <span className="text-xs text-text-muted ml-2">Top tropes:</span>
      {topTropes.map(t => <span className="rounded-full bg-elevated text-text-secondary text-xs px-3 py-1">{t}</span>)}
    </div>
  </div>
</div>
```

### 13.2 — Profile Tabs

```
[Library] [Reviews] [Lists] [Diary] [Stats]
```

All tabs rendered client-side with URL param `?tab=X` for shareability.

**Library tab:** Existing grid with status filters.

**Reviews tab:** Grid of ReviewCard components (with `showManhwa=true`).

**Lists tab:** Grid of ListCard components.

**Diary tab:** The reading diary for this user (public view = read-only, no date editing).

**Stats tab:** Genres donut chart (recharts), reading heatmap, score distribution, average score, total chapters read. Recharts components need color props updated to use `var(--color-electric)` etc.

### 13.3 — Allow users to pin 4 favorite manhwas

**DB:** Add `favorite_manhwas` (ordered array of 4 manhwa IDs) to `user_profile` table.

**Settings page update:** Add a section "My 4 Favorites" — search and select up to 4 manhwas.

**Server action:** `updateFavorites(userId, manhwaIds: string[])` — max 4, ordered.

---

## 14. MOBILE-FIRST RULES (APPLY TO ALL NEW AND UPDATED COMPONENTS)

Every single component must be verified at 375px (iPhone SE) before considering it done.

### Grid breakpoints:
```
Cards grid:       grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5
Rankings list:    always single column
Reviews grid:     grid-cols-1 md:grid-cols-2 lg:grid-cols-3
Lists grid:       grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
Gems grid:        grid-cols-3 sm:grid-cols-4 md:grid-cols-6
Two-col section:  grid-cols-1 lg:grid-cols-2
```

### Touch targets:
All interactive elements: minimum `min-h-[44px] min-w-[44px]` or `p-3` padding.

### Hero on mobile:
Stack vertically. Collage becomes a 3-card horizontal scroll strip below the text (not a 3×3 grid).

### Bottom nav padding:
All page content must have `pb-16 md:pb-0` to account for the fixed MobileNav.

### ThemeToggle on mobile:
Must be accessible. Include it in the mobile header (Header.tsx renders on mobile too for logo/locale, add ThemeToggle there at `md:hidden` size if needed, or show in the MobileNav as a small toggle in the top corner).

---

## 15. RECHARTS — THEME ADAPTATION

**File: `components/features/manhwa/ManhwaStats.tsx`**

Update all chart color props to use CSS variable values. Since recharts needs JS string values:

```tsx
// Create a hook to get theme-aware colors:
function useChartColors() {
  const { theme } = useTheme()
  return {
    primary:   theme === 'light' ? '#E8547A' : '#00E5CC',
    secondary: theme === 'light' ? '#B784C0' : '#7C5CFC',
    gold:      theme === 'light' ? '#C4883C' : '#F5C842',
    muted:     theme === 'light' ? '#C4A0AE' : '#454A60',
    bg:        theme === 'light' ? '#FFF0F3' : '#181C2A',
    text:      theme === 'light' ? '#2D1B24' : '#8890AA',
  }
}
```

Pass these values to `stroke`, `fill`, `tickFormatter` color props in recharts components.

---

## 16. TYPOGRAPHY PROSE (LIGHT MODE)

**File: `globals.css`** — add after existing utility classes:

```css
/* Light mode prose override */
[data-theme="light"] .prose {
  --tw-prose-body:       var(--color-text-secondary);
  --tw-prose-headings:   var(--color-text-primary);
  --tw-prose-links:      var(--color-electric);
  --tw-prose-bold:       var(--color-text-primary);
  --tw-prose-code:       var(--color-electric);
  --tw-prose-quotes:     var(--color-text-secondary);
  --tw-prose-hr:         var(--color-electric-border);
  --tw-prose-th-borders: var(--color-electric-border);
  --tw-prose-td-borders: var(--color-electric-border);
  --tw-prose-bullets:    var(--color-electric);
}
```

---

## 17. i18n — NO HARDCODED STRINGS

Every new component must use `useTranslations()` from `next-intl` for all user-facing strings.

For new features (diary, activity feed, favorites), add keys to both `/messages/en.json` and `/messages/fr.json`.

```json
// en.json additions:
{
  "diary": {
    "title": "My Reading Diary",
    "readAt": "Read on",
    "stats": "{count} manhwas read this year",
    "noEntries": "No entries yet. Start reading!"
  },
  "activity": {
    "friends": "Friends",
    "everyone": "Everyone",
    "rated": "rated",
    "completed": "completed",
    "added": "added to library",
    "reviewed": "reviewed",
    "createdList": "created a list"
  },
  "profile": {
    "favorites": "Favorites",
    "addFavorite": "Add favorite",
    "tasteSignature": "Reading taste",
    "tabs": {
      "library": "Library",
      "reviews": "Reviews",
      "lists": "Lists",
      "diary": "Diary",
      "stats": "Stats"
    }
  }
}
```

```json
// fr.json additions:
{
  "diary": {
    "title": "Mon Journal de Lecture",
    "readAt": "Lu le",
    "stats": "{count} manhwas lus cette année",
    "noEntries": "Aucune entrée. Commencez à lire !"
  },
  "activity": {
    "friends": "Amis",
    "everyone": "Tout le monde",
    "rated": "a noté",
    "completed": "a terminé",
    "added": "a ajouté à sa bibliothèque",
    "reviewed": "a reviewé",
    "createdList": "a créé une liste"
  },
  "profile": {
    "favorites": "Favoris",
    "addFavorite": "Ajouter un favori",
    "tasteSignature": "Goûts de lecture",
    "tabs": {
      "library": "Bibliothèque",
      "reviews": "Reviews",
      "lists": "Listes",
      "diary": "Journal",
      "stats": "Stats"
    }
  }
}
```

---

## 18. SEO — NON-NEGOTIABLE RULES

Every page (new or updated) must have:

```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    title: `... — ManhwaVerse`,
    description: `...`,
    openGraph: { title, description, images, type },
    alternates: {
      canonical: `/${params.locale}/...`,
      languages: {
        'en': `/en/...`,
        'fr': `/fr/...`,
      },
    },
  }
}
```

New pages SEO requirements:
- `/diary` — noindex (private user content)
- `/feed` — noindex (private user content)
- `/lists/[slug]` — index with ItemList schema (see Section 11.2)
- `/profile/[username]` — index (public profiles are SEO-valuable)

---

## 19. EXECUTION ORDER

Follow this order precisely. Each step must not break the build before proceeding.

```
Step 1:  npm install next-themes
Step 2:  Update app/fonts.ts (add Crimson Pro, DM Sans)
Step 3:  Rewrite globals.css completely (Section 3.2)
Step 4:  Add ThemeProvider to app/[locale]/layout.tsx
Step 5:  Remove className="dark" from app/layout.tsx
Step 6:  Create components/ui/ThemeToggle.tsx
Step 7:  Add ThemeToggle to Header.tsx + mobile Header
Step 8:  Run `npm run build` — must pass with 0 errors ✓

Step 9:  Token migration (Section 4) — replace all hardcoded hex
Step 10: Fix RankBadge.tsx inline styles (Section 4 critical fixes)
Step 11: Fix HomePodium.tsx medal classes
Step 12: Run `npm run build` — must pass ✓

Step 13: Homepage redesign (Section 5)
Step 14: Header.tsx full rewrite (Section 6.1)
Step 15: MobileNav.tsx cleanup (Section 6.2)
Step 16: Footer.tsx cleanup (Section 6.3)
Step 17: ManhwaCard.tsx class replacement (Section 7)
Step 18: ManhwaHero.tsx + ManhwaTabNav.tsx (Section 8)
Step 19: Run `npm run build` — must pass ✓

Step 20: Diary feature — DB migration + page + modal update (Section 9)
Step 21: ReviewCard redesign + cleanup script (Section 10)
Step 22: Lists SEO + ListCard (Section 11)
Step 23: Activity feed + friends toggle (Section 12)
Step 24: Profile redesign + favorites (Section 13)
Step 25: Recharts theme adaptation (Section 15)
Step 26: Prose light mode (Section 16)
Step 27: i18n keys (Section 17)
Step 28: Final `npm run build` — must pass ✓
Step 29: Verify all pages at 375px (mobile)
Step 30: Open PR into main
```

---

## 20. DO NOT TOUCH

- `lib/db/` — no changes
- `lib/scoring/` — no changes
- `lib/scores/ranks.ts` — no changes (rank definitions are correct)
- `app/api/` — no changes
- `prisma/schema.prisma` — only the two additions in Section 9.1 and 13.3
- `lib/auth.ts` — no changes
- Server actions in `app/actions/` — no changes except adding `updateFavorites` (Section 13.3) and `cleanupSeedAccounts` (Section 10.1)
- Admin panel routes — leave as-is
- Any script in `/scripts/` — only add `cleanup-seed-accounts.ts`

---

## FINAL CHECKLIST BEFORE PR

- [ ] `npm run build` passes with 0 errors and 0 type errors
- [ ] `npm run lint` passes with 0 errors  
- [ ] ThemeToggle persists across page navigation (test: toggle → click a manhwa → come back → theme preserved)
- [ ] ThemeToggle works on every existing page (not just homepage)
- [ ] Mobile (375px): homepage, manhwa detail, library, profile — all render correctly
- [ ] Dark mode: all pages look correct
- [ ] Light mode: all pages look correct
- [ ] No hardcoded `#00ffff` or `#0d0d16` remaining in components (grep check)
- [ ] Diary page accessible and works
- [ ] Activity feed toggle (friends/everyone) works
- [ ] Profile: 4 favorites can be set in settings and display on profile
- [ ] Lists: detail pages have correct metadata and schema.org
- [ ] No hydration mismatch warnings in console (ThemeToggle has mounted guard)
- [ ] `suppressHydrationWarning` on `<html>` element

---

*MANHWAVERSE_REDESIGN_PROMPT.md — v1.0 — March 2026*  
*Based on REDESIGN_AUDIT.md · Prototype: manhwaverse-home-redesign.html*
