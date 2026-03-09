# REDESIGN AUDIT — ManwhaBox / ManhwaVerse
> Generated: 2026-03-09 | Branch: main | Auditor: Claude Code

---

## TABLE OF CONTENTS

1. [Component Inventory](#1-component-inventory)
2. [Design Token Audit](#2-design-token-audit)
3. [Theme System Audit](#3-theme-system-audit)
4. [Global Styles Audit](#4-global-styles-audit)
5. [Layout Audit](#5-layout-audit)
6. [Navigation Components](#6-navigation-components)
7. [Page Routes](#7-page-routes)
8. [ManhwaCard Component](#8-manhwacard-component)
9. [Score / Rank System](#9-score--rank-system)
10. [Dependencies Relevant to UI](#10-dependencies-relevant-to-ui)
11. [Redesign Conflict Flags](#11-redesign-conflict-flags)
12. [Redesign Recommendations](#12-redesign-recommendations)

---

## 1. COMPONENT INVENTORY

### `/components/ui/`

| File | Description |
|------|-------------|
| `JsonLd.tsx` | Injects JSON-LD structured data scripts. No visual output, no classes. |

---

### `/components/layouts/`

#### `Header.tsx` (156 lines)
```
Props: none (hooks only)
Classes:
  root:     sticky top-0 z-50 border-b border-[rgba(0,255,255,0.07)] bg-[rgba(6,6,9,0.85)] backdrop-blur-md
  logo:     font-display text-2xl tracking-widest text-[#00ffff] drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]
  nav:      hidden items-center gap-3 md:flex
  nav links: text-[10px] font-medium uppercase tracking-wide text-[#9999b8] transition-colors hover:text-[#00ffff]
  dropdown: absolute left-0 top-full z-50 hidden min-w-[160px] rounded-lg border border-[rgba(0,255,255,0.12)] bg-[#0d0d16] p-1 shadow-lg group-hover:block
  sign-in:  bg-[#00ffff] px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-black
Hardcoded hex: #00ffff, #0d0d16, #9999b8, rgba(6,6,9,0.85), rgba(0,255,255,0.07/0.12)
Inline styles: none
```

#### `Footer.tsx` (100 lines)
```
Props: { locale: string }
Classes:
  root:     border-t border-white/5 bg-[#060609]
  links:    text-[#6b6b88] hover:text-[#00ffff]
  heading:  text-xs font-semibold uppercase tracking-widest text-[#9999b8]
Hardcoded hex: #060609, #6b6b88, #00ffff, #9999b8
Inline styles: none
```

#### `MobileNav.tsx` (118 lines)
```
Props: none (hooks only)
Classes:
  root:     fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-[rgba(0,255,255,0.07)] bg-[#08080e]/90 backdrop-blur-md
  badge:    absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff2d55] text-[9px] font-bold text-white
  active:   text-[#00ffff]
  inactive: text-[#6b6b88]
Hardcoded hex: #08080e, #ff2d55, #00ffff, #6b6b88, rgba(0,255,255,0.07)
Inline styles: none
Icons: 6 inline SVG components (no icon lib)
```

---

### `/components/features/`

#### `ManhwaCard.tsx` (120 lines) — CENTRAL COMPONENT
```typescript
interface ManhwaCardProps {
  manhwa:            ManhwaCardData | ManhwaCardPopupData
  locale:            string
  userContentFilter?: ContentFilter   // 'SAFE' | ...
  rankBadgeTop?:     boolean          // default false
  userScore?:        number | null
}
Classes:
  card:       group flex flex-col overflow-hidden rounded-lg border border-white/5 bg-[#0d0d16] card-hover
  cover:      relative aspect-[5/7] w-full overflow-hidden bg-[#111120]
  image:      object-cover transition-transform duration-300 group-hover:scale-105
  nsfw badge: rounded-md bg-[#ff2d55]/80 px-2 py-1 text-xs font-bold text-white
  score box:  rounded-md bg-[#060609]/80 px-1.5 py-0.5 backdrop-blur-sm
  score high: font-mono text-xs font-bold text-[#00ffff]   (score >= 8)
  score norm: font-mono text-xs font-bold text-[#e8e8f0]
  title:      truncate text-sm font-semibold text-[#e8e8f0] transition-colors group-hover:text-[#00ffff]
  genre pill: rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-[#6b6b88]
  no cover:   flex h-full items-center justify-center text-xs text-[#6b6b88]
Hardcoded hex: #0d0d16, #111120, #ff2d55, #060609, #00ffff, #e8e8f0, #6b6b88
Inline styles: none
```

#### `ManhwaCardSkeleton.tsx`
```
Props: none
Classes: aspect-[5/7] animate-pulse bg-elevated rounded-lg
Uses CSS variable class bg-elevated (token-based ✓)
```

#### `ManhwaCardPopup.tsx`
```typescript
interface ManhwaCardPopupProps {
  manhwa:   ManhwaCardPopupData
  locale:   string
  children: React.ReactNode
}
Classes: Hover-reveal popup layer, group pattern, z-10 absolute positioning
Framer Motion: AnimatePresence + motion.div for popup overlay
```

#### `ManhwaCardOverlay.tsx`
```
Overlay wrapper for interaction states
No distinct props beyond children/locale
```

#### `ManhwaHero.tsx`
```typescript
interface ManhwaHeroProps {
  manhwa:     ManhwaWithRelations
  locale:     string
  hasBanner?: boolean
  children?:  React.ReactNode
}
Hardcoded hex: rgba(0,255,255,0.06), rgba(0,255,255,0.2), #00bfff, rgba(0,0,0,0.7)
              #02A9FF (AniList brand), #2E51A2 (MAL brand)
Inline styles: none
```

#### `ManhwaBanner.tsx`
```
Banner image for top of manhwa page
Classes: absolute inset-0, object-cover, gradient overlays
```

#### `RankBadge.tsx` (44 lines) — INLINE STYLES PRESENT
```typescript
interface RankBadgeProps {
  rank:     Rank       // { slug, label, labelKr, color, colorGlow, minScore, maxScore }
  compact?: boolean    // default false
}
Inline style (BOTH compact and full modes):
  color:           rank.color
  borderColor:     rank.color
  borderWidth:     '1px'
  backgroundColor: `color-mix(in srgb, ${rank.color} 22%, rgb(8 8 12 / 0.85))`  ← compact
                   `color-mix(in srgb, ${rank.color} 12%, transparent)`          ← full
  --rank-glow:     rank.colorGlow   (CSS custom property for animation)
High rank classes: animate-rank-glow shadow-[0_0_16px_rgba(0,255,255,0.6)]
Hardcoded hex: rgba(0,255,255,0.6) in className
```

#### `library/ScoreBadge.tsx` (157 lines) — FRAMER MOTION + HARDCODED COLORS
```typescript
interface ScoreBadgeProps {
  score:              number | null
  hoverScore:         number | null
  scoreOpen:          boolean
  isPending:          boolean
  onBadgeClick:       () => void
  onScoreSet:         (value: number) => void
  onClearScore:       () => void
  onHoverScoreChange: (value: number | null) => void
}
Hardcoded color array (NOT CSS variables):
  BAR_COLORS = [
    '#ef4444',  // 1 — red
    '#f97316',  // 2 — orange
    '#f59e0b',  // 3 — amber
    '#eab308',  // 4 — yellow
    '#84cc16',  // 5 — lime
    '#22c55e',  // 6 — green
    '#14b8a6',  // 7 — teal
    '#06b6d4',  // 8 — cyan
    '#3b82f6',  // 9 — blue
    '#8b5cf6',  // 10 — purple
  ]
Framer Motion: motion.button, motion.span, motion.div, AnimatePresence
Dynamic colors applied via style={{ color, boxShadow }}
Bar heights: style={{ height: `${16 + i * 3}px` }}  (16px → 46px)
Token classes used: border-border, bg-elevated, bg-surface, text-text-primary, text-text-muted ✓
```

#### `manhwa/ScoreCard.tsx`
```typescript
interface ScoreCardProps {
  score:   number
  source:  string
  rank:    Rank | null
  detail:  string | null
}
Classes: bg-white/[0.04] border border-white/[0.06] (token-adjacent)
         text-text-primary text-text-muted ✓
```

#### `ReviewCard.tsx`
```typescript
interface ReviewCardProps {
  review:        ReviewWithUser
  currentUserId?: string
  isAdmin?:      boolean
  locale?:       string
  manhwaSlug?:   string
  preview?:      boolean
}
Classes:
  card:     bg-[#0d0d16]
  reaction: bg-[rgba(0,255,255,0.15)] text-[#00ffff]
  selected: bg-[#111120]
Hardcoded hex: #0d0d16, #111120, rgba(0,255,255,0.15), #00ffff
```

#### `ReviewForm.tsx`
```typescript
interface ReviewFormProps {
  manhwaId:            string
  hasExistingReviews?: boolean
}
Two modes: micro (280 chars) | full (10000 chars)
Dimension scoring: Story, Art, Characters, World (each 1-10)
Uses ScoreBadge internally
Framer Motion: AnimatePresence for mode transitions
```

#### `library/LibraryActions.tsx` (large — 17+ props)
```typescript
interface LibraryActionsProps {
  // Status, score, list, favorite state + all setters
  // ~17 props total for full library state management
}
Classes: bg-crystal-blue/20 text-crystal-blue hover:bg-crystal-blue/30  (legacy token ✓)
Framer Motion: AnimatePresence for add/remove animation
```

#### `FavoriteButton.tsx`
```typescript
interface FavoriteButtonProps {
  manhwaId:    string
  isFavorite:  boolean
  isInLibrary: boolean
  isLoggedIn:  boolean
}
Framer Motion: whileTap={{ scale: 0.8 }} on heart icon
Classes: text-[#ff2d55] for filled heart
```

#### `FollowButton.tsx`
```typescript
interface FollowButtonProps {
  targetUserId:     string
  initialFollowing: boolean
  isLoggedIn:       boolean
}
Three states: Follow / Following (hover → Unfollow)
Classes: border-border bg-transparent hover:bg-elevated (tokens ✓)
         text-[#00ffff] for following state
```

#### `manhwa/KoreanReactions.tsx`
```typescript
interface KoreanReactionsProps {
  manhwaId:      string
  counts:        { heol, daebak, gamdong, kingbat, michyeo, jukget }
  userReactions: Set<string>
  isLoggedIn:    boolean
}
6 reactions: 헐(wow) 대박(amazing) 감동(moved) 킹받(annoying) 미쳤(crazy) 죽겠(dying)
```

#### `NotificationBell.tsx`
```
Props: none
Classes: relative rounded-md p-1.5 text-text-muted transition-colors hover:text-text-primary ✓
Badge:  absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red text-[9px]
```

#### `NotificationDropdown.tsx`
```typescript
interface NotificationDropdownProps {
  locale:  string
  onClose: () => void
  onRead:  () => void
}
Classes: w-80 rounded-xl border border-border bg-elevated shadow-xl z-50 (tokens ✓)
         max-h-96 overflow-y-auto
```

#### `SearchBar.tsx`
```typescript
interface SearchBarProps {
  defaultValue?:   string
  locale:          string
  basePath?:       string
  currentStatus?:  string
  currentType?:    string
  currentSort?:    string
  currentGenre?:   string
  currentTrope?:   string
  currentYear?:    string
  genres?:         Genre[]
  tropes?:         Trope[]
}
Filters: Status (ONGOING/COMPLETED/HIATUS/CANCELLED), Type (MANHWA/MANHUA/MANHWA-COLOR),
         Sort (relevance/score/popularity/recent), Year (2018–current)
Classes: bg-[rgba(0,255,255,0.08)] border-[rgba(0,255,255,0.2)]
Chip component: inline with hardcoded rgba values
```

#### `HomeFilterBar.tsx`
```
Homepage-specific filter row
Classes: similar electric rgba pattern
```

#### `home/HomePodium.tsx`
```typescript
interface HomePodiumProps {
  top3:         RankedManhwa[]
  locale:       string
  readersLabel: string
}
Podium heights: 1st=h-[260px], 2nd/3rd=h-[220px]
Medal styles (HARDCODED, no tokens):
  Gold:   ring-2 ring-[#ffd700] shadow-[0_0_24px_rgba(255,215,0,0.3)]
  Silver: ring-2 ring-[#c0c0c0] shadow-[0_0_16px_rgba(192,192,192,0.2)]
  Bronze: ring-2 ring-[#cd7f32] shadow-[0_0_16px_rgba(205,127,50,0.2)]
```

#### `home/HomeRanking.tsx` / `HomeRankingList.tsx`
```
Async server components fetching top-10
Classes: text-text-muted, border-border tokens ✓
Rank number: font-display text-[#6b6b88]
```

#### `HomeSection.tsx`
```typescript
interface HomeSectionProps {
  title:    string
  href?:    string
  children: React.ReactNode
}
Uses .section-title-bar CSS class (3px electric left bar pseudo-element)
```

#### `ActivityCard.tsx`
```typescript
Props: ActivityWithContext (social feed event)
Classes: bg-elevated border-border (tokens ✓)
```

#### `blog/ArticleCard.tsx`
```
Blog card display
Classes: bg-[#0d0d16] border-[rgba(0,255,255,0.12)]
```

#### `blog/MarkdownRenderer.tsx`
```
Props: { content: string }
Uses @tailwindcss/typography prose classes
```

#### `blog/RichEditor.tsx`
```
Rich text editor for article submission
No dedicated styling library (custom)
```

#### `manhwa/ManhwaStats.tsx`
```
Statistics section on manhwa page
Recharts charts (recharts@3.7.0)
```

#### `manhwa/CharacterVoting.tsx`
```typescript
Props: { manhwaId, characters, userVote }
Vote buttons with loading state
```

#### `manhwa/ManhwaTabNav.tsx`
```
Tab navigation: Overview / Characters / Staff / Reviews / Stats
Active: text-[#00ffff] border-b-2 border-[#00ffff]
```

#### `manhwa/ControversyBadge.tsx`
```
Warning badge for controversial manhwas
Classes: bg-[#ff2d55]/10 text-[#ff2d55] border-[#ff2d55]/20
```

#### `manhwa/WhereToRead.tsx`
```
Reading platform links (Webtoon, Tapas, etc.)
```

#### `manhwa/PhysicalEditions.tsx`
```
Physical book editions with affiliate links
Classes: bg-[#0d0d16] border-[rgba(0,255,255,0.2)]
```

#### `store/ProductCard.tsx`
```typescript
interface ProductCardProps { product: Product }
Classes: bg-[#0d0d16] border-[rgba(0,255,255,0.2)] hover:border-[rgba(0,255,255,0.4)]
```

#### `store/WishlistButton.tsx`
```
Wishlist toggle button
```

#### `MatureGate.tsx`
```
NSFW content gate overlay with confirm/cancel
```

#### `ScrollableRow.tsx`
```typescript
interface ScrollableRowProps {
  children:    React.ReactNode
  className?:  string
}
Uses scrollbar-none utility class
```

#### `poll/PollWidget.tsx`
```
Poll/voting widget for articles/events
```

#### `SynopsisSection.tsx`
```
Expandable synopsis with show more/less
```

#### `TropeList.tsx`
```
Trope tag pills list
Classes: rounded-full bg-elevated text-text-secondary (tokens ✓)
```

#### `library/LibraryQuickDropdown.tsx`
```
Quick status change dropdown from card
```

#### `library/ListEditorModal.tsx`
```
Full library entry editor modal (status, score, dates, notes, tags)
Framer Motion: AnimatePresence for modal entry/exit
```

#### `PageContainer.tsx`
```typescript
interface PageContainerProps {
  children:   React.ReactNode
  className?: string
}
Classes: mx-auto max-w-7xl px-4 sm:px-6 lg:px-8
```

---

## 2. DESIGN TOKEN AUDIT

### Token System: Tailwind CSS v4 `@theme inline` in `globals.css`
> No `tailwind.config.ts` file exists. All config is in `globals.css` via `@theme inline`.

### CSS Variables (Full List)

#### Backgrounds
| Variable | Value | Tailwind Class |
|----------|-------|----------------|
| `--color-void` | `#060609` | `bg-void` |
| `--color-deep` | `#08080e` | `bg-deep` |
| `--color-card` | `#0d0d16` | `bg-card` |
| `--color-section` | `#0a0a13` | `bg-section` |
| `--color-elevated` | `#111120` | `bg-elevated` |

#### Electric Brand
| Variable | Value | Tailwind Class |
|----------|-------|----------------|
| `--color-electric` | `#00ffff` | `text-electric`, `bg-electric` |
| `--color-electric-dim` | `#00bfff` | `text-electric-dim` |
| `--color-electric-glow` | `rgba(0,255,255,0.15)` | `bg-electric-glow` |
| `--color-electric-border` | `rgba(0,255,255,0.12)` | `border-electric-border` |
| `--color-electric-border-hover` | `rgba(0,255,255,0.3)` | `border-electric-border-hover` |

#### Text
| Variable | Value | Tailwind Class |
|----------|-------|----------------|
| `--color-text-primary` | `#e8e8f0` | `text-text-primary` |
| `--color-text-secondary` | `#9999b8` | `text-text-secondary` |
| `--color-text-muted` | `#6b6b88` | `text-text-muted` |

#### Accents
| Variable | Value | Tailwind Class |
|----------|-------|----------------|
| `--color-gold` | `#ffd700` | `text-gold`, `bg-gold` |
| `--color-red` | `#ff2d55` | `text-red`, `bg-red` |
| `--color-success` | `#4ade80` | `text-success` |
| `--color-warning` | `#fbbf24` | `text-warning` |
| `--color-error` | `#ef4444` | `text-error` |

#### Legacy Aliases (backwards compat, not fully migrated)
| Variable | Value |
|----------|-------|
| `--color-base` | `#060609` (= void) |
| `--color-surface` | `#0d0d16` (= card) |
| `--color-border` | `rgba(0,255,255,0.12)` (= electric-border) |
| `--color-crystal-blue` | `#00ffff` (= electric) |
| `--color-crystal-gold` | `#ffd700` (= gold) |
| `--color-crystal-red` | `#ff2d55` (= red) |

### Font Variables
| Variable | Value | Tailwind Class |
|----------|-------|----------------|
| `--font-display` | `'Bebas Neue', sans-serif` | `font-display` |
| `--font-sans` | `'Sora', sans-serif` | `font-sans` |
| `--font-mono` | `'JetBrains Mono', monospace` | `font-mono` |

### Border Radius Variables
| Variable | Value | Tailwind Class |
|----------|-------|----------------|
| `--radius-sm` | `2px` | `rounded-sm` |
| `--radius-md` | `6px` | `rounded-md` |
| `--radius-lg` | `8px` | `rounded-lg` |
| `--radius-xl` | `12px` | `rounded-xl` |
| `--radius-2xl` | `16px` | `rounded-2xl` |
| `--radius-full` | `9999px` | `rounded-full` |

### Box Shadow Values (All Hardcoded in CSS/Components)
| Location | Value |
|----------|-------|
| `.card-hover:hover` | `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,255,255,0.12), 0 4px 20px rgba(0,255,255,0.08)` |
| `.electric-glow` (text-shadow) | `0 0 20px rgba(0,255,255,0.4)` |
| `.section-title-bar::before` | `0 0 8px rgba(0,255,255,0.6)` |
| `@keyframes rank-glow` | `0 0 8px var(--rank-glow)` → `0 0 20px + 0 0 40px` |
| `RankBadge` (high rank) | `shadow-[0_0_16px_rgba(0,255,255,0.6)]` |
| `HomePodium` gold | `shadow-[0_0_24px_rgba(255,215,0,0.3)]` |
| `HomePodium` silver | `shadow-[0_0_16px_rgba(192,192,192,0.2)]` |
| `HomePodium` bronze | `shadow-[0_0_16px_rgba(205,127,50,0.2)]` |
| Header sign-in hover | `0 8px 24px rgba(0,255,255,0.35)` |
| `ManhwaHero` image | `shadow-[0_0_60px_rgba(0,0,0,0.7)]` |

### Hardcoded Colors NOT Using Tokens (Arbitrary Tailwind Values)

> **~100+ occurrences.** These all need to be migrated to token classes during redesign.

| Hex Value | Token Equivalent | Occurrences |
|-----------|-----------------|-------------|
| `#00ffff` | `--color-electric` / `text-electric` | ~50+ |
| `#00bfff` | `--color-electric-dim` / `text-electric-dim` | ~15+ |
| `#0d0d16` | `--color-card` / `bg-card` | ~20+ |
| `#111120` | `--color-elevated` / `bg-elevated` | ~10+ |
| `#060609` | `--color-void` / `bg-void` | ~10+ |
| `#08080e` | `--color-deep` / `bg-deep` | ~3+ |
| `#e8e8f0` | `--color-text-primary` / `text-text-primary` | ~25+ |
| `#9999b8` | `--color-text-secondary` / `text-text-secondary` | ~15+ |
| `#6b6b88` | `--color-text-muted` / `text-text-muted` | ~30+ |
| `#ff2d55` | `--color-red` / `text-red` | ~8+ |
| `#ffd700` | `--color-gold` / `text-gold` | ~5+ |
| `#c0c0c0` | (no token — silver medal) | 2 |
| `#cd7f32` | (no token — bronze medal) | 2 |
| `#02A9FF` | (no token — AniList brand) | 1 |
| `#2E51A2` | (no token — MAL brand) | 1 |
| Various `rgba(0,255,255, X)` | electric-border / electric-glow variants | ~40+ |

---

## 3. THEME SYSTEM AUDIT

### Current State: Dark-Only, No Theme Switching

| Question | Answer |
|---------|--------|
| Theme library | **None** — no `next-themes`, no `@radix-ui/themes` |
| Theme context | **None** |
| `dark:` Tailwind prefix | **Not used anywhere** in the codebase |
| `data-theme` attribute | **Not used** |
| Class-based dark mode | `className="dark"` hardcoded on `<html>` in `app/layout.tsx:11` |
| Light mode support | **None** |
| Toggle mechanism | **None** |
| Default theme | Dark (electric blue) — fixed |

### How It Works
- `<html className="dark">` is hardcoded
- All CSS variables are defined globally (no `:root.dark` variants)
- There is no mechanism to switch themes
- `globals.css` uses `@theme inline` (Tailwind v4 syntax), not `@layer base`

### To Add Light Mode (Future)
Would require:
1. Adding `next-themes` + `ThemeProvider`
2. Defining `:root.light` variable overrides in `globals.css`
3. Using `dark:` Tailwind prefix on all components
4. Migrating all hardcoded hex values to token classes first

---

## 4. GLOBAL STYLES AUDIT

### `app/globals.css` — FULL CONTENT (157 lines)

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme inline {
  /* Backgrounds */
  --color-void: #060609;
  --color-deep: #08080e;
  --color-card: #0d0d16;
  --color-section: #0a0a13;
  --color-elevated: #111120;

  /* Electric brand */
  --color-electric: #00ffff;
  --color-electric-dim: #00bfff;
  --color-electric-glow: rgba(0, 255, 255, 0.15);
  --color-electric-border: rgba(0, 255, 255, 0.12);
  --color-electric-border-hover: rgba(0, 255, 255, 0.3);

  /* Text */
  --color-text-primary: #e8e8f0;
  --color-text-secondary: #9999b8;
  --color-text-muted: #6b6b88;

  /* Accents */
  --color-gold: #ffd700;
  --color-red: #ff2d55;
  --color-success: #4ade80;
  --color-warning: #fbbf24;
  --color-error: #ef4444;

  /* Legacy aliases */
  --color-base: #060609;
  --color-surface: #0d0d16;
  --color-border: rgba(0, 255, 255, 0.12);
  --color-crystal-blue: #00ffff;
  --color-crystal-gold: #ffd700;
  --color-crystal-red: #ff2d55;

  /* Fonts */
  --font-display: 'Bebas Neue', sans-serif;
  --font-sans: 'Sora', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Radii */
  --radius-sm: 2px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-full: 9999px;
}

/* ─── Base Styles ─── */
body {
  background: var(--color-void);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Section alternation */
.section-alt {
  background: var(--color-section);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

/* Electric glow utility */
.electric-glow {
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
}

/* Card hover standard */
.card-hover {
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}
.card-hover:hover {
  transform: translateY(-4px) scale(1.01);
  border-color: rgba(0, 255, 255, 0.25);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 255, 255, 0.12), 0 4px 20px rgba(0, 255, 255, 0.08);
}

/* Section title bar — 3px electric left bar */
.section-title-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}
.section-title-bar::before {
  content: '';
  width: 3px;
  height: 1.25rem;
  background: #00ffff;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.6);
  border-radius: 2px;
  flex-shrink: 0;
}

/* ─── Keyframe Animations ─── */
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

/* ─── Utilities ─── */
@utility scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}

/* ─── Scrollbar ─── */
::-webkit-scrollbar       { width: 5px; }
::-webkit-scrollbar-track { background: var(--color-void); }
::-webkit-scrollbar-thumb { background: rgba(0,255,255,0.2); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(0,255,255,0.35); }
```

### Custom CSS Classes (non-Tailwind, defined in globals.css)
| Class | Description |
|-------|-------------|
| `.section-alt` | Alternating section background |
| `.electric-glow` | text-shadow cyan glow effect |
| `.card-hover` | Card lift + shadow on hover |
| `.section-title-bar` | Left 3px electric bar via `::before` |
| `.animate-rank-glow` (`@utility`) | Pulsing glow for S/SS/SSS ranks |
| `.scrollbar-none` (`@utility`) | Hide scrollbar cross-browser |

### Custom `@keyframes` (6 total)
| Name | Used By |
|------|---------|
| `crystal-fill` | Crystal/score animations (legacy?) |
| `crystal-shimmer` | Crystal/score shimmer (legacy?) |
| `count-up` | Score count display |
| `stagger-reveal` | List item entrance |
| `rank-glow` | `animate-rank-glow` utility, RankBadge |
| `ticker` | News ticker component |
| `blob-float` | Hero background blob |

---

## 5. LAYOUT AUDIT

### Root Layout: `app/layout.tsx`
```typescript
// Applies 3 font variable classes + body classes
// HTML: <html lang={locale} className="dark" suppressHydrationWarning>
// Body: `${bebasNeue.variable} ${sora.variable} ${jetbrainsMono.variable} overflow-x-hidden bg-void text-text-primary antialiased`
// Imports: app/globals.css
// No inline styles on html or body
```

### Locale Layout: `app/[locale]/layout.tsx` (90 lines)
```
Provider tree:
  NextIntlClientProvider (i18n, EN/FR)
  └─ SessionProvider (Auth.js)
     └─ PostHogTracker (analytics)
        └─ Header (sticky nav)
        └─ div.min-h-screen.pb-16.md:pb-0  ← main content area
           └─ {children}
        └─ Footer
        └─ MobileNav (md:hidden, fixed bottom)
```

### Fonts: `app/fonts.ts`
```typescript
import { Bebas_Neue, Sora, JetBrains_Mono } from 'next/font/google'

export const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const sora = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
})
```

### Font → Class Mapping
| Font | CSS Variable | Tailwind Class | Used For |
|------|-------------|----------------|---------|
| Bebas Neue | `--font-display` | `font-display` | Headings, rank badges, logo |
| Sora | `--font-sans` | `font-sans` (default body) | Body copy, UI text |
| JetBrains Mono | `--font-mono` | `font-mono` | Score numbers, code |

### `<html>` Element
```
lang="{locale}"
className="dark"
suppressHydrationWarning
```

### `<body>` Element
```
className="{bebasNeue.variable} {sora.variable} {jetbrainsMono.variable} overflow-x-hidden bg-void text-text-primary antialiased"
```
**No inline styles on html or body.**

---

## 6. NAVIGATION COMPONENTS

### Header (`components/layouts/Header.tsx`)

**Desktop Structure:**
```
<header sticky top-0 z-50 backdrop-blur-md>
  <div max-w-7xl>
    Logo (MANHWAVERSE — font-display cyan)
    <nav hidden md:flex>
      Discover → /discover
      Browse ↓ (dropdown)
        Characters → /character
        Staff → /people
        Publishers → /publisher
      News → /news
      Community ↓ (dropdown)
        Members → /members
        Lists → /lists
        Artwork → /artwork
      [Library → /library]  (auth only)
    </nav>
    <div right side>
      Locale switcher (EN ↔ FR)
      <NotificationBell />   (auth only)
      [Sign In button]       (guest)
      [Profile link]         (auth)
      [Sign Out button]      (auth)
    </div>
  </div>
</header>
```

**Dropdown Mechanism:** Pure CSS `group-hover:block` (no JS, no state)

**Mobile Header:** Logo + locale switcher only (nav hidden on mobile, handled by MobileNav)

---

### MobileNav (`components/layouts/MobileNav.tsx`)

**Bottom fixed nav, `md:hidden`:**
```
Home       → /
Discover   → /discover
Library    → /library  (auth: shows, guest: hidden)
Explore    → /explore  (guest: shows in Library slot)
Notifications → /notifications  (auth only, with badge)
Profile    → /profile  (auth) / Sign In → /sign-in (guest)
```

**6 inline SVG icons** — no external icon library

---

## 7. PAGE ROUTES

All routes under `app/[locale]/(public)/`:

| Route | File | Purpose | Auth | UI Complexity |
|-------|------|---------|------|---------------|
| `/` | `page.tsx` | Homepage — hero, podium, rankings, sections | Public | ⬛⬛⬛⬛⬛ Very High |
| `/top` | `top/page.tsx` | Top 100 ranked manhwas | Public | ⬛⬛⬛⬛ High |
| `/explore` | `explore/page.tsx` | Paginated browsing | Public | ⬛⬛⬛⬛ High |
| `/search` | `search/page.tsx` | Full-text search + filters | Public | ⬛⬛⬛⬛ High |
| `/genre/[slug]` | `genre/[slug]/page.tsx` | Genre filtered grid | Public | ⬛⬛⬛ Medium |
| `/trope/[slug]` | `trope/[slug]/page.tsx` | Trope filtered grid | Public | ⬛⬛⬛ Medium |
| `/manhwa/[slug]` | `manhwa/[slug]/page.tsx` | **Manhwa detail** | Public | ⬛⬛⬛⬛⬛ Very High |
| `/manhwa/[slug]/review/[id]` | nested | Single review page | Public | ⬛⬛ Low |
| `/library` | `library/page.tsx` | User library grid | Protected | ⬛⬛⬛⬛⬛ Very High |
| `/profile` | `profile/page.tsx` | Own profile | Protected | ⬛⬛⬛⬛ High |
| `/profile/[username]` | `profile/[username]/page.tsx` | Public profile | Public | ⬛⬛⬛⬛ High |
| `/profile/[username]/journal` | nested | Activity journal | Public | ⬛⬛⬛ Medium |
| `/members` | `members/page.tsx` | User directory | Public | ⬛⬛⬛ Medium |
| `/lists` | `lists/page.tsx` | Community lists | Public | ⬛⬛⬛ Medium |
| `/lists/[slug]` | nested | View list | Public | ⬛⬛⬛ Medium |
| `/lists/new` | nested | Create list | Protected | ⬛⬛⬛ Medium |
| `/artwork` | `artwork/page.tsx` | Fan art gallery | Public | ⬛⬛⬛ Medium |
| `/artwork/[postId]` | nested | View art post | Public | ⬛⬛⬛ Medium |
| `/artwork/new` | nested | Upload art | Protected | ⬛⬛⬛ Medium |
| `/blog` | `blog/page.tsx` | Blog listing | Public | ⬛⬛⬛ Medium |
| `/blog/[slug]` | nested | Article detail | Public | ⬛⬛⬛ Medium |
| `/blog/submit` | nested | Submit article | Protected | ⬛⬛⬛ Medium |
| `/blog/category/[cat]` | nested | Category filter | Public | ⬛⬛ Low |
| `/blog/user/[username]` | nested | User articles | Public | ⬛⬛ Low |
| `/blog/my-articles` | nested | My articles | Protected | ⬛⬛⬛ Medium |
| `/news` | `news/page.tsx` | News feed | Public | ⬛⬛⬛ Medium |
| `/character` | `character/page.tsx` | Character browse | Public | ⬛⬛⬛ Medium |
| `/character/[slug]` | nested | Character detail | Public | ⬛⬛⬛ Medium |
| `/people` | `people/page.tsx` | Staff/creator browse | Public | ⬛⬛⬛ Medium |
| `/publisher` | `publisher/page.tsx` | Publisher browse | Public | ⬛⬛⬛ Medium |
| `/publisher/[slug]` | nested | Publisher detail | Public | ⬛⬛⬛ Medium |
| `/store` | `store/page.tsx` | Affiliate store | Public | ⬛⬛⬛ Medium |
| `/notifications` | `notifications/page.tsx` | Notification page | Protected | ⬛⬛⬛ Medium |
| `/settings` | `settings/page.tsx` | User settings | Protected | ⬛⬛⬛ Medium |
| `/admin/*` | `admin/` | Admin panel | Admin only | ⬛⬛⬛⬛ High |
| `/challenge` | `challenge/page.tsx` | Challenges/events | Public | ⬛⬛⬛ Medium |
| `/about` | `about/page.tsx` | About page | Public | ⬛ Low |
| `/faq` | `faq/page.tsx` | FAQ | Public | ⬛ Low |
| `/privacy` | `privacy/page.tsx` | Privacy policy | Public | ⬛ Low |
| `/terms` | `terms/page.tsx` | Terms of service | Public | ⬛ Low |
| `/sign-in` | `sign-in/page.tsx` | Auth / sign in | Public | ⬛⬛ Low |

**Most UI-Complex Pages (redesign focus):**
1. `/manhwa/[slug]` — hero, tabs, stats, reviews, characters, relations, score card
2. `/` — hero, podium, ranking list, multiple sections
3. `/library` — filterable grid + list view + score management
4. `/profile/[username]` — stats, activity, reviews, favorite list
5. `/explore` — search bar + filters + infinite grid

---

## 8. MANHWACARD COMPONENT

### Full Source: `components/features/ManhwaCard.tsx`

```tsx
import Image from 'next/image'
import Link from 'next/link'
import type { ManhwaCardData, ManhwaCardPopupData } from '@/lib/db/manhwa'
import type { ContentFilter } from '@prisma/client'
import { shouldBlurCover } from '@/lib/nsfw'
import { getRankFromScore } from '@/lib/scores/ranks'
import { RankBadge } from '@/components/features/RankBadge'
import { formatScore } from '@/lib/utils/formatScore'
import { ManhwaCardPopup } from '@/components/features/ManhwaCardPopup'

interface ManhwaCardProps {
  manhwa:            ManhwaCardData | ManhwaCardPopupData
  locale:            string
  userContentFilter?: ContentFilter
  rankBadgeTop?:     boolean   // default false
  userScore?:        number | null
}

function isPopupData(manhwa): manhwa is ManhwaCardPopupData {
  return 'trope_links' in manhwa
}

export function ManhwaCard({ manhwa, locale, userContentFilter = 'SAFE', rankBadgeTop = false, userScore }) {
  const title = locale === 'fr' ? (manhwa.title_fr ?? manhwa.title_en) : manhwa.title_en
  const displayScore = manhwa.display_score
  const rank = getRankFromScore(displayScore, manhwa.score_count)
  const blurCover = shouldBlurCover(manhwa, userContentFilter)

  const card = (
    <Link
      href={`/${locale}/manhwa/${manhwa.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-white/5 bg-[#0d0d16] card-hover"
    >
      {/* Cover — aspect-[5/7] */}
      <div className="relative aspect-[5/7] w-full overflow-hidden bg-[#111120]">
        {manhwa.cover_url ? (
          <Image
            src={manhwa.cover_url}
            alt={title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 180px"
            className={`object-cover transition-transform duration-300 group-hover:scale-105 ${blurCover ? 'blur-xl' : ''}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[#6b6b88]">No Cover</div>
        )}

        {blurCover && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-md bg-[#ff2d55]/80 px-2 py-1 text-xs font-bold text-white">18+</span>
          </div>
        )}

        {rankBadgeTop && rank && (
          <div className="absolute right-2 top-2 backdrop-blur-sm">
            <RankBadge rank={rank} compact />
          </div>
        )}

        {displayScore && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-[#060609]/80 px-1.5 py-0.5 backdrop-blur-sm">
            <span className="text-xs text-yellow-400">★</span>
            <span className={`font-mono text-xs font-bold ${displayScore >= 8 ? 'text-[#00ffff]' : 'text-[#e8e8f0]'}`}>
              {formatScore(displayScore)}
            </span>
            {!rankBadgeTop && rank && <RankBadge rank={rank} compact />}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5">
        <h3 className="truncate text-sm font-semibold text-[#e8e8f0] transition-colors group-hover:text-[#00ffff]">
          {title}
        </h3>
        {userScore != null && (
          <p className="mt-0.5 text-[11px] text-[#6b6b88]">
            {locale === 'fr' ? 'Noté' : 'Rated'}{' '}
            <span className="font-mono font-semibold text-[#00ffff]">{formatScore(userScore)}</span>
          </p>
        )}
        {manhwa.genre_links.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {manhwa.genre_links.slice(0, 2).map((gl) => (
              <span key={gl.genre.name_en} className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-[#6b6b88]">
                {locale === 'fr' ? gl.genre.name_fr : gl.genre.name_en}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )

  if (isPopupData(manhwa)) {
    return <ManhwaCardPopup manhwa={manhwa} locale={locale}>{card}</ManhwaCardPopup>
  }

  return card
}
```

### Card Variants Summary
| Feature | Value |
|---------|-------|
| Aspect ratio | `5/7` (standard manhwa cover) |
| `rankBadgeTop=false` (default) | Rank badge inside score box (bottom-left overlay) |
| `rankBadgeTop=true` | Rank badge top-right corner |
| `userScore` provided | Shows "Rated X.X" line below title |
| `userContentFilter` triggers blur | Blurs cover + shows 18+ badge |
| Popup variant | Wraps in `ManhwaCardPopup` if data has `trope_links` |
| Score color threshold | `>= 8.0` → cyan, `< 8.0` → white |

---

## 9. SCORE / RANK SYSTEM

### Rank Definitions: `lib/scores/ranks.ts`

```typescript
export interface Rank {
  slug:       string
  label:      string    // 'SSS-Rank', 'S-Rank', etc.
  labelKr:    string    // 'SSS급', 'S급', etc.
  creature:   string    // 'Hwanin', 'Gumiho', etc.
  creatureKr: string    // '환인', '구미호', etc.
  minScore:   number
  maxScore:   number
  color:      string    // hex
  colorGlow:  string    // rgba for glow animation
}
```

### All Ranks

| Rank | Score Range | Color | Creature |
|------|-------------|-------|---------|
| SSS-Rank `sss-rank` | 10.0 | `#FFFFFF` (white) | Hwanin 환인 |
| SS-Rank `ss-rank` | 9.5–9.99 | `#E879F9` (purple-pink) | Cheong-ryong 청룡 |
| S-Rank `s-rank` | 9.0–9.49 | `#C9A84C` (gold) | Gumiho 구미호 |
| A-Rank `a-rank` | 8.0–8.99 | `#F59E0B` (amber) | Imugi 이무기 |
| B-Rank `b-rank` | 7.0–7.99 | `#10B981` (emerald) | Bulgasari 불가사리 |
| C-Rank `c-rank` | 6.0–6.99 | `#3B82F6` (blue) | Haetae 해태 |
| D-Rank `d-rank` | 4.0–5.99 | `#8B5CF6` (violet) | Dokkaebi 도깨비 |
| E-Rank `e-rank` | 0–3.99 | `#6B7280` (gray) | Slime 슬라임 |

**High Ranks (animate-rank-glow):** SSS, SS, S

### RankBadge Rendering Strategy
```
RankBadge uses inline style={{ color-mix() }} — cannot be overridden with Tailwind alone.
The background is dynamically blended: color-mix(in srgb, {rank.color} 22%, rgb(8 8 12 / 0.85))
To change the dark base color (#08080c) during redesign: must edit RankBadge.tsx component.
```

### Score Color Array: `ScoreBadge.tsx` BAR_COLORS
```
Score 1  → #ef4444  (red)
Score 2  → #f97316  (orange)
Score 3  → #f59e0b  (amber)
Score 4  → #eab308  (yellow)
Score 5  → #84cc16  (lime)
Score 6  → #22c55e  (green)
Score 7  → #14b8a6  (teal)
Score 8  → #06b6d4  (cyan)
Score 9  → #3b82f6  (blue)
Score 10 → #8b5cf6  (purple)
```
> These 10 colors are hardcoded in `ScoreBadge.tsx:6–9` — not CSS variables.

### Score Phases (from scoring engine)
| Phase | Condition | Badge text |
|-------|-----------|------------|
| BOOTSTRAP | score_count < 10 or reader_count < 20 | "BOOTSTRAP" |
| GROWING | score_count ≥ 10 AND reader_count ≥ 20 | "GROWING" |
| MATURE | score_count ≥ 50 AND reader_count ≥ 200 | "BLENDED" |

### Scoring Engine Location
- `lib/scoring/` — 3-phase scoring
- `lib/scoring/realtime.ts` — `recalculateSingleManhwaScore()`
- `lib/scores/ranks.ts` — Rank definitions + `getRankFromScore()`

---

## 10. DEPENDENCIES RELEVANT TO UI

From `package.json`:

### Animation Libraries
| Package | Version | Usage |
|---------|---------|-------|
| `framer-motion` | `^12.34.3` | 48+ usages across components (motion.div, AnimatePresence, spring physics) |

### Icon Libraries
> **None.** All icons are inline SVG written directly in component JSX.

### UI Component Libraries
> **None.** No shadcn/ui, Radix UI, Chakra, Material-UI, or any component library.
> Everything is hand-built with Tailwind.

### CSS-in-JS Libraries
> **None.** No styled-components, @emotion, or styled-jsx.

### Styling & CSS
| Package | Version |
|---------|---------|
| `tailwindcss` | `^4` (v4) |
| `@tailwindcss/postcss` | `^4` |
| `@tailwindcss/typography` | (plugin, via `@plugin` in globals.css) |

### Other UI-Adjacent Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `recharts` | `^3.7.0` | Charts (ManhwaStats page) |
| `react-markdown` | `^10.1.0` | Article/review rendering |
| `remark-gfm` | `^4.0.1` | Markdown extensions |
| `rehype-raw` | `^7.0.0` | Raw HTML in markdown |
| `@vercel/og` | `^0.9.0` | OG image generation |
| `next-intl` | `^4.8.3` | i18n (EN/FR) — affects all text in UI |

### Framework
| Package | Version |
|---------|---------|
| `next` | `16.1.6` |
| `react` | `19.2.3` |
| `react-dom` | `19.2.3` |

---

## 11. REDESIGN CONFLICT FLAGS

### 🔴 CRITICAL — Will Break / Require Logic Changes

#### 1. `RankBadge.tsx` — inline `style={}` with `color-mix()`
```tsx
// Cannot be overridden by Tailwind classes
style={{
  color: rank.color,
  borderColor: rank.color,
  backgroundColor: `color-mix(in srgb, ${rank.color} 22%, rgb(8 8 12 / 0.85))`,
  ['--rank-glow']: rank.colorGlow,
}}
```
**Fix:** Edit the component. Change `rgb(8 8 12 / 0.85)` to use `var(--color-card)` or target color.

#### 2. `ScoreBadge.tsx` — `BAR_COLORS` array hardcoded
```tsx
const BAR_COLORS = ['#ef4444', '#f97316', ...] // 10 hardcoded values
```
**Fix:** Move to a config/token file or CSS variables if colors need to change.

#### 3. `ScoreBadge.tsx` — Framer Motion `animate={{ backgroundColor, boxShadow }}`
```tsx
animate={{
  backgroundColor: isFilled ? color : 'rgba(255,255,255,0.06)',
  boxShadow: isFilled ? `0 0 10px ${color}50, ...` : '...',
}}
```
**Fix:** Cannot use Tailwind here. Must update the TS logic if bar colors change.

#### 4. `HomePodium.tsx` — Medal colors hardcoded
```tsx
ring-[#ffd700] shadow-[0_0_24px_rgba(255,215,0,0.3)]  // gold
ring-[#c0c0c0] shadow-[0_0_16px_rgba(192,192,192,0.2)] // silver
ring-[#cd7f32] shadow-[0_0_16px_rgba(205,127,50,0.2)]  // bronze
```
**Fix:** Add `--color-medal-gold/silver/bronze` tokens, or accept as intentional brand colors.

---

### 🟡 HIGH — Large Refactor Required

#### 5. ~100+ Hardcoded Hex Values in Components
Every file uses `bg-[#0d0d16]`, `text-[#00ffff]`, `border-[rgba(0,255,255,0.12)]` etc.
The CSS variable token system exists but is only partially adopted.

**Mapping of hardcoded → token replacement:**
```
bg-[#0d0d16]              → bg-card
bg-[#111120]              → bg-elevated
bg-[#060609]              → bg-void
bg-[#08080e]              → bg-deep
text-[#e8e8f0]            → text-text-primary
text-[#9999b8]            → text-text-secondary
text-[#6b6b88]            → text-text-muted
text-[#00ffff]            → text-electric
text-[#00bfff]            → text-electric-dim
bg-[#ff2d55]              → bg-red
text-[#ff2d55]            → text-red
border-[rgba(0,255,255,0.12)] → border-electric-border
bg-[rgba(0,255,255,0.08)] → bg-electric-glow (approx)
```

#### 6. `globals.css` — `.section-title-bar::before` uses hardcoded `#00ffff`
```css
.section-title-bar::before {
  background: #00ffff;      ← hardcoded
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.6);  ← hardcoded
}
```
**Fix:** Change to `var(--color-electric)` and `rgba(var(--color-electric-raw), 0.6)`.

#### 7. `globals.css` — `.electric-glow` uses hardcoded `rgba(0,255,255,0.4)`
```css
.electric-glow {
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.4);  ← hardcoded
}
```

#### 8. `.card-hover` hover state uses hardcoded rgba values
```css
.card-hover:hover {
  border-color: rgba(0, 255, 255, 0.25);       ← hardcoded
  box-shadow: ... rgba(0, 255, 255, 0.12) ...  ← hardcoded
}
```

---

### 🟢 LOW — Minor / Cosmetic

#### 9. No CSS Modules
Zero `.module.css` files found. No conflicts from CSS isolation.

#### 10. No CSS-in-JS
Zero styled-components, @emotion, styled-jsx. No runtime style injection.

#### 11. No `!important`
Zero occurrences across all CSS and component files.

#### 12. Third-Party Restyling (recharts)
- `recharts` charts in `ManhwaStats.tsx` use their own internal styling
- May need manual `stroke`/`fill` color props to match new theme
- Recharts v3 supports className and style props on most elements

#### 13. `@tailwindcss/typography` prose styles
- Used in `MarkdownRenderer.tsx`
- Can be customized via `prose-invert` and CSS variable overrides in `@layer components`

#### 14. Framer Motion Presence (48 usages)
- All animation values (colors, box-shadows) are in JS, not CSS
- Transition durations and easing are embedded in JSX
- Can coexist with any CSS approach but needs manual updates if motion colors change

---

## 12. REDESIGN RECOMMENDATIONS

### Pre-Redesign Cleanup (Do Before Branching)

1. **Migrate hardcoded hex → token classes** (automated with regex)
   - Replace `text-[#00ffff]` → `text-electric` across all components
   - Replace `bg-[#0d0d16]` → `bg-card`
   - etc. (see full mapping in Section 11)

2. **Fix globals.css** — replace 4 hardcoded `#00ffff`/`rgba(0,255,255,...)` with `var(--color-electric)`

3. **Add missing tokens** for medal colors (silver `#c0c0c0`, bronze `#cd7f32`) and external brand colors (AniList `#02A9FF`, MAL `#2E51A2`)

### Redesign Branch Strategy

- **Single source of truth:** All color changes should be made in `globals.css` `@theme inline` block only
- **RankBadge:** Update the dark background color in `color-mix()` expression to match new surface color
- **ScoreBadge:** Decide whether to keep the 10-color gradient or simplify; update `BAR_COLORS` array in one place
- **HomePodium:** Medal colors can remain intentionally hardcoded (they represent real-world metal colors)
- **Fonts:** Swapping fonts requires updating `app/fonts.ts` only — CSS variables propagate automatically
- **Animations:** Keyframe names in `globals.css` are stable — only the color values inside need updating

### Files to Touch in Order (Redesign Checklist)

```
Priority 1 — Design tokens (change once, propagates everywhere):
  app/globals.css              ← all color/font/radius tokens + utility classes

Priority 2 — Font loading:
  app/fonts.ts                 ← swap Google Font imports if needed

Priority 3 — Layout/Shell:
  app/layout.tsx               ← html/body classes
  app/[locale]/layout.tsx      ← provider tree + page wrapper
  components/layouts/Header.tsx
  components/layouts/Footer.tsx
  components/layouts/MobileNav.tsx

Priority 4 — Core card (shown on every page):
  components/features/ManhwaCard.tsx
  components/features/RankBadge.tsx   ← inline style, requires code edit
  components/features/ManhwaCardPopup.tsx

Priority 5 — Score/Rating system:
  components/features/library/ScoreBadge.tsx  ← BAR_COLORS array
  components/features/manhwa/ScoreCard.tsx

Priority 6 — Homepage:
  components/features/home/HomePodium.tsx     ← medal colors
  components/features/home/HomeRanking.tsx
  components/features/HomeSection.tsx

Priority 7 — Manhwa detail page:
  components/features/ManhwaHero.tsx
  components/features/ManhwaBanner.tsx
  components/features/manhwa/ManhwaTabNav.tsx
  components/features/manhwa/KoreanReactions.tsx

Priority 8 — All other features:
  ReviewCard.tsx, ReviewForm.tsx, FollowButton.tsx
  SearchBar.tsx, HomeFilterBar.tsx
  NotificationDropdown.tsx, NotificationItem.tsx
  LibraryActions.tsx, FavoriteButton.tsx
  store/ProductCard.tsx, blog/ArticleCard.tsx
```

---

*End of REDESIGN_AUDIT.md — Total: 56 components, 40+ routes, 157 lines of global CSS, 0 CSS modules, 0 CSS-in-JS, Tailwind v4*
