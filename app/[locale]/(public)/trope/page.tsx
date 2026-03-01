import Link from 'next/link'
import { getAllTropes } from '@/lib/db/trope'
import { PageContainer } from '@/components/layouts/PageContainer'

export const revalidate = 21600

interface TropeIndexProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata() {
  return { title: 'Tropes — ManhwaVerse' }
}

export default async function TropeIndexPage({ params }: TropeIndexProps) {
  const { locale } = await params
  const tropes = await getAllTropes()

  // Group by category
  const grouped = tropes.reduce<Record<string, typeof tropes>>((acc, trope) => {
    const cat = trope.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(trope)
    return acc
  }, {})

  return (
    <PageContainer>
      <h1 className="mb-6 font-display text-2xl font-bold">Tropes</h1>

      {Object.entries(grouped).map(([category, tropesInCat]) => (
        <section key={category} className="mb-8">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-text-muted">
            {category.replace('_', ' ')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {tropesInCat.map((trope) => (
              <Link
                key={trope.id}
                href={`/${locale}/trope/${trope.slug}`}
                className="rounded-full bg-elevated px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-border"
              >
                {trope.name}
                <span className="ml-2 text-text-muted">{trope._count.manhwa_links}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </PageContainer>
  )
}
