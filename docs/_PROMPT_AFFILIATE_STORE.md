# 🛒 STORE AFFILIÉ — Liens Amazon sur les fiches + Page store dédiée
> Branch : `feat/affiliate-store`

---

## ⚠️ PREMIÈRE ACTION

```bash
git checkout main
git pull origin main
git checkout -b feat/affiliate-store
```

---

## CONTEXTE

ManhwaVerse monétise via l'affiliation. Quand un utilisateur clique sur un lien Amazon depuis notre site et achète un produit, on touche une commission (~5-8%). Deux features :

1. **Sur chaque fiche manhwa** : liens Amazon pour acheter l'édition physique dans la section "Lire ce manhwa"
2. **Page store dédiée `/store`** : catalogue de produits liés aux manhwa (éditions physiques, light novels, figurines, goodies)

---

## PARTIE 1 — Liens Amazon sur les fiches manhwa

### 1.1 — DB : Stocker les produits et liens multi-marketplace

```prisma
model ManhwaProduct {
  id            String    @id @default(cuid())
  manhwa_id     String
  manhwa        Manhwa    @relation(fields: [manhwa_id], references: [id])
  
  type          ProductType
  
  title_en      String            // "Solo Leveling Vol. 1"
  title_fr      String?           // "Solo Leveling Tome 1"
  
  cover_url     String?           // Image du produit
  language      String?           // "fr", "en", "kr", "jp"
  
  // Prix
  price_amount  Float?            // 9.99 (Phase 1 : indicatif fixe)
  price_currency String?          // "EUR", "USD"
  price_updated_at DateTime?      // Quand le prix a été mis à jour pour la dernière fois
  
  // Metadata produit (pour enrichissement API futur)
  asin          String?           // Amazon ASIN pour l'API Product Advertising
  isbn          String?           // ISBN pour les livres
  ean           String?           // EAN/barcode
  
  is_featured   Boolean   @default(false)
  position      Int       @default(0)
  
  // Relations
  links         ProductLink[]
  wishlists     ProductWishlist[]
  
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  
  @@index([manhwa_id, type])
  @@index([type, is_featured])
  @@index([asin])
}

// Liens vers les marketplaces (un produit peut être sur Amazon FR, US, Fnac, CDJapan...)
model ProductLink {
  id              String    @id @default(cuid())
  product_id      String
  product         ManhwaProduct @relation(fields: [product_id], references: [id], onDelete: Cascade)
  
  marketplace_id  String    // "amazon_fr", "amazon_us", "fnac", "cdj", "amiami", "crunchyroll"
  url             String    // URL complète vers le produit
  
  // Prix spécifique à ce marketplace (peut différer entre Amazon FR et US)
  price_amount    Float?
  price_currency  String?
  price_updated_at DateTime?
  
  is_available    Boolean   @default(true)  // Le produit est-il en stock ?
  
  @@unique([product_id, marketplace_id])
  @@index([marketplace_id])
}

// Wishlist produit par utilisateur
model ProductWishlist {
  user_id     String
  user        User          @relation(fields: [user_id], references: [id])
  product_id  String
  product     ManhwaProduct @relation(fields: [product_id], references: [id], onDelete: Cascade)
  created_at  DateTime      @default(now())

  @@id([user_id, product_id])
  @@index([user_id, created_at(sort: Desc)])
}

enum ProductType {
  PHYSICAL_MANGA     // Édition physique (tomes reliés)
  BOX_SET            // Coffret complet
  LIGHT_NOVEL        // Light novel source
  FIGURINE           // Figurines
  ARTBOOK            // Artbooks
  POSTER             // Posters
  GOODS              // Autres goodies (porte-clés, t-shirts...)
}
```

### 1.2 — Config multi-marketplace (Amazon + Fnac + CDJapan + AmiAmi + Crunchyroll Store)

