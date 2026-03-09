# ManhwaVerse — UI Redesign Prompt for Claude Code

> Copy-paste this entire file into Claude Code from the project root.

---

## CONTEXT

You are refactoring the entire ManhwaVerse frontend to a new design system. Read this entire prompt carefully before touching a single file.

The current site uses:
- Tailwind CSS v4 with CSS-first tokens in `app/globals.css`
- Fonts: Playfair Display (display), DM Sans (body), JetBrains Mono (mono)
- Colors: `--color-base #0D0D0F`, `--color-surface #13141A`, `--color-elevated #1C1E27`, `--color-border #252836`
- Brand: `--color-crystal-blue #4A9EFF`, `--color-crystal-gold #C9A84C`

The new design system replaces this with:
- Fonts: **Bebas Neue** (headings/display), **Sora** (body), **JetBrains Mono** (kept for scores/numbers)
- Brand color: **Electric Blue `#00FFFF`** as primary signature color
- Backgrounds: `#060609` (void), `#08080e` (deep), `#0d0d16` (card), `#0a0a13` (section alt)
- Borders: `rgba(0,255,255,0.12)` default, `rgba(0,255,255,0.3)` hover
- Text: `#e8e8f0` primary, `#9999b8` secondary, `#6b6b88` muted
- Gold: `#ffd700` for rankings, Red: `#ff2d55` for alerts/hot badges

Card hover effect (subtle): `translateY(-4px) scale(1.01)` + `border-color rgba(0,255,255,0.25)` + `box-shadow 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,255,255,0.12), 0 4px 20px rgba(0,255,255,0.08)`

---

## STEP 0 — CREATE THE BRANCH

Before any code change, run:

```bash
git checkout -b feat/ui-redesign-electric
```

Confirm the branch is created. All changes go on this branch only.

---

## STEP 1 — UPDATE DESIGN TOKENS (`app/globals.css`)

Replace the entire `@theme inline` block with these new tokens:

```css
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
```

Also add these global base styles after the theme block:

```css
body {
  background: var(--color-void);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
}

/* Section alternation */
.section-alt {
  background: var(--color-section);
  border-top: 1px solid rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

/* Electric glow utility */
.electric-glow {
  text-shadow: 0 0 20px rgba(0,255,255,0.4);
}

/* Card hover standard */
.card-hover {
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}
.card-hover:hover {
  transform: translateY(-4px) scale(1.01);
  border-color: rgba(0,255,255,0.25);
  box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,255,255,0.12), 0 4px 20px rgba(0,255,255,0.08);
}

/* Scrollbar */
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: var(--color-void); }
::-webkit-scrollbar-thumb { background: rgba(0,255,255,0.2); border-radius: 3px; }
```

---

## STEP 2 — UPDATE FONTS (`app/fonts.ts` + `app/[locale]/layout.tsx`)

Replace current Google Fonts with:

```typescript
import { Bebas_Neue, Sora, JetBrains_Mono } from 'next/font/google'

export const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display'
})

export const sora = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans'
})

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono'
})
```

Apply all three font variables to `<html>` in the root layout.

---

## STEP 3 — UPDATE `components/layouts/Header.tsx`

Apply the new design:

- Background: `rgba(6,6,9,0.85)` with `backdrop-blur-md`
- Bottom border: `border-b border-[rgba(0,255,255,0.07)]`
- Logo: `font-display text-2xl tracking-widest text-[#00ffff]` + `drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]`
- Nav links: `text-[#9999b8] hover:text-[#00ffff]` uppercase, `text-xs tracking-widest font-medium`
- Search bar: `bg-white/[0.04] border border-[rgba(0,255,255,0.12)] hover:border-[rgba(0,255,255,0.3)]`
- Active states: `text-[#00ffff]`
- Notification bell badge: `bg-[#ff2d55]`

Keep all existing links, dropdowns, locale switcher, auth state logic — only restyle.

---

## STEP 4 — UPDATE `components/layouts/Footer.tsx`

- Background: `bg-[#060609]` with `border-t border-white/5`
- Logo: `font-display text-xl text-[#00ffff] opacity-50 tracking-widest`
- Section titles: `font-display text-sm tracking-widest text-[#e8e8f0]`
- Links: `text-[#6b6b88] hover:text-[#00ffff] text-xs`

Keep all existing nav columns (Discover / Community / Legal / About).

---

## STEP 5 — UPDATE `components/layouts/MobileNav.tsx`

- Background: `bg-[#08080e]/90 backdrop-blur-md border-t border-[rgba(0,255,255,0.07)]`
- Active tab: `text-[#00ffff]`
- Inactive tab: `text-[#6b6b88]`

---

## STEP 6 — UPDATE `components/features/ManhwaCard.tsx`

This is the most-used component. Apply:

