import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getManhwaBySlug } from '@/lib/db/manhwa'
import { ManhwaStaff } from '@/components/features/manhwa/ManhwaStaff'

interface StaffPageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({
  params,
}: StaffPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const manhwa = await getManhwaBySlug(slug)
  if (!manhwa) return { title: 'Not Found' }
  const title = locale === 'fr' ? (manhwa.title_fr ?? manhwa.title_en) : manhwa.title_en
  return {
    title: `${title} Staff & Creators — ManhwaVerse`,
  }
}

export default async function StaffPage({ params }: StaffPageProps) {
  const { locale, slug } = await params
  const manhwa = await getManhwaBySlug(slug)
  if (!manhwa) notFound()

  const t = await getTranslations({ locale, namespace: 'manhwa' })

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-semibold">{t('staff')}</h2>
      <ManhwaStaff creatorLinks={manhwa.creator_links} />
    </div>
  )
}