```typescript
// /lib/config/affiliate.ts

// ═══════════════════════════════════════════════════════════
// MARKETPLACES SUPPORTÉES
// ═══════════════════════════════════════════════════════════

export interface MarketplaceConfig {
  id: string
  name: string
  logo: string           // Chemin vers le logo ou emoji
  color: string          // Couleur du bouton
  affiliateTag: string   // Tag affilié
  affiliateParam: string // Nom du paramètre URL pour le tag
  baseUrl: string
  flag: string
  region: 'fr' | 'us' | 'uk' | 'de' | 'jp' | 'global'
  category: 'books' | 'merch' | 'all'  // Ce que vend ce marketplace
}

export const MARKETPLACES: Record<string, MarketplaceConfig> = {
  // ─── Amazon ───
  amazon_fr: {
    id: 'amazon_fr',
    name: 'Amazon FR',
    logo: '/logos/amazon.svg',
    color: '#FF9900',
    affiliateTag: 'manhwaverse-21',     // ← REMPLACER par ton vrai tag
    affiliateParam: 'tag',
    baseUrl: 'https://www.amazon.fr',
    flag: '🇫🇷',
    region: 'fr',
    category: 'all',
  },
  amazon_us: {
    id: 'amazon_us',
    name: 'Amazon US',
    logo: '/logos/amazon.svg',
    color: '#FF9900',
    affiliateTag: 'manhwaverse-20',     // ← REMPLACER par ton vrai tag
    affiliateParam: 'tag',
    baseUrl: 'https://www.amazon.com',
    flag: '🇺🇸',
    region: 'us',
    category: 'all',
  },
  amazon_uk: {
    id: 'amazon_uk',
    name: 'Amazon UK',
    logo: '/logos/amazon.svg',
    color: '#FF9900',
    affiliateTag: 'manhwaverse-21',     // ← REMPLACER
    affiliateParam: 'tag',
    baseUrl: 'https://www.amazon.co.uk',
    flag: '🇬🇧',
    region: 'uk',
    category: 'all',
  },
  amazon_de: {
    id: 'amazon_de',
    name: 'Amazon DE',
    logo: '/logos/amazon.svg',
    color: '#FF9900',
    affiliateTag: 'manhwaverse-21',     // ← REMPLACER
    affiliateParam: 'tag',
    baseUrl: 'https://www.amazon.de',
    flag: '🇩🇪',
    region: 'de',
    category: 'all',
  },
  // ─── Fnac (programme Awin) ───
  fnac: {
    id: 'fnac',
    name: 'Fnac',
    logo: '/logos/fnac.svg',
    color: '#E1A400',
    affiliateTag: '',                    // ← Tag Awin à ajouter
    affiliateParam: 'awc',
    baseUrl: 'https://www.fnac.com',
    flag: '🇫🇷',
    region: 'fr',
    category: 'books',
  },
  // ─── CDJapan (imports JP) ───
  cdj: {
    id: 'cdj',
    name: 'CDJapan',
    logo: '/logos/cdjapan.svg',
    color: '#E60012',
    affiliateTag: '',                    // ← Tag CDJ à ajouter
    affiliateParam: 'aff',
    baseUrl: 'https://www.cdjapan.co.jp',
    flag: '🇯🇵',
    region: 'jp',
    category: 'all',
  },
  // ─── AmiAmi (figurines JP) ───
  amiami: {
    id: 'amiami',
    name: 'AmiAmi',
    logo: '/logos/amiami.svg',
    color: '#00A0E9',
    affiliateTag: '',
    affiliateParam: '',
    baseUrl: 'https://www.amiami.com',
    flag: '🇯🇵',
    region: 'jp',
    category: 'merch',
  },
  // ─── Crunchyroll Store ───
  crunchyroll: {
    id: 'crunchyroll',
    name: 'Crunchyroll Store',
    logo: '/logos/crunchyroll.svg',
    color: '#F47521',
    affiliateTag: '',
    affiliateParam: '',
    baseUrl: 'https://store.crunchyroll.com',
    flag: '🌐',
    region: 'global',
    category: 'merch',
  },
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

export function buildAffiliateLink(baseUrl: string, marketplace: MarketplaceConfig): string {
  if (!marketplace.affiliateTag || !marketplace.affiliateParam) return baseUrl
  const url = new URL(baseUrl)
  url.searchParams.set(marketplace.affiliateParam, marketplace.affiliateTag)
  return url.toString()
}

// Trier les liens par locale de l'utilisateur
export function sortLinksByLocale(
  links: Array<{ marketplaceId: string; url: string }>,
  locale: string
): Array<{ marketplaceId: string; url: string; marketplace: MarketplaceConfig }> {
  const priorityMap: Record<string, Record<string, number>> = {
    fr: { fr: 0, global: 1, us: 2, uk: 3, de: 4, jp: 5 },
    en: { us: 0, uk: 1, global: 2, fr: 3, de: 4, jp: 5 },
  }
  const priorities = priorityMap[locale] || priorityMap['en']
  
  return links
    .map(link => ({
      ...link,
      marketplace: MARKETPLACES[link.marketplaceId],
    }))
    .filter(link => link.marketplace) // Filtrer les marketplaces inconnues
    .sort((a, b) => {
      const pA = priorities[a.marketplace.region] ?? 99
      const pB = priorities[b.marketplace.region] ?? 99
      return pA - pB
    })
}
```

### 1.3 — Affichage dans la section "Lire ce manhwa" (sidebar de la fiche)

La section "Lire ce manhwa" existe déjà dans la sidebar droite. On y AJOUTE une sous-section "Édition physique" en dessous des liens de lecture en ligne :

```
📖 Lire ce manhwa
─────────────────────────
🇫🇷 Français
  [Delitoon]  [Webtoon FR]

🇬🇧 English  
  [Tapas]  [Webtoon EN]

📦 Édition physique                       ← NOUVEAU
─────────────────────────
  ┌──────────────────────────────────┐
  │ 🇫🇷 Solo Leveling Tome 1        │
  │    ~9€ · [Acheter sur Amazon →]  │
  ├──────────────────────────────────┤
  │ 🇺🇸 Solo Leveling Vol. 1        │
  │    ~$12 · [Buy on Amazon →]     │
  ├──────────────────────────────────┤
  │ 📦 Coffret Solo Leveling 1-5    │
  │    ~42€ · [Acheter sur Amazon →] │
  └──────────────────────────────────┘
  
  Voir tous les produits →              ← lien vers /store?manhwa=solo-leveling
```

### Composant

```tsx
// /components/features/manhwa/PhysicalEditions.tsx

interface Props {
  manhwaId: string
  manhwaSlug: string
  products: Array<{
    id: string
    type: string
    title: string
    amazon_fr_url: string | null
    amazon_us_url: string | null
    amazon_uk_url: string | null
    amazon_de_url: string | null
    cdj_url: string | null
    other_url: string | null
    other_label: string | null
    cover_url: string | null
    price_hint: string | null
    language: string | null
  }>
}

export function PhysicalEditions({ manhwaId, manhwaSlug, products }: Props) {
  const t = useTranslations('store')
  const locale = useLocale()
  
  if (products.length === 0) return null
  
  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
        📦 {t('physicalEdition')}
      </h4>
      
      <div className="space-y-2">
        {products.slice(0, 3).map(product => {
          const amazonLinks = getAmazonLinksByLocale(product, locale)
          const primaryLink = amazonLinks[0]
          
          if (!primaryLink) return null
          
          return (
            <a
              key={product.id}
              href={primaryLink.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              onClick={() => trackAffiliateClick(manhwaId, product.id, 'amazon')}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition group"
            >
              {/* Cover produit (mini) */}
              {product.cover_url && (
                <img 
                  src={product.cover_url} 
                  alt={product.title}
                  className="w-10 h-14 rounded object-cover shrink-0"
                />
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{product.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {product.price_hint && (
                    <span className="text-[10px] text-gray-400">{product.price_hint}</span>
                  )}
                  <span className="text-[10px] text-blue-400 group-hover:text-blue-300">
                    {primaryLink.flag} {t('buyOn')} {primaryLink.label} →
                  </span>
                </div>
              </div>
              
              {/* Icône lien externe */}
              <ExternalLink className="w-3.5 h-3.5 text-gray-600 shrink-0" />
            </a>
          )
        })}
      </div>
      
      {/* Lien vers le store si plus de 3 produits */}
      {products.length > 3 && (
        <Link 
          href={`/store?manhwa=${manhwaSlug}`}
          className="block text-center text-xs text-blue-400 hover:text-blue-300 mt-2"
        >
          {t('seeAllProducts', { count: products.length })} →
        </Link>
      )}
    </div>
  )
}
```

