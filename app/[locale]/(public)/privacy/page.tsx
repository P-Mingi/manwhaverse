import { getTranslations } from 'next-intl/server'
import { PageContainer } from '@/components/layouts/PageContainer'

interface PrivacyPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PrivacyPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'privacy' })
  return {
    title: t('title'),
    description: t('description'),
    robots: { index: false, follow: false },
  }
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'privacy' })

  const sections = [
    { title: t('collectTitle'), body: t('collectText') },
    { title: t('useTitle'), body: t('useText') },
    { title: t('cookiesTitle'), body: t('cookiesText') },
    { title: t('retentionTitle'), body: t('retentionText') },
    { title: t('rightsTitle'), body: t('rightsText') },
  ]

  return (
    <PageContainer>
      <div className="mx-auto max-w-2xl py-8">
        <h1 className="font-display mb-1 text-3xl font-bold text-text-primary">
          {t('title')}
        </h1>
        <p className="mb-2 text-xs text-text-muted">{t('lastUpdated')}</p>
        <p className="mb-10 leading-relaxed text-text-secondary">{t('intro')}</p>

        <div className="flex flex-col gap-8">
          {sections.map(({ title, body }) => (
            <section key={title}>
              <h2 className="mb-2 text-lg font-semibold text-text-primary">{title}</h2>
              <p className="leading-relaxed text-text-secondary">{body}</p>
            </section>
          ))}

          {/* Contact */}
          <section>
            <h2 className="mb-2 text-lg font-semibold text-text-primary">{t('contactTitle')}</h2>
            <p className="leading-relaxed text-text-secondary">
              {t('contactText')}{' '}
              <a href="mailto:privacy@manhwaverse.com" className="text-crystal-blue hover:underline">
                privacy@manhwaverse.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </PageContainer>
  )
}
