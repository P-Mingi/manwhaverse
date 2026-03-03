# SITE_AUDIT.md — ManwhaBox Complete Codebase Audit

> Generated: 2026-03-03 | Codebase: /Users/louis/IT/Dev/projects/ManwhaBox

---

## 1. PROJECT OVERVIEW

### Project Identity
- **Internal name:** `manhwaverse` (package.json)
- **Brand name:** ManhwaVerse
- **Purpose:** Full-featured manhwa (Korean webcomic) tracking and community platform. Users can track reading progress, score titles, write reviews, follow friends, submit fan art, read news/blog articles, and browse an indexed catalog of manhwa with genre/trope taxonomies.
- **Domain:** manhwaverse.com
- **Dev port:** 3002 (`next dev -p 3002`)

### Tech Stack
| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.1.6 |
| Runtime | Node.js | — |
| Language | TypeScript | ^5 |
| UI | React | 19.2.3 |
| Styling | Tailwind CSS v4 | ^4 |
| ORM | Prisma | ^6.19.2 |
| Database | PostgreSQL (Supabase hosted) | — |
| Auth | Auth.js (next-auth) v5 beta | ^5.0.0-beta.30 |
| i18n | next-intl | ^4.8.3 |
| Monitoring | Sentry | ^10.40.0 |
| Analytics | PostHog | ^1.356.1 |
| Rich text | Tiptap | ^3.20.0 |
| Charts | Recharts | ^3.7.0 |
| Animation | Framer Motion | ^12.34.3 |
| Validation | Zod | ^4.3.6 |
| Markdown | react-markdown + rehype-raw + remark-gfm | ^10/^7/^4 |
| OG images | @vercel/og | ^0.9.0 |
| AI | @anthropic-ai/sdk (dev only) | ^0.78.0 |

### All Dependencies (package.json)
**Runtime:**
- `@auth/prisma-adapter` ^2.11.1
- `@prisma/client` ^6.19.2
- `@sentry/nextjs` ^10.40.0
- `@tailwindcss/typography` ^0.5.19
- `@tiptap/extension-placeholder` ^3.20.0
- `@tiptap/pm` ^3.20.0
- `@tiptap/react` ^3.20.0
- `@tiptap/starter-kit` ^3.20.0
- `@vercel/og` ^0.9.0
- `framer-motion` ^12.34.3
- `next` 16.1.6
- `next-auth` ^5.0.0-beta.30
- `next-intl` ^4.8.3
- `posthog-js` ^1.356.1
- `prisma` ^6.19.2
- `react` 19.2.3
- `react-dom` 19.2.3
- `react-markdown` ^10.1.0
- `recharts` ^3.7.0
- `rehype-raw` ^7.0.0
- `remark-gfm` ^4.0.1
- `zod` ^4.3.6

**Dev:**
- `@anthropic-ai/sdk` ^0.78.0 — used for AI news generation and seed reviews
- `@tailwindcss/postcss` ^4
- `@types/node` ^20
- `@types/react` ^19
- `@types/react-dom` ^19
- `eslint` ^9
- `eslint-config-next` 16.1.6
- `tailwindcss` ^4
- `tsx` ^4.21.0 — for running TypeScript scripts directly
- `typescript` ^5

### Hosting & Deployment
- **Platform:** Vercel (inferred from `vercel.json`)
- **Crons:** Managed by Vercel cron system (defined in `vercel.json`)
- **Database:** Supabase (PostgreSQL) with Row-Level Security enabled on most models

### Environment Variables Referenced in Code
| Variable | Where Used | Purpose |
|---|---|---|
| `DATABASE_URL` | prisma/schema.prisma | Prisma pooled connection URL |
| `DIRECT_URL` | prisma/schema.prisma | Prisma direct (migration) URL |
| `NEXTAUTH_SECRET` | (Auth.js default) | JWT signing secret |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Auth.js providers | Google OAuth |
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | Auth.js providers | Discord OAuth |
| `CRON_SECRET` | cron API routes | Bearer token to authorize Vercel cron |
| `ADMIN_EMAILS` | `lib/auth/session.ts` | Comma-separated admin email list (legacy) |
| `MODERATOR_USERNAMES` | multiple lib files | Comma-separated moderator username list |
| `ANTHROPIC_API_KEY` | `lib/ingestion/generate-news.ts`, seed scripts | AI news generation via Claude |
| `NEXT_PUBLIC_APP_URL` | `app/sitemap.ts`, `app/robots.ts` | Base URL for sitemap/robots |
| `SENTRY_DSN` | `sentry.*.config.ts` | Sentry error tracking DSN |
| `NEXT_PUBLIC_POSTHOG_KEY` | (PostHog provider) | PostHog analytics key |

---

## 2. FILE & FOLDER STRUCTURE