### 1.4 — Tracking des clics affiliés

Créer une table pour tracker les clics (important pour mesurer les revenus) :

```prisma
model AffiliateClick {
  id          String    @id @default(cuid())
  user_id     String?   // null si visiteur non connecté
  manhwa_id   String
  product_id  String?   // null si clic sur un lien non-produit (ex: lien Webtoon)
  platform    String    // "amazon_fr", "amazon_us", "cdj", "webtoon", "tapas"...
  url         String    // URL complète cliquée
  created_at  DateTime  @default(now())
  
  @@index([manhwa_id, platform])
  @@index([created_at(sort: Desc)])
}
```

```typescript
// /lib/actions/affiliate.ts
'use server'

export async function trackAffiliateClick(
  manhwaId: string, 
  productId: string | null, 
  platform: string
) {
  const session = await getServerSession()
  
  await prisma.affiliateClick.create({
    data: {
      user_id: session?.user?.id ?? null,
      manhwa_id: manhwaId,
      product_id: productId,
      platform,
      url: '', // Le client peut passer l'URL ou non
    },
  })
}
```

Côté client, appeler le tracking au clic AVANT la navigation :

```typescript
// Dans le composant, au clic sur un lien affilié :
onClick={() => {
  // Fire and forget — ne pas bloquer la navigation
  trackAffiliateClick(manhwaId, product.id, 'amazon').catch(() => {})
}}
```

### 1.5 — IMPORTANT : attributs SEO et légaux sur les liens affiliés

Tous les liens affiliés doivent avoir :
- `rel="noopener noreferrer nofollow sponsored"` — Google exige `nofollow` ou `sponsored` sur les liens d'affiliation
- `target="_blank"` — ouvrir dans un nouvel onglet (ne pas perdre le visiteur)

```tsx
<a
  href={affiliateUrl}
  target="_blank"
  rel="noopener noreferrer nofollow sponsored"
>
```

Ajouter aussi une mention légale dans le footer ou sur la page store :
```
"ManhwaVerse participe au Programme Partenaires d'Amazon, un programme d'affiliation conçu pour permettre à des sites de percevoir une rémunération grâce à la création de liens vers Amazon."
```

---

## PARTIE 2 — Page store dédiée `/store`

### 2.1 — Routes

```
/store                    → Page principale du store (tous les produits)
/store?category=figurine  → Filtré par catégorie
/store?manhwa=solo-leveling → Filtré par manhwa
```

Pas de sous-routes complexes — une seule page avec des filtres en query params.

### 2.2 — Layout de la page store

```
┌──────────────────────────────────────────────────────────────────┐
│  🛒 ManhwaVerse Store                                            │
│  Soutenez ManhwaVerse en achetant via nos liens partenaires      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Filtres : [Tous] [Manhwa physiques] [Light Novels]              │
│            [Figurines] [Artbooks] [Goodies]                      │
│                                                                  │
│  Recherche : [🔍 Rechercher un produit...]                       │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⭐ MIS EN AVANT                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │[Cover]  │ │[Cover]  │ │[Cover]  │ │[Cover]  │              │
│  │Solo     │ │Tower of │ │Omnisci. │ │Solo     │              │
│  │Leveling │ │God T.1  │ │Reader   │ │Leveling │              │
│  │Box Set  │ │         │ │T.1      │ │Figurine │              │
│  │~42€     │ │~9€      │ │~11€     │ │~35€     │              │
│  │[Amazon] │ │[Amazon] │ │[Amazon] │ │[Amazon] │              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│                                                                  │
│  📚 MANHWA PHYSIQUES                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │ ...     │ │ ...     │ │ ...     │ │ ...     │              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│                                                                  │
│  🗡️ FIGURINES & GOODIES                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │ ...     │ │ ...     │ │ ...     │ │ ...     │              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 2.3 — Composant carte produit

```tsx
// /components/features/store/ProductCard.tsx

interface Props {
  product: {
    id: string
    type: ProductType
    title: string
    cover_url: string | null
    price_hint: string | null
    language: string | null
    amazon_fr_url: string | null
    amazon_us_url: string | null
    manhwa: {
      slug: string
      title_en: string
      cover_url: string | null
    }
  }
}

