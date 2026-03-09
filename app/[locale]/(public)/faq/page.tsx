import { getTranslations } from 'next-intl/server'
import { PageContainer } from '@/components/layouts/PageContainer'

interface FaqPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: FaqPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'faq' })
  return {
    title: t('title'),
    description: t('description'),
  }
}

const FAQ_KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

export default async function FaqPage({ params }: FaqPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'faq' })

  return (
    <PageContainer>
      <div className="mx-auto max-w-2xl py-8">
        <h1 className="font-display mb-2 text-3xl font-bold text-text-primary">
          {t('title')}
        </h1>
        <p className="mb-10 text-text-secondary">{t('description')}</p>

        <div className="flex flex-col gap-6">
          {FAQ_KEYS.map((n) => (
            <div key={n} className="rounded-lg border border-border bg-surface p-5">
              <h2 className="mb-2 font-semibold text-text-primary">
                {t(`q${n}` as Parameters<typeof t>[0])}
              </h2>
              <p className="leading-relaxed text-text-secondary">
                {t(`a${n}` as Parameters<typeof t>[0])}
              </p>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  )
}
