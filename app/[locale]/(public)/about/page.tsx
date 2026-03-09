import { getTranslations } from 'next-intl/server'
import { PageContainer } from '@/components/layouts/PageContainer'

interface AboutPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: AboutPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })

  return (
    <PageContainer>
      <div className="mx-auto max-w-2xl py-8">
        <h1 className="font-display mb-2 text-3xl font-bold text-text-primary">
          {t('title')}
        </h1>
        <p className="mb-10 text-text-secondary">{t('description')}</p>

        {/* Mission */}
        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold text-text-primary">{t('mission')}</h2>
          <p className="leading-relaxed text-text-secondary">{t('missionText')}</p>
        </section>

        {/* Contact */}
        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold text-text-primary">{t('contact')}</h2>
          <p className="leading-relaxed text-text-secondary">
            {t('contactText')}{' '}
            <a
              href="mailto:contact@manhwaverse.com"
              className="text-crystal-blue hover:underline"
            >
              contact@manhwaverse.com
            </a>
          </p>
        </section>

        <p className="text-sm text-text-muted">{t('builtBy')}</p>
      </div>
    </PageContainer>
  )
}
