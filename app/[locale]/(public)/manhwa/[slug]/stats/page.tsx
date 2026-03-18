import { notFound } from 'next/navigation'
import { getManhwaBySlug } from '@/lib/db/manhwa'
import { getManhwaStats } from '@/lib/db/stats'
import { PageContainer } from '@/components/layouts/PageContainer'

export const revalidate = 3600

interface StatsPageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: StatsPageProps) {
  const { slug } = await params
  const manhwa = await getManhwaBySlug(slug)
  if (!manhwa) return { title: 'Not Found' }
  return { title: `${manhwa.title_en} — Stats` }
}

export default async function StatsPage({ params }: StatsPageProps) {
  const { slug } = await params
  const manhwa = await getManhwaBySlug(slug)
  if (!manhwa) notFound()

  const stats = await getManhwaStats(manhwa.id)

  return (
    <PageContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Score avg: {manhwa.score_avg?.toFixed(2) ?? '—'}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Score count: {manhwa.score_count}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Readers: {manhwa.reader_count}
          </p>
        </div>
        {stats && (
          <pre style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'auto' }}>
            {JSON.stringify(stats, null, 2)}
          </pre>
        )}
      </div>
    </PageContainer>
  )
}
