import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getAllGenres } from '@/lib/db/genre'
import { PageContainer } from '@/components/layouts/PageContainer'

export const revalidate = 21600

interface GenreIndexProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: GenreIndexProps) {
  const { locale } = await params
  return { title: locale === 'fr' ? 'Genres — ManhwaVerse' : 'Genres — ManhwaVerse' }
}

export default async function GenreIndexPage({ params }: GenreIndexProps) {
  const { locale } = await params
  const genres = await getAllGenres()

  return (
    <PageContainer>
      <h1 className="mb-6 font-display text-2xl font-bold">Genres</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {genres.map((genre) => (
          <Link
            key={genre.id}
            href={`/${locale}/genre/${genre.slug}`}
            className="flex items-center justify-between rounded-lg bg-elevated px-4 py-3 transition-colors hover:bg-border"
          >
            <span className="text-sm font-medium text-text-primary">
              {locale === 'fr' ? genre.name_fr : genre.name_en}
            </span>
            <span className="text-xs text-text-muted">{genre._count.manhwa_links}</span>
          </Link>
        ))}
      </div>
    </PageContainer>
  )
}
