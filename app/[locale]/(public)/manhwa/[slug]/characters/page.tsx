import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getManhwaBySlug } from '@/lib/db/manhwa'
import { getCharactersByManhwaId } from '@/lib/db/character'
import { ManhwaCharacters } from '@/components/features/manhwa/ManhwaCharacters'

interface CharactersPageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({
  params,
}: CharactersPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const manhwa = await getManhwaBySlug(slug)
  if (!manhwa) return { title: 'Not Found' }
  const title = locale === 'fr' ? (manhwa.title_fr ?? manhwa.title_en) : manhwa.title_en
  return {
    title: `${title} Characters — ManhwaVerse`,
  }
}

export default async function CharactersPage({ params }: CharactersPageProps) {
  const { locale, slug } = await params
  const manhwa = await getManhwaBySlug(slug)
  if (!manhwa) notFound()

  const t = await getTranslations({ locale, namespace: 'manhwa' })
  const characters = await getCharactersByManhwaId(manhwa.id)

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-semibold">{t('characters')}</h2>
      <ManhwaCharacters
        characters={characters}
        locale={locale}
        manhwaSlug={slug}
        showAll
      />
    </div>
  )
}
