'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { sortLinksByLocale, formatPrice, MARKETPLACES } from '@/lib/config/affiliate'
import { trackAffiliateClick } from '@/lib/actions/affiliate'
import { WishlistButton } from './WishlistButton'
import type { ProductWithLinks } from '@/lib/db/store'

interface ProductCardProps {
  product: ProductWithLinks
  isInWishlist?: boolean
  isLoggedIn?: boolean
}

export function ProductCard({ product, isInWishlist = false, isLoggedIn = false }: ProductCardProps) {
  const locale = useLocale()
  const t = useTranslations('store')

  const title = locale === 'fr' && product.title_fr ? product.title_fr : product.title_en
  const cover = product.cover_url ?? product.manhwa.cover_url

  const sortedLinks = sortLinksByLocale(product.links, locale)
  const primaryLink = sortedLinks[0]

  const isStale = product.price_updated_at
    ? Date.now() - new Date(product.price_updated_at).getTime() > 7 * 24 * 60 * 60 * 1000
    : true

  function handleClick(marketplaceId: string, url: string) {
    trackAffiliateClick(product.manhwa.id, product.id, marketplaceId, url).catch(() => {})
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-white/5 bg-card transition-all duration-250 hover:border-electric-border">
      {/* Cover */}
      <div className="relative aspect-[3/4] bg-elevated">
        {cover ? (
          <Image
            src={cover}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-text-muted">
            No image
          </div>
        )}

        {/* Type badge */}
        <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-text-primary backdrop-blur-sm">
          {t(`type.${product.type as 'PHYSICAL_MANGA'}`)}
        </span>

        {/* Language badge */}
        {product.language && (
          <span className="absolute right-2 top-2 text-sm">
            {product.language === 'fr' ? '🇫🇷' : product.language === 'en' ? '🇬🇧' : product.language === 'kr' || product.language === 'ko' ? '🇰🇷' : product.language === 'jp' || product.language === 'ja' ? '🇯🇵' : '🌐'}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-3">
        {/* Manhwa link */}
        <Link
          href={`/${locale}/manhwa/${product.manhwa.slug}`}
          className="text-[10px] text-electric hover:underline"
        >
          {locale === 'fr' && product.manhwa.title_fr ? product.manhwa.title_fr : product.manhwa.title_en}
        </Link>

        <h3 className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug text-text-primary">
          {title}
        </h3>

        {/* Price */}
        {primaryLink?.price_amount != null && primaryLink.price_currency && (
          <p className="mt-1 text-xs text-text-secondary">
            {formatPrice(primaryLink.price_amount, primaryLink.price_currency, isStale)}
          </p>
        )}

        {/* Buy buttons */}
        <div className="mt-auto flex flex-col gap-1.5 pt-3">
          {sortedLinks.slice(0, 2).map((link) => {
            const mp = MARKETPLACES[link.marketplace_id]
            return (
              <a
                key={link.marketplace_id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                onClick={() => handleClick(link.marketplace_id, link.url)}
                className="flex items-center justify-center gap-1.5 rounded-md bg-[#FF9900]/10 px-3 py-1.5 text-[11px] font-semibold text-[#FF9900] transition-colors hover:bg-[#FF9900]/20"
              >
                {mp?.flag} {t('buyOn')} {mp?.name ?? link.marketplace_id}
              </a>
            )
          })}
        </div>

        {/* Footer: wishlist + affiliate hint */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[9px] text-text-muted">{t('affiliateHint')}</span>
          <WishlistButton
            productId={product.id}
            isInWishlist={isInWishlist}
            wishlistCount={product._count.wishlists}
            isLoggedIn={isLoggedIn}
            locale={locale}
          />
        </div>
      </div>
    </div>
  )
}
