/**
 * Seed affiliate store products — manual catalog (no Amazon API yet)
 *
 * Usage:
 *   npx tsx lib/ingestion/seed-products.ts
 *
 * IMPORTANT: Replace placeholder ASINs (B0XXXXXXXX / TODO_ASIN) with real ones
 * before deploying. Use amazon.com/dp/<ASIN> to verify a link works.
 *
 * Affiliate tag format:
 *   EN: ?tag=manhwaverse-20
 *   FR: ?tag=manhwaverfr-21
 */

import { prisma } from '@/lib/db/client'

type ProductSeed = {
  manhwaSlug: string
  type: 'PHYSICAL_MANGA' | 'BOX_SET' | 'LIGHT_NOVEL' | 'ARTBOOK' | 'FIGURINE' | 'POSTER' | 'GOODS'
  title_en: string
  title_fr?: string
  cover_url?: string
  language: string
  asin?: string
  isbn?: string
  price_amount?: number
  price_currency?: string
  is_featured?: boolean
  position?: number
  links: { marketplace_id: string; url: string; price_amount?: number; price_currency?: string }[]
}

// ---------------------------------------------------------------------------
// PRODUCT CATALOG
// Replace TODO_ASIN placeholders with real Amazon ASINs before launch.
// Use amazon.com/dp/<ASIN> to verify. Tag: manhwaverse-20 (US) / manhwaverfr-21 (FR)
// ---------------------------------------------------------------------------
const PRODUCTS: ProductSeed[] = [
  // ── SOLO LEVELING ────────────────────────────────────────────────────────
  {
    manhwaSlug: 'solo-leveling',
    type: 'PHYSICAL_MANGA',
    title_en: 'Solo Leveling, Vol. 1',
    title_fr: 'Solo Leveling, Tome 1',
    language: 'en',
    asin: '1975319788',
    isbn: '9781975319786',
    price_amount: 20.00,
    price_currency: 'USD',
    is_featured: true,
    position: 1,
    links: [
      { marketplace_id: 'amazon_us', url: 'https://www.amazon.com/dp/1975319788?tag=manhwaverse-20', price_amount: 20.00, price_currency: 'USD' },
      { marketplace_id: 'amazon_fr', url: 'https://www.amazon.fr/dp/1975319788?tag=manhwaverfr-21', price_amount: 19.90, price_currency: 'EUR' },
    ],
  },
  {
    manhwaSlug: 'solo-leveling',
    type: 'PHYSICAL_MANGA',
    title_en: 'Solo Leveling, Vol. 2',
    title_fr: 'Solo Leveling, Tome 2',
    language: 'en',
    asin: '1975320581',
    isbn: '9781975320584',
    price_amount: 20.00,
    price_currency: 'USD',
    is_featured: false,
    position: 2,
    links: [
      { marketplace_id: 'amazon_us', url: 'https://www.amazon.com/dp/1975320581?tag=manhwaverse-20', price_amount: 20.00, price_currency: 'USD' },
      { marketplace_id: 'amazon_fr', url: 'https://www.amazon.fr/dp/1975320581?tag=manhwaverfr-21', price_amount: 19.90, price_currency: 'EUR' },
    ],
  },
  {
    manhwaSlug: 'solo-leveling',
    type: 'BOX_SET',
    title_en: 'Solo Leveling Box Set (Vol. 1–8)',
    title_fr: 'Solo Leveling Coffret (Tome 1–8)',
    language: 'en',
    asin: 'TODO_ASIN_SL_BOX_SET',
    price_amount: 140.00,
    price_currency: 'USD',
    is_featured: true,
    position: 0,
    links: [
      { marketplace_id: 'amazon_us', url: 'https://www.amazon.com/dp/TODO_ASIN_SL_BOX_SET?tag=manhwaverse-20', price_amount: 140.00, price_currency: 'USD' },
    ],
  },

  // ── OMNISCIENT READER ─────────────────────────────────────────────────────
  {
    manhwaSlug: 'omniscient-reader',
    type: 'PHYSICAL_MANGA',
    title_en: "Omniscient Reader's Viewpoint, Vol. 1",
    title_fr: 'Omniscient Reader, Tome 1',
    language: 'en',
    asin: 'TODO_ASIN_ORV_V1',
    price_amount: 20.00,
    price_currency: 'USD',
    is_featured: true,
    position: 1,
    links: [
      { marketplace_id: 'amazon_us', url: 'https://www.amazon.com/dp/TODO_ASIN_ORV_V1?tag=manhwaverse-20', price_amount: 20.00, price_currency: 'USD' },
    ],
  },

  // ── TOWER OF GOD ─────────────────────────────────────────────────────────
  {
    manhwaSlug: 'tower-of-god',
    type: 'PHYSICAL_MANGA',
    title_en: 'Tower of God, Vol. 1',
    title_fr: 'Tower of God, Tome 1',
    language: 'en',
    asin: 'TODO_ASIN_TOG_V1',
    price_amount: 19.99,
    price_currency: 'USD',
    is_featured: true,
    position: 1,
    links: [
      { marketplace_id: 'amazon_us', url: 'https://www.amazon.com/dp/TODO_ASIN_TOG_V1?tag=manhwaverse-20', price_amount: 19.99, price_currency: 'USD' },
    ],
  },
  {
    manhwaSlug: 'tower-of-god',
    type: 'PHYSICAL_MANGA',
    title_en: 'Tower of God, Vol. 2',
    title_fr: 'Tower of God, Tome 2',
    language: 'en',
    asin: 'TODO_ASIN_TOG_V2',
    price_amount: 19.99,
    price_currency: 'USD',
    position: 2,
    links: [
      { marketplace_id: 'amazon_us', url: 'https://www.amazon.com/dp/TODO_ASIN_TOG_V2?tag=manhwaverse-20', price_amount: 19.99, price_currency: 'USD' },
    ],
  },

  // ── SWEET HOME ───────────────────────────────────────────────────────────
  {
    manhwaSlug: 'sweet-home',
    type: 'PHYSICAL_MANGA',
    title_en: 'Sweet Home, Vol. 1',
    title_fr: 'Sweet Home, Tome 1',
    language: 'en',
    asin: '1990778984',
    isbn: '9781990778988',
    price_amount: 18.99,
    price_currency: 'USD',
    is_featured: true,
    position: 1,
    links: [
      { marketplace_id: 'amazon_us', url: 'https://www.amazon.com/dp/1990778984?tag=manhwaverse-20', price_amount: 18.99, price_currency: 'USD' },
      { marketplace_id: 'amazon_fr', url: 'https://www.amazon.fr/dp/1990778984?tag=manhwaverfr-21', price_amount: 17.90, price_currency: 'EUR' },
    ],
  },
  {
    manhwaSlug: 'sweet-home',
    type: 'PHYSICAL_MANGA',
    title_en: 'Sweet Home, Vol. 2',
    title_fr: 'Sweet Home, Tome 2',
    language: 'en',
    asin: 'TODO_ASIN_SH_V2',
    price_amount: 18.99,
    price_currency: 'USD',
    position: 2,
    links: [
      { marketplace_id: 'amazon_us', url: 'https://www.amazon.com/dp/TODO_ASIN_SH_V2?tag=manhwaverse-20', price_amount: 18.99, price_currency: 'USD' },
    ],
  },

  // ── LOOKISM ──────────────────────────────────────────────────────────────
  {
    manhwaSlug: 'lookism',
    type: 'PHYSICAL_MANGA',
    title_en: 'Lookism, Vol. 1',
    title_fr: 'Lookism, Tome 1',
    language: 'en',
    asin: 'TODO_ASIN_LOOK_V1',
    price_amount: 14.99,
    price_currency: 'USD',
    is_featured: false,
    position: 1,
    links: [
      { marketplace_id: 'amazon_us', url: 'https://www.amazon.com/dp/TODO_ASIN_LOOK_V1?tag=manhwaverse-20', price_amount: 14.99, price_currency: 'USD' },
    ],
  },

  // ── NOBLESSE ─────────────────────────────────────────────────────────────
  {
    manhwaSlug: 'noblesse',
    type: 'PHYSICAL_MANGA',
    title_en: 'Noblesse, Vol. 1',
    title_fr: 'Noblesse, Tome 1',
    language: 'en',
    asin: 'TODO_ASIN_NOB_V1',
    price_amount: 16.99,
    price_currency: 'USD',
    position: 1,
    links: [
      { marketplace_id: 'amazon_us', url: 'https://www.amazon.com/dp/TODO_ASIN_NOB_V1?tag=manhwaverse-20', price_amount: 16.99, price_currency: 'USD' },
    ],
  },

  // ── KILLING STALKING ─────────────────────────────────────────────────────
  {
    manhwaSlug: 'killing-stalking',
    type: 'PHYSICAL_MANGA',
    title_en: 'Killing Stalking, Season 1 Vol. 1',
    title_fr: 'Killing Stalking, Saison 1 Tome 1',
    language: 'en',
    asin: 'B09TBTDL1K',
    price_amount: 19.95,
    price_currency: 'USD',
    is_featured: false,
    position: 1,
    links: [
      { marketplace_id: 'amazon_us', url: 'https://www.amazon.com/dp/B09TBTDL1K?tag=manhwaverse-20', price_amount: 19.95, price_currency: 'USD' },
    ],
  },

  // ── ELECEED ──────────────────────────────────────────────────────────────
  {
    manhwaSlug: 'eleceed',
    type: 'PHYSICAL_MANGA',
    title_en: 'Eleceed, Vol. 1',
    title_fr: 'Eleceed, Tome 1',
    language: 'en',
    asin: 'TODO_ASIN_ELC_V1',
    price_amount: 16.99,
    price_currency: 'USD',
    position: 1,
    links: [
      { marketplace_id: 'amazon_us', url: 'https://www.amazon.com/dp/TODO_ASIN_ELC_V1?tag=manhwaverse-20', price_amount: 16.99, price_currency: 'USD' },
    ],
  },

  // ── NANO MACHINE ─────────────────────────────────────────────────────────
  {
    manhwaSlug: 'nano-machine',
    type: 'PHYSICAL_MANGA',
    title_en: 'Nano Machine, Vol. 1',
    title_fr: 'Nano Machine, Tome 1',
    language: 'en',
    asin: 'TODO_ASIN_NM_V1',
    price_amount: 17.99,
    price_currency: 'USD',
    position: 1,
    links: [
      { marketplace_id: 'amazon_us', url: 'https://www.amazon.com/dp/TODO_ASIN_NM_V1?tag=manhwaverse-20', price_amount: 17.99, price_currency: 'USD' },
    ],
  },

  // ── WIND BREAKER ─────────────────────────────────────────────────────────
  {
    manhwaSlug: 'wind-breaker',
    type: 'PHYSICAL_MANGA',
    title_en: 'Wind Breaker, Vol. 1',
    title_fr: 'Wind Breaker, Tome 1',
    language: 'en',
    asin: 'TODO_ASIN_WB_V1',
    price_amount: 16.99,
    price_currency: 'USD',
    position: 1,
    links: [
      { marketplace_id: 'amazon_us', url: 'https://www.amazon.com/dp/TODO_ASIN_WB_V1?tag=manhwaverse-20', price_amount: 16.99, price_currency: 'USD' },
    ],
  },

  // ── THE GOD OF HIGH SCHOOL ───────────────────────────────────────────────
  {
    manhwaSlug: 'the-god-of-high-school',
    type: 'PHYSICAL_MANGA',
    title_en: 'The God of High School, Vol. 1',
    title_fr: 'God of High School, Tome 1',
    language: 'en',
    asin: 'TODO_ASIN_GOHS_V1',
    price_amount: 14.99,
    price_currency: 'USD',
    position: 1,
    links: [
      { marketplace_id: 'amazon_us', url: 'https://www.amazon.com/dp/TODO_ASIN_GOHS_V1?tag=manhwaverse-20', price_amount: 14.99, price_currency: 'USD' },
    ],
  },

  // ── OVERGEARED ───────────────────────────────────────────────────────────
  {
    manhwaSlug: 'overgeared',
    type: 'PHYSICAL_MANGA',
    title_en: 'Overgeared, Vol. 1',
    title_fr: 'Overgeared, Tome 1',
    language: 'en',
    asin: 'TODO_ASIN_OG_V1',
    price_amount: 17.99,
    price_currency: 'USD',
    position: 1,
    links: [
      { marketplace_id: 'amazon_us', url: 'https://www.amazon.com/dp/TODO_ASIN_OG_V1?tag=manhwaverse-20', price_amount: 17.99, price_currency: 'USD' },
    ],
  },
]