```
/Users/louis/IT/Dev/projects/ManwhaBox/
├── app/                              # Next.js App Router root
│   ├── layout.tsx                    # Root HTML layout (sets fonts, lang attr)
│   ├── globals.css                   # Tailwind v4 + custom tokens + animations
│   ├── fonts.ts                      # Google Font definitions (Playfair, DM Sans, JetBrains Mono)
│   ├── robots.ts                     # robots.txt generator
│   ├── sitemap.ts                    # Dynamic sitemap.xml generator
│   ├── global-error.tsx              # Global error boundary (Sentry)
│   ├── icon.png                      # Favicon
│   ├── [locale]/                     # All locale-prefixed routes (en/fr)
│   │   ├── layout.tsx                # Locale layout: i18n provider, Header, Footer, MobileNav
│   │   ├── error.tsx                 # Per-locale error boundary
│   │   ├── not-found.tsx             # Per-locale 404 page
│   │   ├── (auth)/                   # Auth-required route group (no extra layout)
│   │   │   ├── library/page.tsx      # User manga library
│   │   │   ├── sign-in/page.tsx      # Sign in page
│   │   │   └── sign-up/page.tsx      # Sign up page
│   │   └── (public)/                 # Public route group
│   │       ├── page.tsx              # Homepage
│   │       ├── about/page.tsx        # About ManhwaVerse
│   │       ├── admin/                # Admin panel (access-controlled)
│   │       │   ├── blog/page.tsx     # Blog/UGC moderation queue
│   │       │   ├── news/page.tsx     # News draft review
│   │       │   ├── article/[id]/edit/page.tsx  # Article editor
│   │       │   └── users/[username]/page.tsx   # Admin user editor
│   │       ├── artwork/              # Fan art gallery
│   │       │   ├── page.tsx          # Gallery index (masonry grid)
│   │       │   ├── new/page.tsx      # Submit fan art
│   │       │   └── [postId]/         # Individual post
│   │       │       ├── page.tsx
│   │       │       ├── CommentForm.tsx
│   │       │       └── FanArtLikeButton.tsx
│   │       ├── blog/                 # Community blog
│   │       │   ├── page.tsx          # Blog index
│   │       │   ├── [slug]/page.tsx   # Article detail
│   │       │   ├── category/[cat]/page.tsx  # Category filter
│   │       │   ├── my-articles/page.tsx     # User's own articles
│   │       │   ├── submit/page.tsx          # Article submission form
│   │       │   └── user/[username]/page.tsx # Articles by user
│   │       ├── challenge/[year]/page.tsx    # Reading challenge by year
│   │       ├── character/            # Characters directory
│   │       │   ├── page.tsx          # Character index
│   │       │   └── [slug]/page.tsx   # Character detail
│   │       ├── explore/page.tsx      # Advanced browse with filter sidebar
│   │       ├── faq/page.tsx          # FAQ
│   │       ├── feed/page.tsx         # Social activity feed (auth required)
│   │       ├── genre/                # Genre browse
│   │       │   ├── page.tsx          # Genre index
│   │       │   └── [slug]/page.tsx   # Manhwa by genre
│   │       ├── lists/                # Community curated lists
│   │       │   ├── page.tsx          # Lists index
│   │       │   ├── new/page.tsx      # Create list
│   │       │   └── [slug]/           # List detail
│   │       │       ├── page.tsx
│   │       │       ├── LikeButton.tsx
│   │       │       └── edit/         # Edit list + add manhwa
│   │       │           ├── page.tsx
│   │       │           └── AddManhwaSearch.tsx
│   │       ├── manhwa/[slug]/        # Manhwa fiche (detail page system)
│   │       │   ├── layout.tsx        # Shared layout: hero, tab nav, sidebar
│   │       │   ├── page.tsx          # Overview tab (synopsis, reviews, related)
│   │       │   ├── reviews/page.tsx  # All reviews tab
│   │       │   ├── staff/page.tsx    # Staff/creators tab
│   │       │   ├── stats/page.tsx    # Score stats tab
│   │       │   ├── characters/page.tsx  # Characters tab (redirects to main)
│   │       │   ├── review/[reviewId]/page.tsx  # Single review permalink
│   │       │   ├── opengraph-image.tsx   # Dynamic OG image generation
│   │       │   ├── loading.tsx           # Loading skeleton
│   │       │   └── not-found.tsx         # 404 for unknown slugs
│   │       ├── members/page.tsx      # Members directory with search
│   │       ├── news/                 # Editorial news
│   │       │   ├── page.tsx          # News index
│   │       │   └── [slug]/page.tsx   # News article detail
│   │       ├── notifications/        # Notification center
│   │       │   ├── page.tsx
│   │       │   └── notification-list.tsx
│   │       ├── people/               # Creator/author directory
│   │       │   ├── page.tsx          # Creator index
│   │       │   └── [slug]/page.tsx   # Creator detail
│   │       ├── privacy/page.tsx      # Privacy policy
│   │       ├── profile/              # User profiles
│   │       │   ├── page.tsx          # Own profile redirect
│   │       │   └── [username]/       # Public profile
│   │       │       ├── page.tsx
│   │       │       ├── followers/page.tsx
│   │       │       └── following/page.tsx
│   │       ├── publisher/            # Publisher directory
│   │       │   ├── page.tsx
│   │       │   └── [slug]/page.tsx
│   │       ├── search/page.tsx       # Search page
│   │       ├── settings/             # Account settings
│   │       │   ├── page.tsx
│   │       │   └── settings-form.tsx
│   │       ├── terms/page.tsx        # Terms of service
│   │       ├── top/page.tsx          # Top 100 ranking
│   │       └── trope/                # Trope browse
│   │           ├── page.tsx
│   │           └── [slug]/page.tsx
│   └── api/                          # API routes
│       ├── admin/
│       │   ├── run-news-pipeline/route.ts  # POST trigger AI news
│       │   └── user/[username]/route.ts    # Admin user ops
│       ├── cron/
│       │   ├── recalculate-scores/route.ts # Hourly score recalc
│       │   └── auto-publish-drafts/route.ts # Auto-publish user articles
│       └── notifications/
│           ├── route.ts              # GET paginated notifications
│           └── unread-count/route.ts # GET unread count
├── auth.ts                           # Auth.js config (providers, callbacks, events)
├── components/
│   ├── features/                     # Domain-specific components
│   │   ├── ActivityCard.tsx          # Activity feed card
│   │   ├── FavoriteButton.tsx        # Heart/favorite toggle
│   │   ├── FollowButton.tsx          # Follow/unfollow user
│   │   ├── HomeFilterBar.tsx         # Homepage genre/trope filter
│   │   ├── HomeSection.tsx           # Scrollable section wrapper
│   │   ├── LibraryButton.tsx         # Quick library add
│   │   ├── ManhwaCard.tsx            # Cover card with score/rank badge
│   │   ├── ManhwaCardOverlay.tsx     # Hover overlay for card
│   │   ├── ManhwaCardPopup.tsx       # Hover popup (synopsis, genres, tropes)
│   │   ├── ManhwaCardSkeleton.tsx    # Loading placeholder
│   │   ├── ManhwaHero.tsx            # Manhwa fiche hero section
│   │   ├── MatureGate.tsx            # R18 content interstitial
│   │   ├── NewsGeneratorButton.tsx   # Admin: trigger AI news pipeline
│   │   ├── NotificationBell.tsx      # Header bell icon with badge
│   │   ├── NotificationDropdown.tsx  # Dropdown notification preview
│   │   ├── NotificationItem.tsx      # Single notification row
│   │   ├── RankBadge.tsx             # Korean-mythology rank badge (E→SSS)
│   │   ├── ReviewCard.tsx            # Review display with like/dislike
│   │   ├── ReviewForm.tsx            # Inline review submission
│   │   ├── ScrollableRow.tsx         # Horizontal scroll container
│   │   ├── SearchBar.tsx             # Search bar with filters
│   │   ├── SynopsisSection.tsx       # Expandable synopsis
│   │   ├── TropeList.tsx             # Trope chips for manhwa page
│   │   ├── blog/
│   │   │   ├── ArticleCard.tsx       # Blog article preview card
│   │   │   ├── MarkdownRenderer.tsx  # Markdown → HTML renderer
│   │   │   └── RichEditor.tsx        # Tiptap WYSIWYG editor
│   │   ├── home/
│   │   │   ├── HomePodium.tsx        # Top-3 podium display
│   │   │   ├── HomeRanking.tsx       # Ranking section for homepage
│   │   │   └── HomeRankingList.tsx   # Ranked list component
│   │   ├── library/
│   │   │   ├── HeartIcon.tsx
│   │   │   ├── LibraryActions.tsx    # Status/score/progress controls on fiche
│   │   │   ├── LibraryQuickDropdown.tsx  # Quick status dropdown
│   │   │   ├── ListEditorModal.tsx   # Full library entry editor modal
│   │   │   └── ScoreBadge.tsx        # Score display badge
│   │   ├── manhwa/
│   │   │   ├── CharacterVoting.tsx   # Favorite character vote UI
│   │   │   ├── ControversyBadge.tsx  # Shows if score has high std-dev
│   │   │   ├── KoreanReactions.tsx   # Emoji reaction bar (헐/대박/etc.)
│   │   │   ├── ManhwaBanner.tsx      # Full-width banner image
│   │   │   ├── ManhwaCharacters.tsx  # Character grid
│   │   │   ├── ManhwaRelations.tsx   # Related works (sequel/prequel/etc.)
│   │   │   ├── ManhwaStaff.tsx       # Creator/staff list
│   │   │   ├── ManhwaStats.tsx       # Score distribution charts
│   │   │   ├── ManhwaTabNav.tsx      # Tab navigation (overview/reviews/staff/stats)
│   │   │   ├── ScoreCard.tsx         # Score display card
│   │   │   └── WhereToRead.tsx       # Platform links (affiliate)
│   │   └── poll/
│   │       └── PollWidget.tsx        # In-page poll voting
│   ├── layouts/
│   │   ├── Footer.tsx                # Site footer with nav columns
│   │   ├── Header.tsx                # Sticky top nav with dropdowns
│   │   ├── MobileNav.tsx             # Bottom tab bar (mobile)
│   │   └── PageContainer.tsx         # Centered max-width wrapper
│   ├── providers/
│   │   ├── PostHogProvider.tsx       # PostHog analytics tracker
│   │   └── SessionProvider.tsx       # Auth.js session context
│   └── ui/
│       └── JsonLd.tsx                # Schema.org JSON-LD injector
├── hooks/
│   ├── useAuth.ts                    # Client-side auth hook
│   └── useUnreadCount.ts             # Polls unread notification count
├── i18n/
│   ├── request.ts                    # next-intl request config
│   └── routing.ts                    # Locale config: ['en', 'fr'], prefix: always
├── lib/
│   ├── actions/                      # Next.js server actions ('use server')
│   │   ├── admin-article.ts          # Publish/reject/delete articles (admin)
│   │   ├── admin-user.ts             # Ban/unban users (admin)
│   │   ├── article.ts                # Submit/delete user articles
│   │   ├── challenge.ts              # Set reading challenge goal
│   │   ├── character-vote.ts         # Vote for favorite character
│   │   ├── fan-art.ts                # Fan art CRUD + like
│   │   ├── follow.ts                 # Follow/unfollow users
│   │   ├── library.ts                # Library CRUD + scoring
│   │   ├── list.ts                   # List CRUD + item management
│   │   ├── notification.ts           # Mark notifications read
│   │   ├── nsfw.ts                   # Update content filter preference
│   │   ├── poll.ts                   # Poll voting
│   │   ├── profile.ts                # Update profile, notification prefs
│   │   ├── reaction.ts               # Korean manhwa reactions
│   │   └── review.ts                 # Review CRUD + like/dislike/reaction
│   ├── api/
│   │   └── anilist.ts                # AniList GraphQL API client
│   ├── auth/
│   │   ├── moderators.ts             # MODERATOR_USERNAMES from env
│   │   └── session.ts                # getUser, requireSession, isAdmin
│   ├── db/                           # Database access layer (Prisma queries)
│   │   ├── activity.ts               # Activity feed queries
│   │   ├── article.ts                # Article queries (blog/news)
│   │   ├── challenge.ts              # Reading challenge queries
│   │   ├── character-vote.ts         # Character vote rankings
│   │   ├── character.ts              # Character queries
│   │   ├── client.ts                 # Prisma client singleton
│   │   ├── creator.ts                # Creator queries
│   │   ├── fan-art.ts                # Fan art queries
│   │   ├── follow.ts                 # Follow/unfollow queries
│   │   ├── genre.ts                  # Genre queries
│   │   ├── home.ts                   # Homepage section queries
│   │   ├── library-map.ts            # Library map for batch lookup
│   │   ├── library.ts                # UserLibrary queries
│   │   ├── list.ts                   # ManhwaList queries
│   │   ├── manhwa-reaction.ts        # Korean reaction queries
│   │   ├── manhwa.ts                 # Core manhwa queries + types
│   │   ├── notification.ts           # Notification queries
│   │   ├── poll.ts                   # Poll queries
│   │   ├── publisher.ts              # Publisher queries
│   │   ├── ranking.ts                # Top-ranked list queries
│   │   ├── relation.ts               # ManhwaRelation queries
│   │   ├── review.ts                 # Review queries
│   │   ├── search.ts                 # Full-text/filter search
│   │   ├── stats.ts                  # Score distribution / AniList stats
│   │   ├── trope.ts                  # Trope queries
│   │   └── user.ts                   # User profile queries
│   ├── ingestion/                    # Data pipeline scripts
│   │   ├── anilist-enrich.ts         # Enrich from AniList API
│   │   ├── anilist.ts                # AniList importer
│   │   ├── expand-news-articles.ts   # Expand pre-written news articles
│   │   ├── generate-news.ts          # AI news article generator (Claude)
│   │   ├── insert-news-manual.ts     # Manual news article insertion
│   │   ├── run-bootstrap.ts          # Bootstrap initial data
│   │   ├── run-enrich.ts             # Run enrichment pipeline
│   │   ├── run-news-pipeline.ts      # Full news pipeline runner
│   │   ├── run-seed-users.ts         # Run user seeding
│   │   ├── scrape-news.ts            # RSS scraper (ANN + Crunchyroll)
│   │   ├── seed-lists.ts             # Seed curated lists
│   │   ├── seed-publishers.ts        # Seed publisher data
│   │   ├── seed-users.ts             # Seed 1000 community users
│   │   └── trope-detection.ts        # Auto-detect tropes from synopsis
│   ├── nsfw.ts                       # Content filter logic
│   ├── scores/
│   │   ├── composite.ts              # Composite score calculator
│   │   ├── controversy.ts            # Controversy detection (std-dev)
│   │   ├── display.ts                # Display score formatting
│   │   └── ranks.ts                  # 8-tier rank system (E→SSS)
│   ├── scoring/
│   │   ├── engine.ts                 # 3-phase scoring engine
│   │   ├── realtime.ts               # recalculateSingleManhwaScore()
│   │   └── recalculate.ts            # Batch recalculate + trending
│   ├── seo/
│   │   ├── jsonld.ts                 # JSON-LD generators (Book, NewsArticle, Breadcrumb)
│   │   └── metadata.ts               # generateManhwaMetadata()
│   └── utils/
│       ├── formatCount.ts            # Format large numbers (1.2k, etc.)
│       ├── formatScore.ts            # Format score to 1 decimal
│       ├── slugify.ts                # URL slug generator
│       └── time.ts                   # Time formatting utilities
├── messages/
│   ├── en.json                       # English translations
│   └── fr.json                       # French translations
├── prisma/
│   ├── schema.prisma                 # Full database schema
│   └── migrations/                   # Prisma migration history
├── scripts/                          # One-off data scripts
│   ├── fix-content-ratings.ts        # Fix content rating data
│   ├── seed-articles.ts              # Seed editorial articles
│   ├── seed-display-scores.ts        # Seed display scores
│   ├── seed-polls.ts                 # Seed polls
│   └── seed/                         # Community seed system
│       ├── run-seed.ts               # Main seed runner
│       ├── config.ts                 # Seed configuration
│       ├── archetypes.ts             # User archetype definitions
│       ├── cleanup-seed.ts           # Remove seed users
│       ├── generate-libraries.ts
│       ├── generate-reviews.ts
│       ├── generate-social.ts
│       ├── generate-users.ts
│       ├── recalculate-averages.ts
│       ├── utils.ts
│       ├── generators/               # Per-entity generators
│       │   ├── character-votes.ts
│       │   ├── follows.ts
│       │   ├── libraries.ts
│       │   ├── reactions.ts
│       │   ├── recalculate.ts
│       │   ├── reviews.ts
│       │   └── users.ts
│       └── templates/                # Template text for seed content
│           ├── bios.ts
│           ├── reactions.ts
│           ├── reviews-long-en.ts
│           ├── reviews-long-fr.ts
│           ├── reviews-micro-en.ts
│           ├── reviews-micro-fr.ts
│           └── usernames.ts
├── types/
│   ├── index.ts                      # Shared TypeScript types
│   ├── next-auth.d.ts                # Augmented Auth.js session types
│   └── result.ts                     # Generic Result type
├── sentry.client.config.ts           # Sentry browser config
├── sentry.edge.config.ts             # Sentry edge config
├── sentry.server.config.ts           # Sentry server config
├── proxy.ts                          # (undocumented utility)
├── auth.ts                           # Auth.js root config
├── next.config.ts                    # Next.js config (images, headers, Sentry, i18n)
├── vercel.json                       # Vercel cron jobs
├── tsconfig.json                     # TypeScript config
├── package.json
└── SITE_AUDIT.md                     # This file
```