export function ProductCard({ product }: Props) {
  const locale = useLocale()
  const t = useTranslations('store')
  const links = getAmazonLinksByLocale(product, locale)
  const primaryLink = links[0]
  
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden hover:border-white/20 transition group">
      {/* Image produit */}
      <div className="relative aspect-[3/4] bg-white/5">
        <img
          src={product.cover_url || product.manhwa.cover_url || '/placeholder-cover.jpg'}
          alt={product.title}
          className="w-full h-full object-cover"
        />
        
        {/* Badge type */}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/70 backdrop-blur-sm">
          {t(`type.${product.type}`)}
        </span>
        
        {/* Badge langue */}
        {product.language && (
          <span className="absolute top-2 right-2 text-sm">
            {product.language === 'fr' ? '🇫🇷' : product.language === 'en' ? '🇬🇧' : '🇰🇷'}
          </span>
        )}
      </div>
      
      {/* Infos */}
      <div className="p-3">
        {/* Lien vers la fiche manhwa */}
        <Link 
          href={`/manhwa/${product.manhwa.slug}`}
          className="text-[10px] text-blue-400 hover:text-blue-300"
        >
          {product.manhwa.title_en}
        </Link>
        
        <h3 className="text-sm font-medium mt-0.5 line-clamp-2">{product.title}</h3>
        
        {product.price_hint && (
          <p className="text-xs text-gray-400 mt-1">{product.price_hint}</p>
        )}
        
        {/* Boutons d'achat */}
        <div className="flex flex-col gap-1.5 mt-3">
          {links.slice(0, 2).map(link => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              onClick={() => trackAffiliateClick(product.manhwa.slug, product.id, link.label)}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF9900]/10 hover:bg-[#FF9900]/20 text-[#FF9900] text-xs font-medium transition"
            >
              {link.flag} {t('buyOn')} {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### 2.4 — Page store

```tsx
// /app/[locale]/store/page.tsx

import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const isEn = params.locale === 'en'
  return {
    title: isEn ? 'ManhwaVerse Store — Buy Manhwa, Figurines & More' : 'ManhwaVerse Store — Acheter Manhwa, Figurines & Plus',
    description: isEn 
      ? 'Buy physical manhwa editions, light novels, figurines and goodies. Support ManhwaVerse through our affiliate links.'
      : 'Acheter des éditions physiques de manhwa, light novels, figurines et goodies. Soutenez ManhwaVerse via nos liens partenaires.',
  }
}

export default async function StorePage({ searchParams }: { searchParams: { category?: string; manhwa?: string; q?: string } }) {
  const t = useTranslations('store')
  
  // Construire le filtre Prisma
  const where: any = {}
  if (searchParams.category) {
    where.type = searchParams.category.toUpperCase()
  }
  if (searchParams.manhwa) {
    where.manhwa = { slug: searchParams.manhwa }
  }
  if (searchParams.q) {
    where.title = { contains: searchParams.q, mode: 'insensitive' }
  }
  
  // Featured products
  const featured = await prisma.manhwaProduct.findMany({
    where: { is_featured: true },
    include: { manhwa: { select: { slug: true, title_en: true, cover_url: true } } },
    orderBy: { position: 'asc' },
    take: 4,
  })
  
  // All products (filtré)
  const products = await prisma.manhwaProduct.findMany({
    where,
    include: { manhwa: { select: { slug: true, title_en: true, cover_url: true } } },
    orderBy: [{ position: 'asc' }, { created_at: 'desc' }],
  })
  
  // Grouper par type
  const grouped = groupProductsByType(products)
  
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">🛒 {t('title')}</h1>
        <p className="text-gray-400 text-sm mt-1">{t('subtitle')}</p>
      </div>
      
      {/* Filtres */}
      <StoreFilters 
        currentCategory={searchParams.category}
        currentManhwa={searchParams.manhwa}
      />
      
      {/* Featured */}
      {featured.length > 0 && !searchParams.category && !searchParams.manhwa && (
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">⭐ {t('featured')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
      
      {/* Products by category */}
      {Object.entries(grouped).map(([type, items]) => (
        <section key={type} className="mb-10">
          <h2 className="text-lg font-bold mb-4">{t(`category.${type}`)}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      ))}
      
      {/* Si aucun produit */}
      {products.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p>{t('noProducts')}</p>
        </div>
      )}
      
      {/* Mention légale affiliation */}
      <p className="text-[10px] text-gray-600 mt-12 text-center">
        {t('legalNotice')}
      </p>
    </div>
  )
}
```

---

## PARTIE 3 — Wishlist produit

### Concept
Un utilisateur connecté peut sauvegarder des produits pour plus tard. Un bouton ♡ sur chaque carte produit et un compteur "X personnes ont ajouté ce produit à leur wishlist" (social proof = plus de clics affiliés).

### Composant bouton wishlist

```tsx
// /components/features/store/WishlistButton.tsx
'use client'

interface Props {
  productId: string
  isInWishlist: boolean
  wishlistCount: number
}

export function WishlistButton({ productId, isInWishlist, wishlistCount }: Props) {
  const [optimistic, setOptimistic] = useState(isInWishlist)
  const [optimisticCount, setOptimisticCount] = useState(wishlistCount)
  const t = useTranslations('store')

  async function handleToggle() {
    setOptimistic(!optimistic)
    setOptimisticCount(prev => optimistic ? prev - 1 : prev + 1)
    await toggleProductWishlist(productId)
  }

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-1.5 text-xs transition ${
        optimistic ? 'text-pink-400' : 'text-gray-500 hover:text-pink-400'
      }`}
    >
      <Heart className={`w-3.5 h-3.5 ${optimistic ? 'fill-current' : ''}`} />
      {optimisticCount > 0 && <span>{optimisticCount}</span>}
    </button>
  )
}
```

### Server action

```typescript
// /lib/actions/wishlist.ts
'use server'

export async function toggleProductWishlist(productId: string) {
  const session = await getServerSession()
  if (!session) throw new Error('Unauthorized')

  const existing = await prisma.productWishlist.findUnique({
    where: { user_id_product_id: { user_id: session.user.id, product_id: productId } },
  })

  if (existing) {
    await prisma.productWishlist.delete({
      where: { user_id_product_id: { user_id: session.user.id, product_id: productId } },
    })
  } else {
    await prisma.productWishlist.create({
      data: { user_id: session.user.id, product_id: productId },
    })
  }

  revalidatePath('/store')
}
```

### Page "Ma wishlist"

```
Route : /store/wishlist (ou /profile/[username]/wishlist)

Liste de tous les produits sauvegardés par l'utilisateur,
avec le bouton d'achat affilié directement accessible.
C'est une page de conversion : l'utilisateur revient pour acheter.
```

---

## PARTIE 4 — Recommandations produits contextuelles

### Sur la fiche manhwa

En plus de la section "📦 Édition physique", ajouter une section "Produits liés" qui montre aussi les figurines, goodies, etc. :

```
📦 Édition physique
  [Solo Leveling Tome 1 — Amazon FR →]
  [Solo Leveling Vol. 1 — Amazon US →]

🎁 Les fans achètent aussi                    ← NOUVEAU
  ┌──────┐ Figurine Jin-Woo — ~35€
  │[img] │ [AmiAmi →] [Amazon →]
  └──────┘
  ┌──────┐ Solo Leveling Artbook — ~25€
  │[img] │ [CDJapan →] [Amazon →]
  └──────┘
```

### Sur la page store

Section "Recommandé pour vous" basée sur la bibliothèque de l'utilisateur :

```typescript
// /lib/db/store-recommendations.ts

export async function getRecommendedProducts(userId: string, limit = 8) {
  // 1. Récupérer les manhwas en bibliothèque de l'utilisateur
  const userLibrary = await prisma.userLibrary.findMany({
    where: { user_id: userId, status: { in: ['COMPLETED', 'READING'] } },
    select: { manhwa_id: true },
    take: 50,
    orderBy: { score: 'desc' },
  })
  const manhwaIds = userLibrary.map(l => l.manhwa_id)

  // 2. Trouver les produits liés à ces manhwas que l'utilisateur N'A PAS dans sa wishlist
  const products = await prisma.manhwaProduct.findMany({
    where: {
      manhwa_id: { in: manhwaIds },
      NOT: {
        wishlists: { some: { user_id: userId } },
      },
    },
    include: {
      links: true,
      manhwa: { select: { slug: true, title_en: true, cover_url: true } },
      _count: { select: { wishlists: true } },
    },
    orderBy: { wishlists: { _count: 'desc' } }, // Les plus wishlistés en premier
    take: limit,
  })

  return products
}
```

---

## PARTIE 5 — Script hybrid de remplissage catalogue (API Amazon + validation manuelle)

### Concept
Un script qui cherche sur Amazon les éditions physiques des manhwa populaires, propose les résultats, et attend ta validation.

### Utilisation de l'API Amazon Product Advertising

```typescript
// /scripts/catalog/search-amazon.ts

// Prérequis : compte Amazon Associates + accès à l'API Product Advertising
// npm install amazon-paapi

import amazonPaapi from 'amazon-paapi'

const AMAZON_CONFIG = {
  AccessKey: process.env.AMAZON_ACCESS_KEY!,
  SecretKey: process.env.AMAZON_SECRET_KEY!,
  PartnerTag: 'manhwaverse-21',
  PartnerType: 'Associates',
  Marketplace: 'www.amazon.fr',  // Changer pour .com, .co.uk, .de
}

async function searchAmazonProducts(manhwaTitle: string): Promise<AmazonResult[]> {
  try {
    const response = await amazonPaapi.SearchItems({
      ...AMAZON_CONFIG,
      Keywords: manhwaTitle + ' manhwa',
      SearchIndex: 'Books',
      ItemCount: 5,
      Resources: [
        'ItemInfo.Title',
        'ItemInfo.ByLineInfo',
        'Offers.Listings.Price',
        'Images.Primary.Large',
        'ItemInfo.ExternalIds',
      ],
    })

    return response.SearchResult.Items.map(item => ({
      asin: item.ASIN,
      title: item.ItemInfo.Title.DisplayValue,
      price: item.Offers?.Listings?.[0]?.Price?.Amount,
      currency: item.Offers?.Listings?.[0]?.Price?.Currency,
      imageUrl: item.Images?.Primary?.Large?.URL,
      isbn: item.ItemInfo?.ExternalIds?.ISBNs?.DisplayValues?.[0],
      url: item.DetailPageURL,
    }))
  } catch (error) {
    console.error(`Amazon search failed for "${manhwaTitle}":`, error)
    return []
  }
}
```

### Script interactif

```typescript
// /scripts/catalog/fill-catalog.ts

// Ce script s'exécute en mode interactif dans le terminal.
// Pour chaque manhwa populaire, il :
// 1. Cherche sur Amazon FR et US
// 2. Affiche les résultats
// 3. Te demande de valider ou rejeter chaque résultat
// 4. Insère les produits validés en DB

import readline from 'readline'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

async function askUser(question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve))
}

