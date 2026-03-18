import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getManhwaBySlug } from '@/lib/db/manhwa'
import { getCharactersByManhwaId } from '@/lib/db/character'
import { ManhwaCharacters } from '@/components/features/manhwa/ManhwaCharacters'

export const revalidate = 3600

interface CharactersPageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: CharactersPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const manhwa = await getManhwaBySlug(slug)
  if (!manhwa) return { title: 'Not Found' }
  const title = locale === 'fr' ? (manhwa.title_fr ?? manhwa.title_en) : manhwa.title_en
  return { title: `${title} — ${locale === 'fr' ? 'Personnages' : 'Characters'}` }
}

export default async function CharactersPage({ params }: CharactersPageProps) {
  const { locale, slug } = await params
  const manhwa = await getManhwaBySlug(slug)
  if (!manhwa) notFound()

  const characters = await getCharactersByManhwaId(manhwa.id)

  return (
    <div>
      <h2 className="font-display" style={{ margin: '0 0 1rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
        {locale === 'fr' ? 'Personnages' : 'Characters'} ({characters.length})
      </h2>
      <ManhwaCharacters characters={characters} locale={locale} />
    </div>
  )
}
