import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { PageContainer } from '@/components/layouts/PageContainer'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal' })
  return {
    title: t('affiliate.title'),
    robots: 'noindex',
  }
}

export default async function AffiliateDisclosurePage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal' })

  return (
    <PageContainer>
      <div className="mx-auto max-w-3xl py-8">
        <h1 className="mb-6 font-display text-3xl tracking-wide text-[#e8e8f0]">
          {t('affiliate.title')}
        </h1>

        <div className="space-y-8 text-sm text-[#9999b8] leading-relaxed">
          <p>{t('affiliate.intro')}</p>

          <section>
            <h2 className="mb-2 font-display text-lg tracking-wide text-[#e8e8f0]">
              {t('affiliate.amazonTitle')}
            </h2>
            <p>{t('affiliate.amazonText')}</p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg tracking-wide text-[#e8e8f0]">
              {t('affiliate.otherTitle')}
            </h2>
            <p>{t('affiliate.otherText')}</p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg tracking-wide text-[#e8e8f0]">
              {t('affiliate.transparencyTitle')}
            </h2>
            <p>{t('affiliate.transparencyText')}</p>
          </section>

          <p className="text-xs text-[#6b6b88]">
            {t('affiliate.lastUpdated', { date: '2026-03-03' })}
          </p>
        </div>
      </div>
    </PageContainer>
  )
}