async function main() {
  // Top 50 manhwas par popularité
  const manhwas = await prisma.manhwa.findMany({
    where: { is_published: true },
    orderBy: { ext_popularity_anilist: 'desc' },
    take: 50,
    select: { id: true, slug: true, title_en: true },
  })

  for (const manhwa of manhwas) {
    console.log(`\n══════════════════════════════════════`)
    console.log(`📚 ${manhwa.title_en}`)
    console.log(`══════════════════════════════════════`)

    // Chercher sur Amazon FR
    console.log('\n🇫🇷 Amazon FR results:')
    const frResults = await searchAmazonProducts(manhwa.title_en)

    for (const result of frResults) {
      console.log(`  [${result.asin}] ${result.title}`)
      console.log(`    Price: ${result.price} ${result.currency}`)
      console.log(`    URL: ${result.url}`)

      const answer = await askUser('  → Add this product? (y/n/s to skip manhwa): ')

      if (answer === 's') break
      if (answer === 'y') {
        await prisma.manhwaProduct.create({
          data: {
            manhwa_id: manhwa.id,
            type: 'PHYSICAL_MANGA',
            title_en: result.title,
            cover_url: result.imageUrl,
            asin: result.asin,
            isbn: result.isbn,
            price_amount: result.price,
            price_currency: result.currency,
            links: {
              create: {
                marketplace_id: 'amazon_fr',
                url: result.url,
                price_amount: result.price,
                price_currency: result.currency,
              },
            },
          },
        })
        console.log('  ✅ Added!')
      }
    }

    // Chercher sur Amazon US
    console.log('\n🇺🇸 Amazon US results:')
    // ... même logique avec AMAZON_CONFIG.Marketplace = 'www.amazon.com'
  }

  rl.close()
  console.log('\n🎉 Catalog filling complete!')
}
```

### Alternative SANS API Amazon (si pas encore accès)

Si tu n'as pas encore accès à l'API Product Advertising (elle nécessite un compte Associates actif avec des ventes), utiliser un fichier CSV manuel :

```
// /scripts/catalog/products.csv
manhwa_slug,type,title_en,title_fr,language,asin_fr,asin_us,price_eur,price_usd
solo-leveling,PHYSICAL_MANGA,Solo Leveling Vol. 1,Solo Leveling Tome 1,fr,B09XXXXX,,9.99,
solo-leveling,PHYSICAL_MANGA,Solo Leveling Vol. 1,,en,,B09YYYYY,,12.99
solo-leveling,BOX_SET,Solo Leveling Box Set 1-5,Coffret Solo Leveling 1-5,fr,B0AZZZZZ,,42.00,
```

Le script lit le CSV et insère en DB. Tu remplis le CSV manuellement en allant sur Amazon chercher les ASINs.

---

## PARTIE 6 — Stratégie pour les prix en temps réel (Phase 2)

### Phase 1 (maintenant) : Prix indicatif fixe
- Le prix est stocké dans `price_amount` / `price_currency` sur le produit
- Mis à jour manuellement ou via le script hybrid
- Affiché comme "~9€" ou "~$12" (le "~" indique que c'est indicatif)

### Phase 2 (quand accès API Amazon) : Prix live via cron

```typescript
// /lib/pricing/update-prices.ts

