import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getTopRankedManhwas } from '@/lib/db/ranking'
import { HomePodium } from './HomePodium'
import { HomeRankingList } from './HomeRankingList'

interface HomeRankingProps {
  locale: string
}

export async function HomeRanking({ locale }: HomeRankingProps) {
  const t = await getTranslations({ locale, namespace: 'home' })
  const topManhwas = await getTopRankedManhwas(10, locale)

  if (topManhwas.length < 3) return null

  const top3 = topManhwas.slice(0, 3)
  const rest = topManhwas.slice(3)

  return (
    <section className="mt-12 mb-8">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold">
          🏆 {t('ranking.title')}
        </h2>
        <Link
          href={`/${locale}/top`}
          className="text-sm text-crystal-blue hover:underline"
        >
          {t('ranking.viewAll')}
        </Link>
      </div>

      <HomePodium top3={top3} locale={locale} readersLabel={t('readers')} />

      {rest.length > 0 && (
        <HomeRankingList manhwas={rest} locale={locale} readersLabel={t('readers')} />
      )}
    </section>
  )
}