- Card wrapper: `bg-[#0d0d16] border border-white/5 rounded-lg overflow-hidden` + `card-hover` class + `group`
- Cover: keep existing blur/NSFW logic, add `transition-transform duration-300 group-hover:scale-105` on the image
- Score badge: keep `font-mono` for number, use `bg-[#00ffff] text-black` for high scores (≥8), keep existing logic
- Rank badge (`RankBadge`): keep as-is
- Card footer: `p-2.5`
- Title: `text-sm font-semibold text-[#e8e8f0] group-hover:text-[#00ffff] transition-colors truncate`
- Meta line: `text-xs text-[#6b6b88]`

---

## STEP 7 — UPDATE `components/features/ManhwaHero.tsx`

- Cover: add `ring-1 ring-[rgba(0,255,255,0.15)] shadow-[0_0_60px_rgba(0,0,0,0.7)]`
- Title: `font-display text-5xl tracking-wide text-white`
- Score display: `font-mono text-[#00ffff] electric-glow`
- Badges (status, genre, type): `border border-[rgba(0,255,255,0.2)] text-[#00bfff] bg-[rgba(0,255,255,0.06)] text-xs uppercase tracking-widest px-2 py-1 rounded`
- Stats row values: `font-display text-2xl text-white`
- Stats row labels: `text-xs uppercase tracking-widest text-[#6b6b88]`

Keep all existing data and `LibraryActions` component.

---

## STEP 8 — UPDATE `components/features/home/HomePodium.tsx`