// Cron qui tourne 1x par jour pour mettre à jour les prix

import amazonPaapi from 'amazon-paapi'

export async function updateAllPrices() {
  // Récupérer tous les produits avec un ASIN
  const products = await prisma.manhwaProduct.findMany({
    where: { asin: { not: null } },
    include: { links: true },
  })

  // Grouper par ASIN (max 10 ASINs par requête Amazon API)
  const batches = chunkArray(products, 10)

  for (const batch of batches) {
    try {
      const response = await amazonPaapi.GetItems({
        ...AMAZON_CONFIG,
        ItemIds: batch.map(p => p.asin!),
        Resources: ['Offers.Listings.Price', 'Offers.Listings.Availability.Type'],
      })

      for (const item of response.ItemsResult.Items) {
        const product = batch.find(p => p.asin === item.ASIN)
        if (!product) continue

        const price = item.Offers?.Listings?.[0]?.Price
        const isAvailable = item.Offers?.Listings?.[0]?.Availability?.Type === 'Now'

        // Mettre à jour le prix du produit
        await prisma.manhwaProduct.update({
          where: { id: product.id },
          data: {
            price_amount: price?.Amount ?? product.price_amount,
            price_currency: price?.Currency ?? product.price_currency,
            price_updated_at: new Date(),
          },
        })

        // Mettre à jour la disponibilité du lien
        const link = product.links.find(l => l.marketplace_id.startsWith('amazon'))
        if (link) {
          await prisma.productLink.update({
            where: { id: link.id },
            data: {
              price_amount: price?.Amount,
              price_currency: price?.Currency,
              price_updated_at: new Date(),
              is_available: isAvailable,
            },
          })
        }
      }
    } catch (error) {
      console.error('Price update batch failed:', error)
    }

    // Rate limit : Amazon API permet ~1 requête/seconde
    await sleep(1100)
  }
}
```

### API route cron pour les prix

```typescript
// /app/api/cron/update-prices/route.ts

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const updated = await updateAllPrices()
  return Response.json({ updated, timestamp: new Date().toISOString() })
}
```

```json
// vercel.json — ajouter au crons existant
{
  "crons": [
    { "path": "/api/cron/update-prices", "schedule": "0 6 * * *" }  // 6h du matin chaque jour
  ]
}
```

### Affichage du prix avec indicateur de fraîcheur

```tsx
function PriceDisplay({ amount, currency, updatedAt }: { amount: number; currency: string; updatedAt: Date | null }) {
  const isStale = updatedAt && (Date.now() - updatedAt.getTime() > 7 * 24 * 60 * 60 * 1000) // > 7 jours
  
  const formatted = new Intl.NumberFormat(currency === 'EUR' ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency,
  }).format(amount)

  return (
    <span className="text-sm">
      {isStale ? '~' : ''}{formatted}
      {isStale && <span className="text-[9px] text-gray-600 ml-1">(indicatif)</span>}
    </span>
  )
}
```

---

## PARTIE 7 — Page légale affiliation

### Route : `/legal/affiliate-disclosure`

```tsx
// /app/[locale]/legal/affiliate-disclosure/page.tsx

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Divulgation d\'affiliation — ManhwaVerse',
    robots: 'noindex', // Pas besoin d'indexer cette page
  }
}

export default function AffiliateDisclosurePage() {
  const t = useTranslations('legal')
  const locale = useLocale()

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose prose-invert">
      <h1>{t('affiliate.title')}</h1>

      <p>{t('affiliate.intro')}</p>

      <h2>{t('affiliate.amazonTitle')}</h2>
      <p>{t('affiliate.amazonText')}</p>

      <h2>{t('affiliate.otherTitle')}</h2>
      <p>{t('affiliate.otherText')}</p>

      <h2>{t('affiliate.transparencyTitle')}</h2>
      <p>{t('affiliate.transparencyText')}</p>

      <p className="text-sm text-gray-500 mt-8">
        {t('affiliate.lastUpdated', { date: '2026-03-01' })}
      </p>
    </div>
  )
}
```

### Traductions page légale

```json
// fr.json — ajouter dans "legal"
"affiliate": {
  "title": "Divulgation d'affiliation",
  "intro": "ManhwaVerse utilise des liens d'affiliation pour financer le développement et la maintenance du site. Lorsque vous achetez un produit via l'un de nos liens, nous percevons une petite commission sans surcoût pour vous.",
  "amazonTitle": "Programme Partenaires Amazon",
  "amazonText": "ManhwaVerse participe au Programme Partenaires d'Amazon EU et Amazon Associates (US), des programmes d'affiliation conçus pour permettre à des sites de percevoir une rémunération grâce à la création de liens vers Amazon.fr, Amazon.com, Amazon.co.uk et Amazon.de.",
  "otherTitle": "Autres programmes d'affiliation",
  "otherText": "Nous participons également aux programmes d'affiliation de Fnac (via Awin), CDJapan, et d'autres partenaires. Les liens vers ces plateformes peuvent contenir des identifiants d'affiliation.",
  "transparencyTitle": "Notre engagement de transparence",
  "transparencyText": "Tous les liens d'affiliation sont clairement identifiés sur notre site. Nos recommandations et classements ne sont jamais influencés par les commissions d'affiliation. Les notes et reviews sont 100% indépendantes.",
  "lastUpdated": "Dernière mise à jour : {date}"
}

