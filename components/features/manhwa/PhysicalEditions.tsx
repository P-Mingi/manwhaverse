'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { sortLinksByLocale, formatPrice, MARKETPLACES } from '@/lib/config/affiliate'
import { trackAffiliateClick } from '@/lib/actions/affiliate'
import type { ProductWithLinks } from '@/lib/db/store'

interface PhysicalEditionsProps {
  manhwaId: string
  manhwaSlug: string
  products: ProductWithLinks[]
}

export function PhysicalEditions({ manhwaId, manhwaSlug, products }: PhysicalEditionsProps) {
  const locale = useLocale()
  const t = useTranslations('store')

  if (products.length === 0) return null

  // Show physical editions + box sets first, then merch
  const sorted = [...products].sort((a, b) => {
    const order = ['PHYSICAL_MANGA', 'BOX_SET', 'LIGHT_NOVEL', 'ARTBOOK', 'FIGURINE', 'POSTER', 'GOODS']
    return order.indexOf(a.type) - order.indexOf(b.type)
  })

  return (
    <div className="rounded-lg border border-electric-border bg-card p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-secondary">
        📦 {t('physicalEdition')}
      </h3>

      <div className="space-y-2">
        {sorted.slice(0, 3).map((product) => {
          const sortedLinks = sortLinksByLocale(product.links, locale)
          const primaryLink = sortedLinks[0]
          if (!primaryLink) return null

          const mp = MARKETPLACES[primaryLink.marketplace_id]
          const title = locale === 'fr' && product.title_fr ? product.title_fr : product.title_en
          const cover = product.cover_url ?? product.manhwa.cover_url
          const isStale = product.price_updated_at
            ? Date.now() - new Date(product.price_updated_at).getTime() > 7 * 24 * 60 * 60 * 1000
            : true

          return (
            <a
              key={product.id}
              href={primaryLink.url}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              onClick={() => trackAffiliateClick(manhwaId, product.id, primaryLink.marketplace_id, primaryLink.url).catch(() => {})}
              className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-2.5 transition-all hover:border-electric-border hover:bg-white/[0.04]"
            >
              {cover && (
                <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded">
                  <Image src={cover} alt={title} fill sizes="40px" className="object-cover" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-text-primary">{title}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  {primaryLink.price_amount != null && primaryLink.price_currency && (
                    <span className="text-[10px] text-text-secondary">
                      {formatPrice(primaryLink.price_amount, primaryLink.price_currency, isStale)}
                    </span>
                  )}
                  <span className="text-[10px] text-electric">
                    {mp?.flag} {mp?.name ?? primaryLink.marketplace_id} →
                  </span>
                </div>
              </div>
            </a>
          )
        })}
      </div>

      {products.length > 3 && (
        <Link
          href={`/${locale}/store?manhwa=${manhwaSlug}`}
          className="mt-3 block text-center text-xs text-electric hover:underline"
        >
          {t('seeAllProducts', { count: products.length })}
        </Link>
      )}

      <p className="mt-3 text-[9px] text-text-muted">{t('affiliateHint')}</p>
    </div>
  )
}