**Entry Points:**
- `app/layout.tsx` — root HTML shell
- `app/[locale]/layout.tsx` — locale-wrapped application shell
- `auth.ts` — Auth.js configuration

**Build Output:** `.next/` (standard Next.js build directory)

---

## 3. PAGES & ROUTES

### Homepage
- **File:** `app/[locale]/(public)/page.tsx`
- **URL:** `/{locale}`
- **Purpose:** Main landing page with multiple curated content sections
- **Sections:** Hero with stats inline, Trending, Top Rated (AniList), Recently Added, ManhwaVerse Ranking, Community Lists, All-Time Popular, Hidden Gems
- **Data fetching:** Server Component, `revalidate = 300` (5 min)
- **Data sources:** `lib/db/home.ts` (all home queries), `lib/db/genre.ts`, `lib/db/trope.ts`, `lib/db/list.ts`
- **Notable:** Each section wrapped in `<Suspense>` for streaming

### Explore (Browse)
- **File:** `app/[locale]/(public)/explore/page.tsx`
- **URL:** `/{locale}/explore`
- **Purpose:** Advanced browser with genre chips, trope browsing, search bar, and filters
- **Params (search):** `q`, `page`, `sort`, `status`, `type`, `genre`, `trope`, `year`
- **Data fetching:** Server Component, `revalidate = 300`
- **Sections:** Search bar, horizontal genre chip bar, results grid (24/page), trope browse by category at bottom

### Search
- **File:** `app/[locale]/(public)/search/page.tsx`
- **URL:** `/{locale}/search`
- **Purpose:** Dedicated search page (similar to explore, slightly different default behavior)
- **Params (search):** `q`, `page`, `sort`, `status`, `type`, `genre`, `trope`, `year`
- **Data fetching:** Server Component, `revalidate = 300`
- **Notable:** Shows popular manhwa when no query/filter active

### Manhwa Fiche (Detail)
- **Layout:** `app/[locale]/(public)/manhwa/[slug]/layout.tsx`
- **URL:** `/{locale}/manhwa/{slug}`
- **Purpose:** Per-manhwa detail pages with shared hero/sidebar layout
- **Dynamic params:** `slug` (manhwa slug)
- **Data fetching:** `getManhwaBySlug`, `revalidate = 3600`
- **Sections (layout):** Banner image, Hero (cover + metadata), Tab navigation, Sidebar (info, Where to Read, Controversy badge, Popularity stats, Alt titles), NSFW mature gate
- **Sub-pages:**
  - `page.tsx` — Overview: synopsis, Korean reactions, poll, relations, characters, character voting, tropes, reviews preview, similar titles
  - `reviews/page.tsx` — All reviews with sort (popular/recent), pagination
  - `staff/page.tsx` — Creators/authors/illustrators
  - `stats/page.tsx` — Score distribution charts + AniList stats
  - `characters/page.tsx` — Characters tab
  - `review/[reviewId]/page.tsx` — Permalink to single review
- **Static generation:** Top 100 slugs by reader count pre-generated
- **SEO:** `generateManhwaMetadata()`, JSON-LD Book schema, Breadcrumb schema

### Top Rankings
- **File:** `app/[locale]/(public)/top/page.tsx`
- **URL:** `/{locale}/top`
- **Purpose:** Top 100 ranked manhwa table with genre filter
- **Params (search):** `genre`
- **Data fetching:** Server Component

### Library (Auth Required)
- **File:** `app/[locale]/(auth)/library/page.tsx`
- **URL:** `/{locale}/library`
- **Purpose:** User's personal reading list with status tabs and sort options
- **Auth:** Required (redirects to sign-in if not authenticated)
- **Params (search):** `status`, `sort`
- **Sections:** Status tabs (READING/COMPLETED/ON_HOLD/DROPPED/PLAN_TO_READ/REREADING with counts), Sort options, Manhwa grid with progress bars

### Blog
- **Index:** `app/[locale]/(public)/blog/page.tsx` → `/{locale}/blog`
- **Article:** `app/[locale]/(public)/blog/[slug]/page.tsx` → `/{locale}/blog/{slug}`
- **Category:** `app/[locale]/(public)/blog/category/[cat]/page.tsx` → `/{locale}/blog/category/{cat}`
- **Submit:** `app/[locale]/(public)/blog/submit/page.tsx` → `/{locale}/blog/submit`
- **My Articles:** `app/[locale]/(public)/blog/my-articles/page.tsx` → `/{locale}/blog/my-articles`
- **By User:** `app/[locale]/(public)/blog/user/[username]/page.tsx` → `/{locale}/blog/user/{username}`
- **Purpose:** Community and editorial blog with categories: NEWS, GUIDE, LIST, OPINION, ANALYSIS
- **Data fetching:** `revalidate = 600`

### News
- **Index:** `app/[locale]/(public)/news/page.tsx` → `/{locale}/news`
- **Article:** `app/[locale]/(public)/news/[slug]/page.tsx` → `/{locale}/news/{slug}`
- **Purpose:** Editorial manhwa news (AI-generated from RSS + expanded manually)
- **Data fetching:** `revalidate = 600`
- **Notes:** News articles use `category = 'NEWS'` in Article table

### Genre Pages
- **Index:** `app/[locale]/(public)/genre/page.tsx` → `/{locale}/genre`
- **Detail:** `app/[locale]/(public)/genre/[slug]/page.tsx` → `/{locale}/genre/{slug}`
- **Dynamic params:** `slug`, search params: `page`, `sort`
- **Static params:** Generated for all genres × 2 locales
- **Revalidate:** 21600 (6 hours)

### Trope Pages
- **Index:** `app/[locale]/(public)/trope/page.tsx` → `/{locale}/trope`
- **Detail:** `app/[locale]/(public)/trope/[slug]/page.tsx` → `/{locale}/trope/{slug}`
- **Dynamic params:** `slug`, search params: `page`, `sort`
- **Static params:** Generated for all tropes × 2 locales
- **Revalidate:** 21600

