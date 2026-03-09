import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { getCreatorBySlug } from '@/lib/db/creator'
import { getCurrentContentFilter } from '@/lib/nsfw'
import { ManhwaCard } from '@/components/features/ManhwaCard'
import { PageContainer } from '@/components/layouts/PageContainer'

export const revalidate = 3600

interface PeopleDetailProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: PeopleDetailProps) {
  const { slug } = await params
  const creator = await getCreatorBySlug(slug)
  if (!creator) return {}
  return {
    title: `${creator.name} — ManhwaVerse`,
    description: creator.bio_en?.slice(0, 150) ?? `Manhwa creator ${creator.name}`,
  }
}

export default async function PeopleDetailPage({ params }: PeopleDetailProps) {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: 'people' })

  const [creator, contentFilter] = await Promise.all([
    getCreatorBySlug(slug),
    getCurrentContentFilter(),
  ])
  if (!creator) notFound()
  const bio = locale === 'fr' ? (creator.bio_fr ?? creator.bio_en) : creator.bio_en

  const ROLE_LABEL: Record<string, string> = {
    AUTHOR: locale === 'fr' ? 'Auteur' : 'Author',
    ILLUSTRATOR: locale === 'fr' ? 'Illustrateur' : 'Illustrator',
    BOTH: locale === 'fr' ? 'Auteur & Illustrateur' : 'Author & Illustrator',
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full bg-surface">
          {creator.avatar_url ? (
            <Image
              src={creator.avatar_url}
              alt={creator.name}
              fill
              sizes="128px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl text-text-muted">
              {creator.name[0]}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold">{creator.name}</h1>
          {creator.name_native && (
            <p className="mt-0.5 text-base text-text-muted">{creator.name_native}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-text-muted">
            {creator.nationality && <span>{creator.nationality}</span>}
            {creator.birth_year && <span>b. {creator.birth_year}</span>}
            <span>{creator._count.followers} {t('followers')}</span>
            <span>{creator.works.length} {t('works')}</span>
          </div>
          {bio ? (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary">{bio}</p>
          ) : (
            <p className="mt-4 text-sm text-text-muted italic">{t('noBio')}</p>
          )}
        </div>
      </div>

      {/* Works grid */}
      <h2 className="mb-4 font-display text-lg font-semibold">{t('works')}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {creator.works.map(({ manhwa, role }) => (
          <div key={manhwa.id} className="flex flex-col gap-1">
            <ManhwaCard
              manhwa={manhwa}
              locale={locale}
              userContentFilter={contentFilter}
            />
            <span className="text-center text-xs text-text-muted">{ROLE_LABEL[role] ?? role}</span>
          </div>
        ))}
      </div>
    </PageContainer>
  )
}
