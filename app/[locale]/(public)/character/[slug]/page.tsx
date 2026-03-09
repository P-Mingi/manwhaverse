import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getCharacterBySlug } from '@/lib/db/character'
import { PageContainer } from '@/components/layouts/PageContainer'

export const revalidate = 3600

interface CharacterDetailProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: CharacterDetailProps) {
  const { slug } = await params
  const character = await getCharacterBySlug(slug)
  if (!character) return {}
  return {
    title: `${character.name_en} — ManhwaVerse`,
    description: character.description?.slice(0, 150) ?? `Character ${character.name_en}`,
  }
}

export default async function CharacterDetailPage({ params }: CharacterDetailProps) {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: 'character' })

  const character = await getCharacterBySlug(slug)
  if (!character) notFound()

  const ROLE_LABEL: Record<string, string> = {
    MAIN: locale === 'fr' ? 'Principal' : 'Main',
    SUPPORTING: locale === 'fr' ? 'Secondaire' : 'Supporting',
    BACKGROUND: locale === 'fr' ? 'Figurant' : 'Background',
  }

  return (
    <PageContainer>
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start">
        {/* Portrait */}
        <div className="relative h-48 w-32 shrink-0 overflow-hidden rounded-xl bg-surface">
          {character.image_url ? (
            <Image
              src={character.image_url}
              alt={character.name_en}
              fill
              sizes="128px"
              className="object-cover object-top"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl text-text-muted">
              ?
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold">{character.name_en}</h1>
          {character.name_native && (
            <p className="mt-0.5 text-base text-text-muted">{character.name_native}</p>
          )}
          {character.name_alt.length > 0 && (
            <p className="mt-1 text-sm text-text-muted">{character.name_alt.join(', ')}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-text-muted">
            {character.gender && <span>{character.gender}</span>}
            {character.age && <span>Age: {character.age}</span>}
          </div>
          {character.description ? (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary">
              {character.description}
            </p>
          ) : (
            <p className="mt-4 text-sm text-text-muted italic">{t('noDescription')}</p>
          )}
        </div>
      </div>

      {/* Appearances */}
      {character.manhwa_links.length > 0 && (
        <div>
          <h2 className="mb-4 font-display text-lg font-semibold">{t('appearsIn')}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {character.manhwa_links.map(({ manhwa, role }) => (
              <Link
                key={manhwa.id}
                href={`/${locale}/manhwa/${manhwa.slug}`}
                className="group flex gap-3 rounded-xl bg-elevated p-3 transition-colors hover:bg-border"
              >
                {manhwa.cover_url && (
                  <div className="relative h-16 w-10 shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={manhwa.cover_url}
                      alt={manhwa.title_en}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-primary group-hover:text-[#00ffff]">
                    {locale === 'fr' && manhwa.title_fr ? manhwa.title_fr : manhwa.title_en}
                  </p>
                  <p className="text-xs text-text-muted">{ROLE_LABEL[role] ?? role}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  )
}