### People (Creators/Authors)
- **Index:** `app/[locale]/(public)/people/page.tsx` → `/{locale}/people`
- **Detail:** `app/[locale]/(public)/people/[slug]/page.tsx` → `/{locale}/people/{slug}`
- **Params (search):** `page`, `role` (AUTHOR/ILLUSTRATOR/BOTH), `sort`
- **Revalidate:** 3600

### Characters
- **Index:** `app/[locale]/(public)/character/page.tsx` → `/{locale}/character`
- **Detail:** `app/[locale]/(public)/character/[slug]/page.tsx` → `/{locale}/character/{slug}`
- **Params (search):** `page`, `role` (MAIN/SUPPORTING)
- **Revalidate:** 3600

### Publishers
- **Index:** `app/[locale]/(public)/publisher/page.tsx` → `/{locale}/publisher`
- **Detail:** `app/[locale]/(public)/publisher/[slug]/page.tsx` → `/{locale}/publisher/{slug}`
- **Revalidate:** 3600

### Profile
- **Own:** `app/[locale]/(public)/profile/page.tsx` → `/{locale}/profile`
- **Public:** `app/[locale]/(public)/profile/[username]/page.tsx` → `/{locale}/profile/{username}`
- **Followers:** `/{locale}/profile/{username}/followers`
- **Following:** `/{locale}/profile/{username}/following`
- **Sections:** Avatar, display name, stats (titles/reviews/followers/following), follower preview strip, reading challenge widget, recent activity, recent library grid

### Settings (Auth Required)
- **File:** `app/[locale]/(public)/settings/page.tsx`
- **URL:** `/{locale}/settings`
- **Purpose:** Edit profile, notification preferences, content filter
- **Auth:** Required via `requireSession()`

### Members
- **File:** `app/[locale]/(public)/members/page.tsx`
- **URL:** `/{locale}/members`
- **Purpose:** User directory with search and follow buttons
- **Params (search):** `q`, `page`
- **Revalidate:** 60s

### Community Lists
- **Index:** `/{locale}/lists`
- **Create:** `/{locale}/lists/new`
- **Detail:** `/{locale}/lists/{slug}`
- **Edit:** `/{locale}/lists/{slug}/edit`

### Fan Art / Artwork
- **Index:** `/{locale}/artwork`
- **New:** `/{locale}/artwork/new`
- **Detail:** `/{locale}/artwork/{postId}`
- **Sections:** Masonry grid, sort (recent/top), tag cloud
- **Revalidate:** 120s

### Reading Challenge
- **File:** `app/[locale]/(public)/challenge/[year]/page.tsx`
- **URL:** `/{locale}/challenge/{year}`
- **Purpose:** Annual reading challenge with progress tracking, goal setting
- **Auth:** Optional (shows sign-in CTA if not logged in)

### Notifications (Auth Required)
- **File:** `app/[locale]/(public)/notifications/page.tsx`
- **URL:** `/{locale}/notifications`
- **Revalidate:** Dynamic

### Activity Feed (Auth Required)
- **File:** `app/[locale]/(public)/feed/page.tsx`
- **URL:** `/{locale}/feed`
- **Purpose:** Shows recent activity from followed users

### Admin Pages
- `/{locale}/admin/blog` — UGC article moderation (admin/moderator)
- `/{locale}/admin/news` — News draft review (admin/moderator)
- `/{locale}/admin/article/{id}/edit` — Article editor
- `/{locale}/admin/users/{username}` — User admin panel

### Static / Legal Pages
- `/{locale}/about` — About page (i18n content from messages)
- `/{locale}/faq` — 10 FAQ entries (i18n content from messages)
- `/{locale}/privacy` — Privacy policy (robots: noindex)
- `/{locale}/terms` — Terms of service (robots: noindex)

### Auth Pages
- `/{locale}/sign-in` — Google + Discord OAuth login
- `/{locale}/sign-up` — (page file exists, likely minimal or redirect)

---

## 4. COMPONENTS & LAYOUTS

### Layout Components
| File | Component | Purpose | Props |
|---|---|---|---|
| `components/layouts/Header.tsx` | `Header` | Sticky top nav with dropdowns, locale switcher, notification bell, auth state | none (reads from hooks) |
| `components/layouts/Footer.tsx` | `Footer` | 4-column footer with Discover/Community/Legal/About links | `locale: string` |
| `components/layouts/MobileNav.tsx` | `MobileNav` | Fixed bottom bar (mobile): Home/Explore/Library/Notifications/Profile | none |
| `components/layouts/PageContainer.tsx` | `PageContainer` | `max-w-5xl mx-auto px-4` wrapper | `children`, `className?` |

### Feature Components — Manhwa Cards
| File | Component | Purpose | Props |
|---|---|---|---|
| `ManhwaCard.tsx` | `ManhwaCard` | Cover image card with score badge, rank badge, genres, blur for NSFW | `manhwa`, `locale`, `userContentFilter?`, `rankBadgeTop?`, `userScore?` |
| `ManhwaCardPopup.tsx` | `ManhwaCardPopup` | Hover popup with synopsis + tropes | `manhwa`, `locale`, `children` |
| `ManhwaCardOverlay.tsx` | `ManhwaCardOverlay` | Gradient overlay on hover | — |
| `ManhwaCardSkeleton.tsx` | `ManhwaCardSkeleton` | Animated loading placeholder | none |
| `ScrollableRow.tsx` | `ScrollableRow` | Horizontal scroll container with snap | `children` |

### Feature Components — Manhwa Fiche
| File | Component | Purpose |
|---|---|---|
| `manhwa/ManhwaBanner.tsx` | `ManhwaBanner` | Full-width blurred banner image |
| `ManhwaHero.tsx` | `ManhwaHero` | Left-side cover + metadata, wraps LibraryActions |
| `manhwa/ManhwaTabNav.tsx` | `ManhwaTabNav` | Overview/Reviews/Staff/Stats tab navigation |
| `manhwa/KoreanReactions.tsx` | `KoreanReactions` | 6-emoji reaction bar (헐/대박/감동/킹받/미쳐/죽겠) |
| `manhwa/CharacterVoting.tsx` | `CharacterVoting` | Vote for favorite character |
| `manhwa/ManhwaCharacters.tsx` | `ManhwaCharacters` | Character grid preview |
| `manhwa/ManhwaRelations.tsx` | `ManhwaRelations` | Related works (sequel/prequel/etc.) |
| `manhwa/ManhwaStaff.tsx` | `ManhwaStaff` | Author/illustrator list |
| `manhwa/ManhwaStats.tsx` | `ManhwaStats` | Score distribution charts (Recharts) |
| `manhwa/ScoreCard.tsx` | `ScoreCard` | Score display with confidence |
| `manhwa/WhereToRead.tsx` | `WhereToRead` | Platform links + affiliate revenue |
| `manhwa/ControversyBadge.tsx` | `ControversyBadge` | Shows controversy rating if high std-dev |

### Feature Components — Library
| File | Component | Purpose |
|---|---|---|
| `library/LibraryActions.tsx` | `LibraryActions` | Status/score/progress controls on fiche |
| `library/LibraryQuickDropdown.tsx` | `LibraryQuickDropdown` | Dropdown to quickly change status |
| `library/ListEditorModal.tsx` | `ListEditorModal` | Full library entry editor with all fields |
| `library/ScoreBadge.tsx` | `ScoreBadge` | Shows user's personal score |
| `library/HeartIcon.tsx` | `HeartIcon` | Animated heart for favorites |

### Feature Components — Social
| File | Component | Purpose |
|---|---|---|
| `FollowButton.tsx` | `FollowButton` | Follow/unfollow with optimistic update |
| `FavoriteButton.tsx` | `FavoriteButton` | Favorite toggle |
| `ActivityCard.tsx` | `ActivityCard` | Single activity feed entry |
| `NotificationBell.tsx` | `NotificationBell` | Bell icon in header with unread badge |
| `NotificationDropdown.tsx` | `NotificationDropdown` | Preview dropdown of recent notifications |
| `NotificationItem.tsx` | `NotificationItem` | Single notification display |

### Feature Components — Reviews
| File | Component | Purpose |
|---|---|---|
| `ReviewCard.tsx` | `ReviewCard` | Full review with like/dislike/reaction actions |
| `ReviewForm.tsx` | `ReviewForm` | Inline form for micro or long review submission |

### Feature Components — Blog
| File | Component | Purpose |
|---|---|---|
| `blog/ArticleCard.tsx` | `ArticleCard` | Blog article preview card |
| `blog/MarkdownRenderer.tsx` | `MarkdownRenderer` | Renders Markdown to HTML with custom styling |
| `blog/RichEditor.tsx` | `RichEditor` | Tiptap WYSIWYG rich text editor |

### Feature Components — Home
| File | Component | Purpose |
|---|---|---|
| `home/HomePodium.tsx` | `HomePodium` | Top-3 podium with gold/silver/bronze |
| `home/HomeRanking.tsx` | `HomeRanking` | Compact ranking widget on homepage |
| `home/HomeRankingList.tsx` | `HomeRankingList` | Rank list items |
| `HomeSection.tsx` | `HomeSection` | Named section with "See all" link |
| `HomeFilterBar.tsx` | `HomeFilterBar` | Genre/trope filter pills |

