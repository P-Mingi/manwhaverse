import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { getAllCharacters } from '@/lib/db/character'
import { PageContainer } from '@/components/layouts/PageContainer'

export const revalidate = 3600

interface CharacterPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string; role?: string }>
}

export async function generateMetadata({ params }: CharacterPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'character' })
  return {
    title: `${t('title')} — ManhwaVerse`,
    description: t('description'),
  }
}

export default async function CharacterPage({ params, searchParams }: CharacterPageProps) {
  const { locale } = await params
  const { page, role } = await searchParams
  const t = await getTranslations({ locale, namespace: 'character' })

  const currentPage = parseInt(page ?? '1', 10)
  const currentRole = (role as 'MAIN' | 'SUPPORTING' | undefined) ?? undefined

  const { characters, total } = await getAllCharacters(currentPage, 24, currentRole)
  const totalPages = Math.ceil(total / 24)

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">{t('title')}</h1>
        <p className="mt-1 text-sm text-text-muted">{total} characters</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {([undefined, 'MAIN', 'SUPPORTING'] as const).map((r) => (
          <Link
            key={r ?? 'all'}
            href={`/${locale}/character${r ? `?role=${r}` : ''}`}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              currentRole === r
                ? 'bg-[rgba(0,255,255,0.08)] border border-[rgba(0,255,255,0.3)] text-[#00ffff]'
                : 'bg-elevated text-text-secondary hover:bg-border'
            }`}
          >
            {r === undefined ? t('filterAll') : r === 'MAIN' ? t('filterMain') : t('filterSupporting')}
          </Link>
        ))}
      </div>

      {/* Grid */}
      {characters.length === 0 ? (
        <div className="py-20 text-center text-text-muted">{t('noCharacters')}</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {characters.map((char) => (
            <Link
              key={char.id}
              href={`/${locale}/character/${char.slug}`}
              className="group flex flex-col items-center gap-2 rounded-xl bg-elevated p-4 text-center transition-colors hover:bg-border"
            >
              <div className="relative h-24 w-16 overflow-hidden rounded-lg bg-surface">
                {char.image_url ? (
                  <Image
                    src={char.image_url}
                    alt={char.name_en}
                    fill
                    sizes="64px"
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl text-text-muted">
                    ?
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary group-hover:text-[#00ffff]">
                  {char.name_en}
                </p>
                {char.name_native && (
                  <p className="text-xs text-text-muted">{char.name_native}</p>
                )}
                <p className="mt-1 text-xs text-text-muted">
                  {char._count.manhwa_links} manhwa
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: Math.min(totalPages, 10) }).map((_, i) => {
            const p = i + 1
            return (
              <Link
                key={p}
                href={`/${locale}/character?${currentRole ? `role=${currentRole}&` : ''}page=${p}`}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  p === currentPage
                    ? 'bg-[rgba(0,255,255,0.08)] border border-[rgba(0,255,255,0.3)] text-[#00ffff]'
                    : 'bg-elevated text-text-secondary hover:bg-border'
                }`}
              >
                {p}
              </Link>
            )
          })}
        </div>
      )}
    </PageContainer>
  )
}
