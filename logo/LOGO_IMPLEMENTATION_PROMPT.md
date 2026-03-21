# MANHWAVERSE — LOGO & SEO IMPLEMENTATION

## WHAT THIS COVERS
1. Favicon (browser tab icon)
2. Apple touch icon (iOS home screen)
3. Open Graph image (social share card — Discord, Twitter, Reddit)
4. Updated title + description strings
5. Complete metadata in root layout

---

## STEP 1 — CREATE THE FAVICON FILES

### File: `app/icon.svg` (replaces existing `app/icon.png`)

Delete `app/icon.png` if it exists. Create `app/icon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="7" fill="#C8453A"/>
  <text x="16" y="23" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="21" font-weight="700" font-style="italic" fill="#ffffff">M</text>
</svg>
```

Next.js automatically serves `app/icon.svg` as the favicon. No configuration needed.

### File: `app/apple-icon.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
  <rect width="180" height="180" rx="40" fill="#C8453A"/>
  <text x="90" y="130" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="120" font-weight="700" font-style="italic" fill="#ffffff">M</text>
</svg>
```

Next.js automatically uses `app/apple-icon.svg` for Apple touch icon.

---

## STEP 2 — CREATE THE OPEN GRAPH IMAGE

### File: `app/opengraph-image.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <rect width="1200" height="630" fill="#0C0E13"/>
  <rect x="0" y="0" width="6" height="630" fill="#C8453A"/>
  <rect x="72" y="200" width="80" height="80" rx="16" fill="#C8453A"/>
  <text x="112" y="260" text-anchor="middle" font-family="Georgia, serif" font-size="56" font-weight="700" font-style="italic" fill="#ffffff">M</text>
  <text x="172" y="260" font-family="Georgia, serif" font-size="56" font-weight="700" font-style="italic" fill="#ffffff">Manhwa</text>
  <text x="484" y="260" font-family="Georgia, serif" font-size="56" font-weight="700" font-style="italic" fill="#C8453A">Verse</text>
  <text x="72" y="330" font-family="Georgia, serif" font-size="34" font-style="italic" fill="rgba(255,255,255,0.9)">Track every manhwa you&#x27;ve ever loved.</text>
  <text x="72" y="390" font-family="-apple-system, sans-serif" font-size="18" fill="rgba(255,255,255,0.35)">4,000+ titles  ·  Reviews  ·  Rankings  ·  Community Lists</text>
  <rect x="0" y="614" width="1200" height="16" fill="#C8453A" opacity="0.8"/>
</svg>
```

**Also create the same file for Twitter:**

### File: `app/twitter-image.svg`

Exact same content as `app/opengraph-image.svg` above.

---

## STEP 3 — UPDATE SEO STRINGS

### File: `messages/en.json` — update the `seo` namespace:

```json
"seo": {
  "siteName": "ManhwaVerse",
  "defaultTitle": "ManhwaVerse - Track every manhwa you've ever loved",
  "defaultDescription": "Rate, review and discover manhwa & manhua. Join thousands of readers tracking 4,000+ titles. Find your next obsession.",
  "ogTitle": "ManhwaVerse - Track every manhwa you've ever loved",
  "ogDescription": "Rate, review and discover manhwa & manhua. Join thousands of readers tracking 4,000+ titles."
}
```

### File: `messages/fr.json` — update the `seo` namespace:

```json
"seo": {
  "siteName": "ManhwaVerse",
  "defaultTitle": "ManhwaVerse - Suivez tous les manhwas que vous avez aimés",
  "defaultDescription": "Notez, critiques et découvrez manhwa et manhua. Rejoignez des milliers de lecteurs sur 4 000+ titres. Trouvez votre prochaine obsession.",
  "ogTitle": "ManhwaVerse - Suivez tous les manhwas que vous avez aimés",
  "ogDescription": "Notez, critiques et découvrez manhwa et manhua. Rejoignez des milliers de lecteurs sur 4 000+ titres."
}
```

---

## STEP 4 — COMPLETE METADATA IN LOCALE LAYOUT

### File: `app/[locale]/layout.tsx` — replace `generateMetadata`:

```typescript
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://manhwaverse.com'

  return {
    title: {
      default: t('defaultTitle'),
      template: `%s | ManhwaVerse`,
    },
    description: t('defaultDescription'),
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        fr: '/fr',
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'ManhwaVerse',
      title: t('defaultTitle'),
      description: t('ogDescription'),
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      url: `${baseUrl}/${locale}`,
      images: [
        {
          url: '/opengraph-image.svg',
          width: 1200,
          height: 630,
          alt: 'ManhwaVerse - Track every manhwa you\'ve ever loved',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('defaultTitle'),
      description: t('ogDescription'),
      images: ['/twitter-image.svg'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
      },
    },
  }
}
```

---

## STEP 5 — ROOT LAYOUT: ADD THEME COLOR + MANIFEST METADATA

### File: `app/layout.tsx` — add metadata export above the component:

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg',
  },
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0C0E13' },
    { media: '(prefers-color-scheme: light)', color: '#F7F5F0' },
  ],
}
```

---

## STEP 6 — CREATE THE WEB APP MANIFEST

### File: `public/manifest.json`

```json
{
  "name": "ManhwaVerse",
  "short_name": "ManhwaVerse",
  "description": "Track every manhwa you've ever loved",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0C0E13",
  "theme_color": "#C8453A",
  "icons": [
    {
      "src": "/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
```

---

## STEP 7 — VERIFY

After deploying, check:

```bash
# Check favicon appears in browser tab
# Open: https://manhwaverse.vercel.app/en

# Check OG card renders correctly
# Paste URL into: https://www.opengraph.xyz
# Should show: dark card, ManhwaVerse wordmark, tagline

# Check Google will read the right title
# Paste URL into: https://search.google.com/test/rich-results

# Check Apple touch icon
# On iPhone: add site to home screen — should show red M icon
```

---

## FILE SUMMARY

```
app/icon.svg                ← favicon (browser tab) — CREATE
app/apple-icon.svg          ← iOS home screen icon — CREATE
app/opengraph-image.svg     ← social share card — CREATE
app/twitter-image.svg       ← Twitter/X card — CREATE (same as OG)
app/layout.tsx              ← add metadata export — MODIFY
app/[locale]/layout.tsx     ← replace generateMetadata — MODIFY
messages/en.json            ← update seo namespace — MODIFY
messages/fr.json            ← update seo namespace — MODIFY
public/manifest.json        ← web app manifest — CREATE
app/icon.png                ← DELETE (replaced by icon.svg)
```

---

*LOGO_IMPLEMENTATION_PROMPT.md — ManhwaVerse · March 2026*