### Feature Components — Other
| File | Component | Purpose |
|---|---|---|
| `RankBadge.tsx` | `RankBadge` | Korean creature rank badge (E-Rank Slime → SSS-Rank Hwanin) |
| `MatureGate.tsx` | `MatureGate` | R18 content interstitial gate |
| `SynopsisSection.tsx` | `SynopsisSection` | Expandable synopsis with "show more" |
| `TropeList.tsx` | `TropeList` | Trope chips linking to trope pages |
| `SearchBar.tsx` | `SearchBar` | Full search bar with multi-filter UI |
| `LibraryButton.tsx` | `LibraryButton` | Quick-add to library button |
| `NewsGeneratorButton.tsx` | `NewsGeneratorButton` | Admin button to trigger AI news pipeline |
| `poll/PollWidget.tsx` | `PollWidget` | In-page poll with voting |

### Provider Components
| File | Component | Purpose |
|---|---|---|
| `providers/SessionProvider.tsx` | `SessionProvider` | Wraps Auth.js session context |
| `providers/PostHogProvider.tsx` | `PostHogTracker` | PostHog page tracking |

### UI Utilities
| File | Component | Purpose |
|---|---|---|
| `ui/JsonLd.tsx` | `JsonLd` | Injects `<script type="application/ld+json">` |

---

## 5. DATA & DATABASE

### Database
- **Type:** PostgreSQL
- **ORM:** Prisma 6 with `@prisma/client`
- **Host:** Supabase (with Row-Level Security on most models)
- **Connection:** Pooled via `DATABASE_URL`, direct migrations via `DIRECT_URL`

### Prisma Models Summary

| Model | Key Fields | Relations |
|---|---|---|
| **User** | id, username, display_name, avatar_url, bio, locale, content_filter, is_admin, is_seed, is_premium, reading_streak, influence_score | Account, Session, Library, Reviews, Follows, Notifications, etc. |
| **Manhwa** | id, slug, title_en/kr/fr/alt, synopsis, cover_url, banner_url, type, status, chapter_count, release_year, content_rating, score_avg, score_count, display_score, display_popularity, reaction counts × 6 | Genres, Tropes, Characters, Creators, Publishers, Reviews, Reactions, Relations, etc. |
| **UserLibrary** | id, user_id, manhwa_id, status, progress, score, is_favorite, private_tags, notes, reread_count | User, Manhwa |
| **Review** | id, user_id, manhwa_id, content, score, is_micro, has_spoilers, score_story/art/characters/world, likes_count, dislikes_count | User, Manhwa, ReviewLike, ReviewDislike, ReviewReaction |
| **Article** | id, slug, title_en/fr, content_en/fr, excerpt_en/fr, category (NEWS/GUIDE/LIST/OPINION/ANALYSIS), status (DRAFT/PUBLISHED/ARCHIVED), author_name, view_count, user_id | User, ArticleManhwa |
| **Genre** | id, slug, name_en/fr, description, color, manhwa_count | ManhwaGenre |
| **Trope** | id, slug, name, description_en/fr, category (5 categories), manhwa_count | ManhwaTrope |
| **Creator** | id, slug, name, name_native, bio_en/fr, avatar_url, nationality, avg_score, total_readers | ManhwaCreator, CreatorFollow |
| **Character** | id, slug, name_en, name_native, name_alt[], description, age, gender, image_url, anilist_id | ManhwaCharacter, CharacterVote |
| **Publisher** | id, slug, name, name_native, description, logo_url, country, anilist_id | ManhwaPublisher |
| **ManhwaList** | id, slug, user_id, title, description, is_public, likes_count, item_count | ListItem, ListVote, User |
| **FanArtPost** | id, user_id, manhwa_id?, title, tags[], is_nsfw, like_count, comment_count | FanArtImage, FanArtComment, FanArtLike |
| **Notification** | id, user_id, type, data (JSON), read | User |
| **Follow** | follower_id, following_id | User (×2) |
| **ManhwaReaction** | user_id, manhwa_id, reaction (KoreanReaction enum) | User, Manhwa |
| **ReadingChallenge** | user_id, year, goal | User |
| **Activity** | id, user_id, type (ActivityType enum), manhwa_id?, metadata? | User |
| **Achievement** | id, slug, name_en/fr, description_en/fr, icon, category | UserAchievement |
| **Arc** | id, manhwa_id, name_en/fr, chapter_start/end, score_avg, score_count | Manhwa, ArcScore |
| **Poll** / **PollOption** / **PollVote** | Poll: question_en/fr, manhwa_id?, is_active | — |
| **Quote** / **QuoteVote** | Quote: manhwa_id, content (500 char), votes | — |
| **ReadLink** | manhwa_id, platform, url, is_free, is_official, language, is_affiliate, affiliate_url | Manhwa |
| **Release** | manhwa_id, chapter, platform, url, released_at, notifications_sent | Manhwa |
| **ManhwaRelation** | source_id, target_id, relation_type (ADAPTATION/SOURCE/SEQUEL/PREQUEL/SIDE_STORY/ALTERNATIVE/LIGHT_NOVEL) | Manhwa (×2) |
| **SimilarManhwa** | source_id, target_id, similarity, reasons[] | Manhwa (×2) |
| **ScoreHistory** | manhwa_id, score, reader_count, recorded_at | Manhwa |
| **ExternalScoreSnapshot** | manhwa_id, platform (MAL/ANILIST/KITSU), score | Manhwa |
| **ReadingRoom** | slug, manhwa_id, max_members, created_by | RoomMember, RoomMessage |
| **SocialPostQueue** | platform, content, status, scheduled_at | — |
| **SyncLog** | source, type, items_synced, errors, duration_ms | — |
| **ModerationLog** | action, target_id, target_type, reason | — |
| **Report** | reporter_id, content_type, content_id, reason, status | — |

### Key Enums
- `ReadingStatus`: READING, COMPLETED, ON_HOLD, DROPPED, PLAN_TO_READ, REREADING
- `PublicationStatus`: ONGOING, COMPLETED, HIATUS, CANCELLED, NOT_YET_RELEASED
- `ContentRating`: G, PG, PG13, M, R18, X
- `ContentType`: MANHWA, MANHUA
- `KoreanReaction`: HEOL (헐), DAEBAK (대박), GAMDONG (감동), KINGBAT (킹받), MICHYEO (미쳐), JUKGET (죽겠)
- `ArticleCategory`: NEWS, GUIDE, LIST, OPINION, ANALYSIS
- `CharacterRole`: MAIN, SUPPORTING, BACKGROUND
- `CreatorRole`: AUTHOR, ILLUSTRATOR, BOTH
- `TropeCategory`: PROTAGONIST_TYPE, NARRATIVE, SETTING, THEME, AMBIANCE
- `ActivityType`: ADDED_TO_LIBRARY, COMPLETED, RATED, REVIEWED, CREATED_LIST, STARTED_READING, FAVORITED
- `ContentFilter`: SAFE, MATURE, ALL

### How Data is Queried
- All database access goes through `lib/db/` modules — **no direct Prisma calls in page components**
- Single Prisma client instance in `lib/db/client.ts` (singleton pattern for serverless)
- Key query types: `getManhwaBySlug`, `searchManhwas`, `getTrendingManhwas`, `getTopRated`, etc.
- `manhwaCardSelect` and `manhwaCardWithPopupSelect` are reusable Prisma select shapes

### External Data Sources
- **AniList GraphQL API** — enriches manhwa metadata (scores, covers, staff, characters)
- **MyAnimeList (MAL)** — external score source
- **Kitsu** — external score source
- **Anime News Network RSS** — news scraping
- **Crunchyroll RSS** — news scraping
- **MangaDex** — ID linking
- **Cloudflare Images** (`imagedelivery.net`) — CDN for covers
- **DiceBear API** — avatar generation
- **Clearbit** — publisher logos

---

## 6. MANHWA CONTENT MODEL

### All Fields on Manhwa Model
```
Core Identifiers:
  id (String), slug (String unique), anilist_id (Int unique), mal_id (Int unique),
  mangadex_id (String unique), kitsu_id (String unique)

Titles:
  title_en, title_kr, title_fr, title_alt (String[])

Content:
  synopsis_en, synopsis_fr, cover_url, cover_cf_id (Cloudflare), banner_url
  type (MANHWA | MANHUA), status (Publication status enum)
  chapter_count, volume_count, release_year, end_year
  origin_country (default: "KR"), demographic
  content_rating (G/PG/PG13/M/R18/X), cover_is_nsfw
  has_gore, has_nudity, has_strong_language
  anilist_stats (JSON — score distribution)

Internal Scores (ManhwaVerse):
  score_avg, score_stddev, score_count, score_positive_rate

Counters (denormalized):
  review_count, reader_count, favorite_count, waitlist_count, list_count
  reaction_heol, reaction_daebak, reaction_gamdong, reaction_kingbat,
  reaction_michyeo, reaction_jukget

External Scores:
  ext_score_mal, ext_score_mal_count
  ext_score_anilist, ext_score_anilist_count
  ext_score_kitsu, ext_score_kitsu_count
  ext_score_composite, ext_scores_updated_at

Display Fields (computed by scoring engine):
  display_score, display_score_source, display_score_phase, display_score_confidence
  display_popularity, display_popularity_source

Trending:
  trending_score, trending_fr, trending_en

Admin/Metadata:
  is_published, is_verified, data_source (String[])
  created_at, updated_at, deleted_at
```

### Genre Taxonomy
- Each genre has: id, slug, name_en, name_fr, description_en/fr, color, manhwa_count
- Many-to-many with Manhwa via `ManhwaGenre`

### Trope Taxonomy
- Categories: PROTAGONIST_TYPE, NARRATIVE, SETTING, THEME, AMBIANCE
- Each trope: id, slug, name, description_en/fr, manhwa_count
- Many-to-many with Manhwa via `ManhwaTrope` (with upvotes/downvotes per pairing)