// en.json
"affiliate": {
  "title": "Affiliate Disclosure",
  "intro": "ManhwaVerse uses affiliate links to fund the development and maintenance of the site. When you purchase a product through one of our links, we earn a small commission at no additional cost to you.",
  "amazonTitle": "Amazon Associates Program",
  "amazonText": "ManhwaVerse is a participant in the Amazon Associates Program (US) and Amazon EU Associates Programme, affiliate advertising programs designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com, Amazon.fr, Amazon.co.uk and Amazon.de.",
  "otherTitle": "Other Affiliate Programs",
  "otherText": "We also participate in affiliate programs from Fnac (via Awin), CDJapan, and other partners. Links to these platforms may contain affiliate identifiers.",
  "transparencyTitle": "Our Transparency Commitment",
  "transparencyText": "All affiliate links are clearly identified on our site. Our recommendations and rankings are never influenced by affiliate commissions. Ratings and reviews are 100% independent.",
  "lastUpdated": "Last updated: {date}"
}
```

### Mentions dans le footer et le store

**Footer global** (toutes les pages) — ajouter un lien :
```
LÉGAL
  Politique de confidentialité
  Conditions d'utilisation
  Divulgation d'affiliation     ← NOUVEAU lien
```

**Page store** — bandeau en bas :
```tsx
<div className="mt-12 p-4 rounded-lg bg-white/5 text-xs text-gray-500">
  <p>
    {t('store.affiliateNotice')}{' '}
    <Link href="/legal/affiliate-disclosure" className="text-blue-400 hover:underline">
      {t('store.learnMore')}
    </Link>
  </p>
</div>
```

**Fiche manhwa** — petit texte sous les liens d'achat :
```tsx
<p className="text-[9px] text-gray-600 mt-2">
  {t('store.affiliateHint')} {/* "Lien partenaire" */}
</p>
```

---

## PARTIE 8 — Script hybrid de remplissage catalogue

Pour le lancement, utiliser un CSV manuel (en attendant l'accès API Amazon) :

```csv
# /scripts/catalog/products-seed.csv
# manhwa_slug,type,title_en,title_fr,language,marketplace,url,price,currency
solo-leveling,PHYSICAL_MANGA,Solo Leveling Vol. 1,Solo Leveling Tome 1,fr,amazon_fr,https://amazon.fr/dp/PLACEHOLDER,9.99,EUR
solo-leveling,PHYSICAL_MANGA,Solo Leveling Vol. 1,,en,amazon_us,https://amazon.com/dp/PLACEHOLDER,12.99,USD
solo-leveling,BOX_SET,Solo Leveling Box Set 1-5,Coffret Solo Leveling 1-5,fr,amazon_fr,https://amazon.fr/dp/PLACEHOLDER,42.00,EUR
solo-leveling,LIGHT_NOVEL,Solo Leveling Light Novel 1,,en,amazon_us,https://amazon.com/dp/PLACEHOLDER,10.99,USD
solo-leveling,FIGURINE,Sung Jin-Woo Figure,,jp,amiami,https://amiami.com/PLACEHOLDER,35.00,EUR
tower-of-god,PHYSICAL_MANGA,Tower of God Vol. 1,Tower of God Tome 1,fr,amazon_fr,https://amazon.fr/dp/PLACEHOLDER,8.99,EUR
```

```typescript
// /scripts/catalog/seed-from-csv.ts

import { parse } from 'csv-parse/sync'
import fs from 'fs'

async function main() {
  const csv = fs.readFileSync('./scripts/catalog/products-seed.csv', 'utf-8')
  const rows = parse(csv, { columns: true, skip_empty_lines: true, comment: '#' })

  const productMap = new Map<string, any>()

  for (const row of rows) {
    const key = `${row.manhwa_slug}::${row.title_en}`

    if (!productMap.has(key)) {
      const manhwa = await prisma.manhwa.findUnique({ where: { slug: row.manhwa_slug } })
      if (!manhwa) { console.warn(`⚠️ Manhwa not found: ${row.manhwa_slug}`); continue }

      productMap.set(key, {
        manhwa_id: manhwa.id,
        type: row.type,
        title_en: row.title_en,
        title_fr: row.title_fr || null,
        language: row.language || null,
        price_amount: parseFloat(row.price) || null,
        price_currency: row.currency || null,
        links: [],
      })
    }

    productMap.get(key)!.links.push({
      marketplace_id: row.marketplace,
      url: row.url,
      price_amount: parseFloat(row.price) || null,
      price_currency: row.currency || null,
    })
  }

  for (const [_, data] of productMap) {
    const { links, ...productData } = data
    const product = await prisma.manhwaProduct.create({ data: productData })
    for (const link of links) {
      await prisma.productLink.create({ data: { product_id: product.id, ...link } })
    }
    console.log(`✅ ${data.title_en} (${links.length} links)`)
  }

  console.log(`\n🎉 ${productMap.size} products seeded`)
}

main()
```

**IMPORTANT :** Les URLs sont des PLACEHOLDERS. Remplacer manuellement par les vrais liens Amazon avec les ASINs corrects. Quand l'accès à l'API Amazon Product Advertising sera actif, utiliser le script interactif de la Partie 5.

---

## PARTIE 9 — Admin : gérer les produits

```
/admin/products         → Liste (table avec recherche et filtres)
/admin/products/new     → Formulaire d'ajout
/admin/products/[id]    → Formulaire de modification
```

Formulaire :
- Manhwa : autocomplete par titre
- Type : dropdown (Manga physique / Coffret / Light Novel / Figurine / Artbook / Poster / Goodies)
- Titre EN + Titre FR (optionnel)
- Langue : dropdown (FR / EN / KR / JP)
- Cover URL
- ASIN / ISBN (pour prix auto future)
- Prix indicatif + devise
- Featured : checkbox
- Liens marketplace : liste dynamique [+ Ajouter un lien] avec dropdown marketplace + champ URL + prix

---

## NAVIGATION

Ajouter "Store" dans la navbar :

```
ManhwaVerse  |  Découvrir  |  Blog  |  Store  |  Ma Bibliothèque  |  Flux
```

---

## TRADUCTIONS

```json
// fr.json
"store": {
  "title": "ManhwaVerse Store",
  "subtitle": "Soutenez ManhwaVerse en achetant via nos liens partenaires",
  "physicalEdition": "Édition physique",
  "fansAlsoBuy": "Les fans achètent aussi",
  "buyOn": "Acheter sur",
  "seeAllProducts": "Voir les {count} produits →",
  "featured": "Mis en avant",
  "recommendedForYou": "Recommandé pour vous",
  "noProducts": "Aucun produit trouvé",
  "wishlist": "Ma wishlist",
  "addToWishlist": "Ajouter à ma wishlist",
  "removeFromWishlist": "Retirer de ma wishlist",
  "wishlistCount": "{count} personnes ont sauvegardé ce produit",
  "affiliateNotice": "Les liens sur cette page sont des liens d'affiliation. ManhwaVerse perçoit une commission sur les achats effectués via ces liens, sans surcoût pour vous.",
  "affiliateHint": "Lien partenaire",
  "learnMore": "En savoir plus",
  "legalNotice": "ManhwaVerse participe au Programme Partenaires d'Amazon et à d'autres programmes d'affiliation.",
  "type": {
    "PHYSICAL_MANGA": "Manga physique",
    "BOX_SET": "Coffret",
    "LIGHT_NOVEL": "Light Novel",
    "FIGURINE": "Figurine",
    "ARTBOOK": "Artbook",
    "POSTER": "Poster",
    "GOODS": "Goodies"
  },
  "category": {
    "PHYSICAL_MANGA": "📚 Manhwa physiques",
    "BOX_SET": "📦 Coffrets",
    "LIGHT_NOVEL": "📖 Light Novels",
    "FIGURINE": "🗡️ Figurines",
    "ARTBOOK": "🎨 Artbooks",
    "POSTER": "🖼️ Posters",
    "GOODS": "🎁 Goodies"
  },
  "filters": {
    "all": "Tous",
    "search": "Rechercher un produit..."
  }
}