- Gold (#1): ring/glow in `#ffd700`, scale larger
- Silver (#2): ring/glow in `#c0c0c0`
- Bronze (#3): ring/glow in `#cd7f32`
- Rank numbers: `font-display`

Keep existing structure.

---

## STEP 9 — UPDATE `components/features/ReviewCard.tsx`

- Card: `bg-[#0d0d16] border border-white/5 rounded-lg p-4`
- Border on hover: `hover:border-[rgba(0,255,255,0.15)]`
- Score: `font-mono text-[#00ffff]`
- Like/dislike buttons hover: `text-[#00ffff]`

Keep all existing like/dislike/reaction logic.

---

## STEP 10 — UPDATE `app/[locale]/(public)/page.tsx` (Homepage)

Add a **compact hero section** at the top (before the existing sections) as a Server Component:

- Fetch the #1 ranked manhwa from `getTopRankedManhwas(limit: 1)` or equivalent
- Animated background: pure CSS moving gradient blobs via `@keyframes` on `background-position` (no JS canvas)
- Layout: left side = text, right side = featured cover
- Left side content:
  - Pulsing `● Featured Manhwa` tag in electric blue
  - Title in `font-display` large
  - Genre badges
  - Synopsis truncated to 2 sentences
  - CTA button `Lire maintenant` → `/manhwa/{slug}`
  - 3 stats: chapter count, score, reader count
- Right side: cover image with `ring-1 ring-[rgba(0,255,255,0.15)]` and rank badge

Keep ALL existing homepage sections below (Trending, Top Rated, Recently Added, Ranking, Community Lists, Hidden Gems, etc.) — do not remove or reorder them.

Add the **electric section title style** to every `<HomeSection>` title using a left bar pseudo-element:

```css
/* In globals.css */
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
  box-shadow: 0 0 8px rgba(0,255,255,0.6);
  border-radius: 2px;
  flex-shrink: 0;
}
```

Add a **live updates ticker** between the hero and first content section:

- Horizontal auto-scrolling strip
- CSS animation: `@keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }`
- Content: 10 most recently updated manhwas (title + chapter count), duplicated for seamless loop
- Style: `bg-[rgba(0,255,255,0.04)] border-y border-[rgba(0,255,255,0.08)] py-2.5 overflow-hidden`

---

## STEP 11 — UPDATE `app/[locale]/(public)/explore/page.tsx`

- Genre chip pills default: `border border-white/10 bg-white/[0.03] text-[#9999b8]`
- Genre chip pills hover: `hover:bg-[rgba(0,255,255,0.08)] hover:border-[rgba(0,255,255,0.3)] hover:text-[#00ffff]`
- Genre chip pills active: `bg-[rgba(0,255,255,0.08)] border-[rgba(0,255,255,0.3)] text-[#00ffff]`
- Filter bar: `bg-[#0a0a13] border-b border-white/5`
- Alternate section backgrounds between `bg-[#060609]` and `bg-[#0a0a13]`

---

## STEP 12 — UPDATE `app/[locale]/(public)/top/page.tsx`

- Rank numbers use `font-display text-2xl`:
  - `#1`: `text-[#ffd700] drop-shadow-[0_0_12px_rgba(255,215,0,0.4)]`
  - `#2`: `text-[#c0c0c0]`
  - `#3`: `text-[#cd7f32]`
  - `4–10`: `text-[#00ffff]`
  - `11+`: `text-[#6b6b88]`
- Row hover: `hover:bg-[rgba(0,255,255,0.03)] hover:border-l-2 hover:border-[#00ffff]`
- Score column: `font-mono text-[#00ffff]`

---

## STEP 13 — UPDATE `app/[locale]/(public)/manhwa/[slug]/layout.tsx`

- Banner overlay: `bg-gradient-to-t from-[#060609] via-[#060609]/80 to-transparent`
- Tab navigation (`ManhwaTabNav`):
  - Active tab: `border-b-2 border-[#00ffff] text-[#00ffff]`
  - Inactive: `text-[#6b6b88] hover:text-[#e8e8f0]`
- Sidebar cards: `bg-[#0d0d16] border border-white/5 rounded-lg`
- "Where to Read" platform buttons: `border border-[rgba(0,255,255,0.2)] hover:border-[rgba(0,255,255,0.4)] hover:bg-[rgba(0,255,255,0.06)]`

---

## STEP 14 — UPDATE `components/features/RankBadge.tsx`

Keep the Korean rank system exactly as-is (E-Rank Slime → SSS-Rank Hwanin). Only update:

- SSS/SS/S ranks: add `shadow-[0_0_16px_rgba(0,255,255,0.6)]`
- Rank letter: `font-display`

---

## STEP 15 — UPDATE `components/features/blog/ArticleCard.tsx`

- Card: `bg-[#0d0d16] border border-white/5 rounded-lg overflow-hidden card-hover`
- Category badge: `bg-[rgba(0,255,255,0.06)] border border-[rgba(0,255,255,0.2)] text-[#00bfff] text-xs uppercase tracking-widest`
- Title: `font-display text-xl tracking-wide hover:text-[#00ffff]`
- Meta: `text-xs text-[#6b6b88]`

---

## STEP 16 — UPDATE `app/[locale]/(public)/profile/[username]/page.tsx`

- Stats row values: `font-display text-2xl text-white`
- Stats row labels: `text-xs uppercase tracking-widest text-[#6b6b88]`
- Activity feed items: `border-l-2 border-[rgba(0,255,255,0.2)] pl-3`
- Follow button (unfollowed): `border border-[rgba(0,255,255,0.3)] text-[#00ffff] hover:bg-[rgba(0,255,255,0.08)]`

---

## STEP 17 — UPDATE PRIMARY BUTTONS (global)

Find all primary CTA button instances (currently using `--color-crystal-blue`). Replace with:

```
bg-[#00ffff] text-black font-bold text-xs uppercase tracking-widest
hover:shadow-[0_8px_24px_rgba(0,255,255,0.35)] hover:-translate-y-px
transition-all duration-150 rounded-md px-6 py-3
```

Secondary/ghost buttons:

```
border border-white/12 text-[#e8e8f0]
hover:border-[rgba(0,255,255,0.3)] hover:text-[#00ffff]
transition-colors rounded-md px-5 py-3
```

---

## STEP 18 — ADD SECTION BACKGROUND ALTERNATION

For pages with multiple stacked sections (homepage, explore, genre pages, trope pages), ensure sections alternate between:

- `bg-[#060609]` — void (default)
- `bg-[#0a0a13]` — slightly lifted, with `border-y border-white/[0.04]`

Never have 3 sections of the same background in a row.

---

## STEP 19 — UPDATE `components/features/SearchBar.tsx`

- Input: `bg-[#0d0d16] border border-[rgba(0,255,255,0.12)] focus:border-[rgba(0,255,255,0.4)] text-[#e8e8f0] placeholder:text-[#6b6b88] rounded-lg`
- Search icon: `text-[#00ffff]`
- Active filter tags: `bg-[rgba(0,255,255,0.08)] border border-[rgba(0,255,255,0.2)] text-[#00ffff]`

---

## STEP 20 — FINAL CHECK

After all changes:

1. Run `npm run build` — fix any TypeScript or import errors
2. Run `npm run dev` and verify these pages render correctly:
   - `/en` — homepage with new hero
   - `/en/explore`
   - `/en/manhwa/solo-leveling` (or any valid slug)
   - `/en/top`
   - `/en/blog`
3. Confirm no existing functionality is broken (library actions, auth, reviews, reactions all still work — only styles changed)
4. Commit:

```bash
git add -A && git commit -m "feat: electric blue UI redesign - new design system, hero, cards, global tokens"
```

---

## WHAT NOT TO CHANGE

- Do NOT modify any `lib/` files (db, actions, auth, seo, scores)
- Do NOT modify any `prisma/` files
- Do NOT modify any `app/api/` routes
- Do NOT modify any `hooks/` files
- Do NOT modify any i18n `messages/` files
- Do NOT change any data-fetching logic — only the JSX/className layer
- Do NOT change URL structures or slugs
- Do NOT remove any existing features or components
- Do NOT change the Korean reactions system visual language (keep it fun/distinct)
- Do NOT change the RankBadge content (keep E→SSS Korean mythological names)

---

## DESIGN PHILOSOPHY TO MAINTAIN

- Every section title gets the 3px electric left bar
- Scores and numbers always use `font-mono`
- Headlines and ranks always use `font-display` (Bebas Neue)
- Body copy always uses `font-sans` (Sora)
- Hover states always hint electric blue — never white
- Backgrounds alternate — never 3 sections of the same bg color in a row
- Cards never have colored backgrounds — only subtle borders that glow on hover