### Publication Status Values
- ONGOING, COMPLETED, HIATUS, CANCELLED, NOT_YET_RELEASED

### Cover Storage Strategy
- Primary: External URLs from AniList (`s4.anilist.co`), MAL (`cdn.myanimelist.net`), MangaDex (`uploads.mangadex.org`)
- CDN: Cloudflare Images (`imagedelivery.net`) when `cover_cf_id` is set
- All allowed via `next.config.ts` `remotePatterns`

### Approximate Content Scale
- ~1000+ seed users (`is_seed: true`)
- 493 MATURE phase manhwas (≥50 scores, ≥200 readers)
- 1563 GROWING phase manhwas (≥10 scores, ≥20 readers)
- 187k library entries (seeded), 18k reviews (seeded), 32k reactions (seeded)

---

## 7. STYLES & DESIGN SYSTEM

### CSS Approach
- **Tailwind CSS v4** with `@import "tailwindcss"` (no config file, uses CSS-first approach)
- **`@theme inline`** block in `app/globals.css` defines all design tokens
- **`@tailwindcss/typography`** plugin for prose content
- Dark mode only — no light mode toggle

### Color Palette (all CSS variables from globals.css)

**Base Colors:**
| Variable | Value | Usage |
|---|---|---|
| `--color-base` | `#0D0D0F` | Page background |
| `--color-surface` | `#13141A` | Card/section backgrounds |
| `--color-elevated` | `#1C1E27` | Elevated elements (inputs, badges) |
| `--color-border` | `#252836` | All borders |

**Crystal System (Brand Colors):**
| Variable | Value | Usage |
|---|---|---|
| `--color-crystal-gold` | `#C9A84C` | Gold accents, top-ranked |
| `--color-crystal-blue` | `#4A9EFF` | Primary CTA, active states |
| `--color-crystal-red` | `#E05252` | Alerts, errors, important |
| `--color-crystal-void` | `#555970` | Void/empty states |

**Text Colors:**
| Variable | Value | Usage |
|---|---|---|
| `--color-text-primary` | `#E8E4D9` | Main body text |
| `--color-text-secondary` | `#8B8FA8` | Secondary text |
| `--color-text-muted` | `#4A4E63` | Dimmed labels |

**Semantic Colors:**
| Variable | Value | Usage |
|---|---|---|
| `--color-success` | `#4ADE80` | Success states |
| `--color-warning` | `#FBBF24` | Warnings |
| `--color-error` | `#EF4444` | Errors, delete actions |
| `--color-info` | `#3B82F6` | Info messages |

### Typography
| Variable | Font | Weights | Usage |
|---|---|---|---|
| `--font-display` | Playfair Display | 400–800 | Headings (`font-display` class) |
| `--font-sans` | DM Sans | 400–700 | Body text (default) |
| `--font-mono` | JetBrains Mono | 400–700 | Numbers, scores, code |

### Border Radius Scale
- `--radius-sm`: 2px, `--radius-md`: 6px, `--radius-lg`: 12px, `--radius-xl`: 16px, `--radius-2xl`: 24px, `--radius-full`: 9999px

### Dark/Light Mode
- **Dark mode only** — `class="dark"` set on `<html>` permanently, no toggle

### Animations (defined in globals.css)
| Name | Effect | Used for |
|---|---|---|
| `crystal-fill` | clip-path reveal bottom→top | Score fills |
| `crystal-shimmer` | opacity pulse 0.6→1 | Rank badges |
| `count-up` | fade in + slide up | Counter reveals |
| `stagger-reveal` | staggered fade in | List items |
| `rank-glow` | box-shadow glow pulse | S-Rank and above |
| `animate-rank-glow` | utility class | Applied to SSS/SS/S ranks |

### Custom Utilities
- `scrollbar-none` — hides scrollbar cross-browser (used on horizontal scroll rows)

---

## 8. NAVIGATION & UX FLOWS

### Header Navigation (desktop)
- **Logo** → `/{locale}` (homepage)
- **Discover** → `/{locale}/explore`
- **Browse** (dropdown):
  - People → `/{locale}/people`
  - Characters → `/{locale}/character`
  - Publishers → `/{locale}/publisher`
- **News** → `/{locale}/news`
- **Community** (dropdown):
  - Blog → `/{locale}/blog`
  - Members → `/{locale}/members`
  - Lists → `/{locale}/lists`
  - Fan Art → `/{locale}/artwork`
  - Reading Challenge → `/{locale}/challenge/{year}`
- **My Library** (auth only) → `/{locale}/library`
- **Locale switcher** (EN ↔ FR)
- **Notification bell** (with unread count badge)
- **Profile** / **Sign In** / **Sign Out**

### Mobile Bottom Nav
- Home, Discover, Library (auth), Notifications (auth), Profile (auth)
- Shows Sign In if not authenticated in Profile slot

### Footer Navigation
- **Discover:** Genres, Tropes, Top Manhwa
- **Community:** News, Activity Feed, Search, Blog, Community Lists
- **Legal:** Privacy Policy, Terms of Service
- **About:** About, FAQ

### Search Implementation
- `SearchBar` component used on `/search` and `/explore`
- Filters: text query, status, type, genre, trope, year, sort
- All filters are URL search params (server-side rendering)
- Search in `lib/db/search.ts` does `contains` (case-insensitive) across title_en, title_fr, title_kr, title_alt
- No full-text search index — uses Prisma `contains` + `mode: 'insensitive'`

### Reading Flow
1. User finds manhwa via homepage/explore/search/genre/trope
2. Opens manhwa fiche → sees synopsis, reactions, reviews
3. Uses `LibraryActions` to add to library with status
4. Can score, update progress, add notes via `ListEditorModal`
5. Can write micro review (280 chars) or long review (10-10000 chars)
6. Can react with Korean reactions (헐/대박/etc.)
7. Can vote for favorite character

### NSFW Gate Flow
- If `manhwa.content_rating === 'R18'` AND user content_filter is not `ALL`:
  - Shows `MatureGate` interstitial before page content
  - User can confirm to reveal content
- Covers marked `cover_is_nsfw: true` are blurred unless filter is `ALL`

---

## 9. SEO & META

### Title Strategy
- Template: `%s | ManhwaVerse` (from locale layout)
- Manhwa pages: `{Title} — Review, Score & Recommendations`
- Blog/news articles: `{Title} — ManhwaVerse Blog`
- Genre pages: `{Name} Manhwa — Best Titles & Reviews`

### Meta Descriptions
- Generated from synopsis snippet + score + genres for manhwa pages
- i18n translations for static pages

### Open Graph
- `type: 'book'` for manhwa pages
- `type: 'website'` for site root
- Twitter card: `summary_large_image`
- OG images: Dynamic via `opengraph-image.tsx` (uses `@vercel/og`)
- Locale-specific OG (`en_US` / `fr_FR`)

### Sitemap (`app/sitemap.ts`)
- Dynamically generated from DB
- Includes: static pages, all published manhwas, all genres, all tropes, blog/news articles, people, characters, publishers
- Priorities: homepage 1.0, explore/top 0.9, search/manhwa 0.8, genre/trope/news 0.6-0.7, legal 0.3
- Both locales for every URL

### Robots (`app/robots.ts`)
- Allow: `/`
- Disallow: `/api/`, `/*/settings`, `/*/library`

### Schema.org JSON-LD
- Manhwa fiche: `Book` schema with author, genre, chapter count, aggregateRating
- News articles: `NewsArticle` schema with headline, datePublished, author (Organization)
- All pages with hierarchy: `BreadcrumbList` schema

### Slug Patterns
- Manhwa: `/manhwa/{anilist-derived-slug}` (e.g., `/manhwa/solo-leveling`)
- Genre: `/genre/{slug}`
- Trope: `/trope/{slug}`
- Creator: `/people/{slug}`
- Publisher: `/publisher/{slug}`
- Character: `/character/{slug}`
- Article: `/blog/{timestamp-slug}` or `/news/{slug}`
- List: `/lists/{slugified-title}`

---

## 10. AUTHENTICATION & USER SYSTEM

### Auth Configuration (`auth.ts`)
- **Library:** Auth.js (next-auth) v5 beta
- **Adapter:** `@auth/prisma-adapter` — stores accounts/sessions in DB
- **Session strategy:** JWT (not database sessions)
- **Providers:** Google OAuth, Discord OAuth
- **Sign-in page:** `/{locale}/sign-in`

### JWT Callback
On login, enriches JWT with: `id`, `username`, `locale`, `avatar_url`, `display_name`, `is_admin`

### Session Callback
Propagates all JWT fields to `session.user`

### Protected Routes (via `authorized` callback)
Patterns that redirect to sign-in if not logged in:
- `/[a-z]{2}/library`
- `/[a-z]{2}/settings`
- `/[a-z]{2}/profile` (exact own profile)

### User Creation Event
On first login, auto-generates username from email prefix (deduplicates with numeric suffix), sets display_name and avatar_url from OAuth provider.

### User Model Fields
| Field | Type | Purpose |
|---|---|---|
| id | String | Unique ID |
| username | String? unique | URL-safe identifier |
| display_name | String? | Display name |
| avatar_url | String? | Profile picture URL |
| bio | VarChar(300) | Profile bio |
| locale | String | Preferred language (en/fr) |
| content_filter | ContentFilter | SAFE/MATURE/ALL |
| is_admin | Boolean | Full admin access |
| is_seed | Boolean | Seed account (cleanup flag) |
| is_premium | Boolean | Premium subscription status |
| is_banned | Boolean | Account ban flag |
| reading_streak | Int | Days reading streak |
| influence_score | Float | Community influence metric |
| notif_* | Boolean × 5 | Notification preferences |
| artist_* | String × 5 | Artist social links (if is_artist) |