// en.json
"store": {
  "title": "ManhwaVerse Store",
  "subtitle": "Support ManhwaVerse by shopping through our affiliate links",
  "physicalEdition": "Physical Edition",
  "fansAlsoBuy": "Fans also buy",
  "buyOn": "Buy on",
  "seeAllProducts": "See all {count} products →",
  "featured": "Featured",
  "recommendedForYou": "Recommended for you",
  "noProducts": "No products found",
  "wishlist": "My wishlist",
  "addToWishlist": "Add to wishlist",
  "removeFromWishlist": "Remove from wishlist",
  "wishlistCount": "{count} people saved this product",
  "affiliateNotice": "Links on this page are affiliate links. ManhwaVerse earns a commission on purchases made through these links, at no extra cost to you.",
  "affiliateHint": "Affiliate link",
  "learnMore": "Learn more",
  "legalNotice": "ManhwaVerse participates in the Amazon Associates Program and other affiliate programs.",
  "type": {
    "PHYSICAL_MANGA": "Physical Manga",
    "BOX_SET": "Box Set",
    "LIGHT_NOVEL": "Light Novel",
    "FIGURINE": "Figurine",
    "ARTBOOK": "Artbook",
    "POSTER": "Poster",
    "GOODS": "Goods"
  },
  "category": {
    "PHYSICAL_MANGA": "📚 Physical Manhwa",
    "BOX_SET": "📦 Box Sets",
    "LIGHT_NOVEL": "📖 Light Novels",
    "FIGURINE": "🗡️ Figurines",
    "ARTBOOK": "🎨 Artbooks",
    "POSTER": "🖼️ Posters",
    "GOODS": "🎁 Goods"
  },
  "filters": {
    "all": "All",
    "search": "Search products..."
  }
}
```

---

## CHECKLIST

**DB :**
- [ ] Table `ManhwaProduct` avec title_en/fr, type, ASIN, ISBN, prix
- [ ] Table `ProductLink` pour les liens multi-marketplace
- [ ] Table `ProductWishlist` pour la wishlist utilisateur
- [ ] Table `AffiliateClick` pour le tracking des clics
- [ ] Config multi-marketplace dans `/lib/config/affiliate.ts` (Amazon FR/US/UK/DE, Fnac, CDJapan, AmiAmi, Crunchyroll)

**Fiche manhwa :**
- [ ] Section "📦 Édition physique" dans la sidebar si produits existent
- [ ] Section "🎁 Les fans achètent aussi" (figurines, goodies, artbooks)
- [ ] Liens triés par locale (FR d'abord si locale=fr)
- [ ] Tous les liens ont `rel="noopener noreferrer nofollow sponsored"` et `target="_blank"`
- [ ] Mention "Lien partenaire" discrète sous les liens
- [ ] Clics trackés en DB (fire and forget)
- [ ] Section masquée si aucun produit

**Page store `/store` :**
- [ ] Accessible sans être connecté
- [ ] Filtres par catégorie (query params)
- [ ] Filtre par manhwa (`?manhwa=slug`)
- [ ] Section "Mis en avant" si produits featured
- [ ] Section "Recommandé pour vous" (basée sur la bibliothèque du user connecté)
- [ ] Produits groupés par type
- [ ] Cards produit : image, titre, prix, boutons marketplace (couleur Amazon orange)
- [ ] Bouton wishlist ♡ sur chaque card + compteur social proof
- [ ] generateMetadata SEO
- [ ] Bandeau affiliation en bas avec lien vers `/legal/affiliate-disclosure`

**Wishlist :**
- [ ] Toggle wishlist en un clic (optimistic update)
- [ ] Page `/store/wishlist` pour voir ses produits sauvegardés
- [ ] Compteur "X personnes ont sauvegardé" (social proof)
- [ ] Si non connecté, le bouton wishlist redirige vers /login

**Légal :**
- [ ] Page `/legal/affiliate-disclosure` avec textes FR/EN
- [ ] Lien dans le footer global (section LÉGAL)
- [ ] Mention Amazon Associates Program conforme
- [ ] Mention des autres programmes (Fnac/Awin, CDJapan, etc.)

**Admin :**
- [ ] Page `/admin/products` : liste, ajout, modification, suppression
- [ ] Formulaire avec autocomplete manhwa + liens marketplace dynamiques
- [ ] Config des tags affiliés dans un fichier centralisé

**Prix live (Phase 2 — préparé mais pas activé) :**
- [ ] Champs `price_updated_at` en DB
- [ ] Script `updateAllPrices()` prêt (utilise API Amazon Product Advertising)
- [ ] Cron route `/api/cron/update-prices` prête
- [ ] Affichage "~" devant les prix stale (> 7 jours)

```bash
git add .
git commit -m "feat: affiliate store — Amazon links on manhwa pages + dedicated store page"
git push origin feat/affiliate-store
```
