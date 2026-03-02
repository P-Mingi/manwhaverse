import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getManhwaBySlug } from '@/lib/db/manhwa'
import { getManhwaStats, parseAniListStats } from '@/lib/db/stats'
import { ManhwaStats } from '@/components/features/manhwa/ManhwaStats'

interface StatsPageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({
  params,
}: StatsPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const manhwa = await getManhwaBySlug(slug)
  if (!manhwa) return { title: 'Not Found' }
  const title = locale === 'fr' ? (manhwa.title_fr ?? manhwa.title_en) : manhwa.title_en
  return {
    title: `${title} Stats & Rankings — ManhwaVerse`,
  }
}

export default async function StatsPage({ params }: StatsPageProps) {
  const { locale, slug } = await params
  const manhwa = await getManhwaBySlug(slug)
  if (!manhwa) notFound()

  const t = await getTranslations({ locale, namespace: 'manhwa' })

  const stats = await getManhwaStats(manhwa.id)
  const anilistStats = parseAniListStats(manhwa.anilist_stats)

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-semibold">{t('stats')}</h2>
      <ManhwaStats stats={stats} anilistStats={anilistStats} />
    </div>
  )
}