### Admin System
- `is_admin` field on User model
- Fallback: `ADMIN_EMAILS` env var (comma-separated)
- Moderators: `MODERATOR_USERNAMES` env var — can access admin/blog, admin/news
- `isAdmin()` function in `lib/auth/session.ts`

### Auth-Gated Features
| Feature | Method |
|---|---|
| Library | `requireSession()` redirect |
| Settings | `requireSession()` redirect |
| Writing reviews | Check `user` in server component |
| Following users | `getUser()` null check in action |
| Korean reactions | `getUser()` null check in action |
| Adding to library | `getUser()` null check in action |
| Creating lists | `getUser()` null check in action |
| Submitting fan art | `getUser()` null check in action |
| Submitting articles | `getUser()` null check in action |
| Activity feed | `requireSession()` redirect |
| Notifications | `requireSession()` redirect |

---

## 11. API ROUTES & SERVER LOGIC

### API Routes (`app/api/`)

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/notifications` | GET | Session required | Paginated notification list (query: `page`, `limit`) |
| `/api/notifications/unread-count` | GET | Session required | Returns unread notification count for bell badge |
| `/api/cron/recalculate-scores` | GET | `CRON_SECRET` bearer | Hourly: recalculate all display scores + trending |
| `/api/cron/auto-publish-drafts` | GET | `CRON_SECRET` bearer | Every 2h: auto-publish user DRAFT articles older than 2h |
| `/api/admin/run-news-pipeline` | POST | Admin/Moderator | Scrape RSS feeds + generate AI news articles via Claude |
| `/api/admin/user/[username]` | GET/PATCH | Admin | Admin user operations |

### Server Actions (`lib/actions/`)

**Library Actions (`library.ts`):**
- `addToLibraryAction(formData)` — add/update library entry + recalculate score
- `removeFromLibraryAction(manhwaId)` — remove from library + recalculate
- `updateScoreAction(manhwaId, score)` — update score + log activity
- `updateProgressAction(manhwaId, progress)` — update chapter progress
- `updateLibraryEntryAction(input)` — full entry update (status/score/dates/tags/notes)
- `toggleFavoriteAction(manhwaId)` — toggle favorite + log activity

**Review Actions (`review.ts`):**
- `createReviewAction(data)` — create micro or long review
- `deleteReviewAction(reviewId)` — soft delete (own reviews)
- `toggleLikeAction(reviewId)` — like/unlike + notify author
- `toggleDislikeAction(reviewId)` — dislike toggle
- `toggleReactionAction(reviewId, reaction)` — Korean reaction on review
- `adminDeleteReviewAction(reviewId)` — admin soft delete

**Follow Actions (`follow.ts`):**
- `followAction(targetUserId)` — follow user + notify
- `unfollowAction(targetUserId)` — unfollow user

**Reaction Actions (`reaction.ts`):**
- `toggleManhwaReactionAction(manhwaId, reaction)` — toggle Korean reaction on manhwa

**Profile Actions (`profile.ts`):**
- `updateProfileAction(formData)` — update display_name, bio, locale, avatar_url
- `updateNotificationPrefsAction(data)` — update notification preferences

**Article Actions (`article.ts`):**
- `submitArticle(formData)` — submit user article (creates as DRAFT, notifies moderators)
- `deleteOwnArticle(articleId)` — delete own unpublished article

**Admin Article Actions (`admin-article.ts`):**
- `publishUserArticle(articleId)` — publish pending article
- `rejectArticle(articleId)` — reject (sets back to non-pending)
- `deleteUserArticle(articleId)` — permanently delete

**Admin User Actions (`admin-user.ts`):**
- Ban/unban users

**List Actions (`list.ts`):**
- `createListAction(data)` — create list with unique slug
- `updateListAction(listId, data)` — update list metadata
- `updateListFromFormAction(listId, locale, formData)` — form-compatible update
- `deleteListAction(listId, locale)` — delete list + all items
- `toggleListLikeAction(listId)` — like/unlike list
- `addItemToListAction(listId, manhwaId, note?)` — add manhwa to list
- `removeItemFromListAction(listId, manhwaId)` — remove from list
- `searchManhwasForListAction(query)` — search manhwas for adding to list

**Fan Art Actions (`fan-art.ts`):**
- Create/like/delete fan art posts

**Challenge Actions (`challenge.ts`):**
- `setChallengeGoalAction(year, formData)` — set/update reading challenge goal

**Poll Actions (`poll.ts`):**
- Vote on polls

**Character Vote Actions (`character-vote.ts`):**
- Vote for favorite character per manhwa

**Notification Actions (`notification.ts`):**
- Mark notifications as read

**NSFW Actions (`nsfw.ts`):**
- Update content filter preference

### Notification Types
- `review_liked` — when someone likes your review
- `new_follower` — when someone follows you
- `new_draft_article` — sent to moderators when user submits article

---

## 12. PERFORMANCE & CONFIG

### Image Optimization
- **Next.js Image component** used throughout
- Allowed remote hostnames in `next.config.ts`:
  - `s4.anilist.co` (AniList covers)
  - `imagedelivery.net` (Cloudflare CDN)
  - `cdn.myanimelist.net` (MAL covers)
  - `uploads.mangadex.org` (MangaDex covers)
  - `logo.clearbit.com` (publisher logos)
  - `api.dicebear.com` (generated avatars)
  - `cdn.discordapp.com` (Discord avatars)
  - `lh3.googleusercontent.com` (Google avatars)

### Caching Strategy
| Page | Revalidate | Rationale |
|---|---|---|
| Homepage | 300s (5 min) | Trending + new content |
| Explore/Search | 300s | Filters change often |
| Manhwa fiche | 3600s (1h) | Scores updated by cron |
| Blog/News | 600s (10 min) | New articles not too frequent |
| Genre/Trope | 21600s (6h) | Taxonomy rarely changes |
| People/Publisher/Character | 3600s | Creator data stable |
| Top ranking | — | Dynamic (no revalidate) |
| Members | 60s | Frequently changing |
| Admin pages | `force-dynamic` | Always fresh |

### Cron Jobs (vercel.json)
```json
[
  { "path": "/api/cron/recalculate-scores", "schedule": "0 * * * *" },
  { "path": "/api/cron/auto-publish-drafts", "schedule": "0 */2 * * *" }
]
```
- Score recalculation: every hour
- Auto-publish user drafts: every 2 hours

### Security Headers (next.config.ts)
Applied to all routes `/(.*)*`:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `X-DNS-Prefetch-Control: on`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

### Full next.config.ts
```typescript
import { withSentryConfig } from '@sentry/nextjs'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig = {
  images: { remotePatterns: [...8 hostnames...] },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

export default withSentryConfig(withNextIntl(nextConfig), {
  silent: true,
  disableLogger: true,
})
```

### Monitoring
- **Sentry:** Configured for client, server, and edge runtimes. `tracesSampleRate: 0.1`. Only active when `SENTRY_DSN` env var is present.
- **PostHog:** Client-side analytics via `PostHogTracker` component in locale layout.

---

## 13. KNOWN ISSUES & MISSING FEATURES

### No Explicit TODO/FIXME Found
A grep for `TODO`, `FIXME`, `HACK`, `XXX`, `BUG` in source files found no developer-added annotations. The codebase is relatively clean in this regard.

### Incomplete / Stub Pages
| Page | Status | Notes |
|---|---|---|
| `sign-up/page.tsx` | File exists but not read — likely stub | OAuth-only auth means sign-up = first OAuth login |
| `feed/page.tsx` | Auth-required, uses `requireSession` | Not in mobile nav's auth-required links (missing from footer discovery) |
| `notifications/page.tsx` | Functional | Not linked from Header (only mobile nav + bell) |
| Manhwa `characters/page.tsx` | Likely redirects to main tab | Characters shown on main page, separate tab may be incomplete |

### Known Code Issues
1. **`lib/db/search.ts` — Relevance sort:** When `sortBy === 'relevance'`, falls through to `reader_count: 'desc'` — true full-text relevance search is not implemented.
2. **`app/[locale]/(public)/news/page.tsx`:** Uses `<!-- eslint-disable-next-line @next/next/no-img-element -->` and raw `<img>` for news thumbnails (no `next/image` optimization).
3. **`app/[locale]/(public)/publisher/page.tsx`:** Uses raw `<img>` for publisher logos with eslint-disable comment.
4. **Hardcoded base URL:** `BASE_URL = 'https://manhwaverse.com'` is hardcoded in `lib/seo/jsonld.ts` and `lib/seo/metadata.ts` instead of reading from env var.
5. **`auth.ts` sign-in page:** Hardcoded to `/en/sign-in` instead of dynamically using the current locale.
6. **Auto-publish logic:** `api/cron/auto-publish-drafts` auto-publishes all user-submitted DRAFT articles older than 2 hours without requiring human moderation. This means UGC bypasses moderation after 2h.
7. **Reading Room model:** `ReadingRoom`, `RoomMember`, `RoomMessage` models exist in schema but no UI or routes reference them — feature is schema-only.
8. **SocialPostQueue model:** Exists in schema but no UI or posting logic implemented.
9. **Achievement system:** `Achievement` and `UserAchievement` models exist but no achievement-granting logic or display UI found.
10. **`trending_fr` / `trending_en` fields:** Exist on Manhwa model but `recalculateTrendingScores()` only updates `trending_score` (language-specific trending not implemented).
11. **Arc/ArcScore models:** Defined in schema but no UI for arc-level scoring exists.
12. **ReadingChallenge:** No moderation/admin view; users can set any goal.
13. **Report model:** Schema has `Report` table but no submission UI or admin review page.
14. **JournalEntry model:** Exists in schema, no UI implementation found.
15. **`proxy.ts`:** File exists at root with no clear documentation of its purpose.
16. **ContentFilter per user:** `getCurrentContentFilter()` makes a DB call on every request to get user preference — could be cached in JWT/session.
17. **No middleware.ts file found:** Auth protection is done via `authorized` callback in `auth.ts` and `requireSession()` in pages, but there's no `middleware.ts` — the `authorized` callback IS the Next.js middleware equivalent via Auth.js's `auth` export.

### Missing Pages Referenced in Footer/Nav
- `/feed` — in footer as "Activity Feed" but not in header desktop nav
- Genre and Trope index pages (`/genre`, `/trope`) — linked in footer but not in header

### Missing i18n Keys
- Some pages use `t('...')` keys that may not exist in all namespaces. The `faq` namespace uses keys `q1`–`q10` and `a1`–`a10` that are only valid if the messages files contain them.

---

## 14. FULL PAGE INVENTORY TABLE

| Route | File | Purpose | Auth Required | Data Source | Status |
|---|---|---|---|---|---|
| `/{locale}` | `(public)/page.tsx` | Homepage with trending/ranked sections | No | `lib/db/home.ts` | Production |
| `/{locale}/explore` | `(public)/explore/page.tsx` | Browse with genre+trope+filter | No | `lib/db/search.ts`, `genre.ts`, `trope.ts` | Production |
| `/{locale}/search` | `(public)/search/page.tsx` | Search results | No | `lib/db/search.ts` | Production |
| `/{locale}/top` | `(public)/top/page.tsx` | Top 100 ranking table | No | `lib/db/ranking.ts` | Production |
| `/{locale}/library` | `(auth)/library/page.tsx` | Personal reading library | **Yes** | `lib/db/library.ts` | Production |
| `/{locale}/manhwa/{slug}` | `(public)/manhwa/[slug]/layout.tsx` + `page.tsx` | Manhwa detail / overview tab | No (gate for R18) | `lib/db/manhwa.ts` | Production |
| `/{locale}/manhwa/{slug}/reviews` | `reviews/page.tsx` | All reviews tab | No | `lib/db/review.ts` | Production |
| `/{locale}/manhwa/{slug}/staff` | `staff/page.tsx` | Staff/creators tab | No | Via manhwa.ts | Production |
| `/{locale}/manhwa/{slug}/stats` | `stats/page.tsx` | Score stats tab | No | `lib/db/stats.ts` | Production |
| `/{locale}/manhwa/{slug}/characters` | `characters/page.tsx` | Characters tab | No | `lib/db/character.ts` | Partial |
| `/{locale}/manhwa/{slug}/review/{reviewId}` | `review/[reviewId]/page.tsx` | Single review permalink | No | `lib/db/review.ts` | Production |
| `/{locale}/genre` | `(public)/genre/page.tsx` | Genre index | No | `lib/db/genre.ts` | Production |
| `/{locale}/genre/{slug}` | `(public)/genre/[slug]/page.tsx` | Manhwa by genre | No | `lib/db/genre.ts` | Production |
| `/{locale}/trope` | `(public)/trope/page.tsx` | Trope index | No | `lib/db/trope.ts` | Production |
| `/{locale}/trope/{slug}` | `(public)/trope/[slug]/page.tsx` | Manhwa by trope | No | `lib/db/trope.ts` | Production |
| `/{locale}/blog` | `(public)/blog/page.tsx` | Blog index | No | `lib/db/article.ts` | Production |
| `/{locale}/blog/{slug}` | `(public)/blog/[slug]/page.tsx` | Blog article | No | `lib/db/article.ts` | Production |
| `/{locale}/blog/category/{cat}` | `blog/category/[cat]/page.tsx` | Blog by category | No | `lib/db/article.ts` | Production |
| `/{locale}/blog/submit` | `(public)/blog/submit/page.tsx` | Submit article | **Yes** | `lib/actions/article.ts` | Production |
| `/{locale}/blog/my-articles` | `(public)/blog/my-articles/page.tsx` | Own articles list | **Yes** | `lib/db/article.ts` | Production |
| `/{locale}/blog/user/{username}` | `blog/user/[username]/page.tsx` | Articles by user | No | `lib/db/article.ts` | Production |
| `/{locale}/news` | `(public)/news/page.tsx` | News index | No | `lib/db/article.ts` | Production |
| `/{locale}/news/{slug}` | `(public)/news/[slug]/page.tsx` | News article | No | `lib/db/article.ts` | Production |
| `/{locale}/people` | `(public)/people/page.tsx` | Creator directory | No | `lib/db/creator.ts` | Production |
| `/{locale}/people/{slug}` | `(public)/people/[slug]/page.tsx` | Creator detail | No | `lib/db/creator.ts` | Production |
| `/{locale}/character` | `(public)/character/page.tsx` | Character directory | No | `lib/db/character.ts` | Production |
| `/{locale}/character/{slug}` | `(public)/character/[slug]/page.tsx` | Character detail | No | `lib/db/character.ts` | Production |
| `/{locale}/publisher` | `(public)/publisher/page.tsx` | Publisher directory | No | `lib/db/publisher.ts` | Production |
| `/{locale}/publisher/{slug}` | `(public)/publisher/[slug]/page.tsx` | Publisher detail | No | `lib/db/publisher.ts` | Production |
| `/{locale}/members` | `(public)/members/page.tsx` | User directory | No | `lib/db/user.ts` | Production |
| `/{locale}/lists` | `(public)/lists/page.tsx` | Community lists index | No | `lib/db/list.ts` | Production |
| `/{locale}/lists/new` | `(public)/lists/new/page.tsx` | Create new list | **Yes** | `lib/actions/list.ts` | Production |
| `/{locale}/lists/{slug}` | `(public)/lists/[slug]/page.tsx` | List detail | No | `lib/db/list.ts` | Production |
| `/{locale}/lists/{slug}/edit` | `(public)/lists/[slug]/edit/page.tsx` | Edit list | **Yes** (owner) | `lib/actions/list.ts` | Production |
| `/{locale}/artwork` | `(public)/artwork/page.tsx` | Fan art gallery | No | `lib/db/fan-art.ts` | Production |
| `/{locale}/artwork/new` | `(public)/artwork/new/page.tsx` | Submit fan art | **Yes** | `lib/actions/fan-art.ts` | Production |
| `/{locale}/artwork/{postId}` | `(public)/artwork/[postId]/page.tsx` | Fan art post detail | No | `lib/db/fan-art.ts` | Production |
| `/{locale}/challenge/{year}` | `(public)/challenge/[year]/page.tsx` | Reading challenge | Partial (shows CTA) | `lib/db/challenge.ts` | Production |
| `/{locale}/notifications` | `(public)/notifications/page.tsx` | Notification center | **Yes** | `lib/db/notification.ts` | Production |
| `/{locale}/feed` | `(public)/feed/page.tsx` | Activity feed | **Yes** | `lib/db/activity.ts` | Production |
| `/{locale}/profile` | `(public)/profile/page.tsx` | Own profile redirect | **Yes** | `lib/auth/session.ts` | Production |
| `/{locale}/profile/{username}` | `profile/[username]/page.tsx` | Public user profile | No | `lib/db/user.ts`, `library.ts` | Production |
| `/{locale}/profile/{username}/followers` | `profile/[username]/followers/page.tsx` | Follower list | No | `lib/db/follow.ts` | Production |
| `/{locale}/profile/{username}/following` | `profile/[username]/following/page.tsx` | Following list | No | `lib/db/follow.ts` | Production |
| `/{locale}/settings` | `(public)/settings/page.tsx` | Account settings | **Yes** | `lib/db/user.ts` | Production |
| `/{locale}/about` | `(public)/about/page.tsx` | About page | No | i18n messages | Production |
| `/{locale}/faq` | `(public)/faq/page.tsx` | FAQ (10 items) | No | i18n messages | Production |
| `/{locale}/privacy` | `(public)/privacy/page.tsx` | Privacy policy | No | i18n messages | Production (noindex) |
| `/{locale}/terms` | `(public)/terms/page.tsx` | Terms of service | No | i18n messages | Production (noindex) |
| `/{locale}/sign-in` | `(auth)/sign-in/page.tsx` | OAuth sign in | No | Auth.js | Production |
| `/{locale}/sign-up` | `(auth)/sign-up/page.tsx` | Sign up (stub/redirect) | No | Auth.js | Stub/Redirect |
| `/{locale}/admin/blog` | `(public)/admin/blog/page.tsx` | Blog moderation queue | **Admin/Mod** | `lib/db/article.ts` | Production |
| `/{locale}/admin/news` | `(public)/admin/news/page.tsx` | News draft review | **Admin/Mod** | `lib/db/article.ts` | Production |
| `/{locale}/admin/article/{id}/edit` | `admin/article/[id]/edit/page.tsx` | Article editor | **Admin/Mod** | `lib/db/article.ts` | Production |
| `/{locale}/admin/users/{username}` | `admin/users/[username]/page.tsx` | User admin editor | **Admin** | `lib/db/user.ts` | Production |

---

*End of Audit — ManwhaBox / ManhwaVerse codebase as of 2026-03-03*
