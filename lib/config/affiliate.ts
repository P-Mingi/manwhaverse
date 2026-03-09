export interface MarketplaceConfig {
  id: string
  name: string
  color: string
  affiliateTag: string
  affiliateParam: string
  baseUrl: string
  flag: string
  region: 'fr' | 'us' | 'uk' | 'de' | 'jp' | 'global'
  category: 'books' | 'merch' | 'all'
}

export const MARKETPLACES: Record<string, MarketplaceConfig> = {
  amazon_fr: {
    id: 'amazon_fr',
    name: 'Amazon FR',
    color: '#FF9900',
    affiliateTag: 'manhwaverse-21',
    affiliateParam: 'tag',
    baseUrl: 'https://www.amazon.fr',
    flag: '🇫🇷',
    region: 'fr',
    category: 'all',
  },
  amazon_us: {
    id: 'amazon_us',
    name: 'Amazon US',
    color: '#FF9900',
    affiliateTag: 'manhwaverse-20',
    affiliateParam: 'tag',
    baseUrl: 'https://www.amazon.com',
    flag: '🇺🇸',
    region: 'us',
    category: 'all',
  },
  amazon_uk: {
    id: 'amazon_uk',
    name: 'Amazon UK',
    color: '#FF9900',
    affiliateTag: 'manhwaverse-21',
    affiliateParam: 'tag',
    baseUrl: 'https://www.amazon.co.uk',
    flag: '🇬🇧',
    region: 'uk',
    category: 'all',
  },
  amazon_de: {
    id: 'amazon_de',
    name: 'Amazon DE',
    color: '#FF9900',
    affiliateTag: 'manhwaverse-21',
    affiliateParam: 'tag',
    baseUrl: 'https://www.amazon.de',
    flag: '🇩🇪',
    region: 'de',
    category: 'all',
  },
  fnac: {
    id: 'fnac',
    name: 'Fnac',
    color: '#E1A400',
    affiliateTag: '',
    affiliateParam: 'awc',
    baseUrl: 'https://www.fnac.com',
    flag: '🇫🇷',
    region: 'fr',
    category: 'books',
  },
  cdj: {
    id: 'cdj',
    name: 'CDJapan',
    color: '#E60012',
    affiliateTag: '',
    affiliateParam: 'aff',
    baseUrl: 'https://www.cdjapan.co.jp',
    flag: '🇯🇵',
    region: 'jp',
    category: 'all',
  },
  amiami: {
    id: 'amiami',
    name: 'AmiAmi',
    color: '#00A0E9',
    affiliateTag: '',
    affiliateParam: '',
    baseUrl: 'https://www.amiami.com',
    flag: '🇯🇵',
    region: 'jp',
    category: 'merch',
  },
  crunchyroll: {
    id: 'crunchyroll',
    name: 'Crunchyroll Store',
    color: '#F47521',
    affiliateTag: '',
    affiliateParam: '',
    baseUrl: 'https://store.crunchyroll.com',
    flag: '🌐',
    region: 'global',
    category: 'merch',
  },
}

export function buildAffiliateLink(baseUrl: string, marketplace: MarketplaceConfig): string {
  if (!marketplace.affiliateTag || !marketplace.affiliateParam) return baseUrl
  const url = new URL(baseUrl)
  url.searchParams.set(marketplace.affiliateParam, marketplace.affiliateTag)
  return url.toString()
}

const REGION_PRIORITY: Record<string, Record<string, number>> = {
  fr: { fr: 0, global: 1, us: 2, uk: 3, de: 4, jp: 5 },
  en: { us: 0, uk: 1, global: 2, fr: 3, de: 4, jp: 5 },
}

export function sortLinksByLocale(
  links: Array<{ marketplace_id: string; url: string; price_amount: number | null; price_currency: string | null; is_available: boolean }>,
  locale: string
): Array<{ marketplace_id: string; url: string; price_amount: number | null; price_currency: string | null; is_available: boolean; marketplace: MarketplaceConfig }> {
  const priorities = REGION_PRIORITY[locale] ?? REGION_PRIORITY['en'] ?? {}
  return links
    .map((link) => ({ ...link, marketplace: MARKETPLACES[link.marketplace_id] }))
    .filter((link): link is typeof link & { marketplace: MarketplaceConfig } => !!link.marketplace && link.is_available)
    .sort((a, b) => {
      const pA = priorities[a.marketplace.region] ?? 99
      const pB = priorities[b.marketplace.region] ?? 99
      return pA - pB
    })
}

export function formatPrice(amount: number, currency: string, stale = false): string {
  const formatted = new Intl.NumberFormat(currency === 'EUR' ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
  return stale ? `~${formatted}` : formatted
}