// ---------------------------------------------------------------------------

async function main() {
  console.log(`🛒 Seeding ${PRODUCTS.length} products...`)

  // Pre-fetch all manhwa IDs
  const slugs = [...new Set(PRODUCTS.map((p) => p.manhwaSlug))]
  const manhwas = await prisma.manhwa.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true, cover_url: true },
  })
  const manhwaMap = new Map(manhwas.map((m) => [m.slug, m]))

  let created = 0
  let skipped = 0

  for (const [i, product] of PRODUCTS.entries()) {
    const manhwa = manhwaMap.get(product.manhwaSlug)
    if (!manhwa) {
      console.warn(`  ⚠ Manhwa not found: ${product.manhwaSlug} — skipping`)
      skipped++
      continue
    }

    const id = `prod_${product.manhwaSlug}_${product.type}_${i}`

    await prisma.manhwaProduct.upsert({
      where: { id },
      create: {
        id,
        manhwa_id: manhwa.id,
        type: product.type,
        title_en: product.title_en,
        title_fr: product.title_fr ?? null,
        cover_url: product.cover_url ?? manhwa.cover_url,
        language: product.language,
        asin: product.asin ?? null,
        isbn: product.isbn ?? null,
        price_amount: product.price_amount ?? null,
        price_currency: product.price_currency ?? null,
        price_updated_at: product.price_amount ? new Date() : null,
        is_featured: product.is_featured ?? false,
        position: product.position ?? 99,
        links: {
          create: product.links.map((l, li) => ({
            id: `link_${id}_${li}`,
            marketplace_id: l.marketplace_id,
            url: l.url,
            price_amount: l.price_amount ?? null,
            price_currency: l.price_currency ?? null,
            price_updated_at: l.price_amount ? new Date() : null,
            is_available: true,
          })),
        },
      },
      update: {
        title_en: product.title_en,
        title_fr: product.title_fr ?? null,
        is_featured: product.is_featured ?? false,
        position: product.position ?? 99,
        price_amount: product.price_amount ?? null,
        price_currency: product.price_currency ?? null,
      },
    })

    console.log(`  ✓ ${product.manhwaSlug} — ${product.title_en}`)
    created++
  }

  console.log(`\n✅ Done: ${created} products seeded, ${skipped} skipped`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
