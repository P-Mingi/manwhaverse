import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getManhwaBySlug } from '@/lib/db/manhwa'

export const revalidate = 3600

interface StaffPageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: StaffPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const manhwa = await getManhwaBySlug(slug)
  if (!manhwa) return { title: 'Not Found' }
  const title = locale === 'fr' ? (manhwa.title_fr ?? manhwa.title_en) : manhwa.title_en
  return { title: `${title} — Staff` }
}

export default async function StaffPage({ params }: StaffPageProps) {
  const { locale, slug } = await params
  const manhwa = await getManhwaBySlug(slug)
  if (!manhwa) notFound()

  const creators = manhwa.creator_links

  return (
    <div>
      <h2 className="font-display" style={{ margin: '0 0 1rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
        {locale === 'fr' ? 'Équipe créative' : 'Staff & Creators'}
      </h2>

      {creators.length === 0 ? (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {locale === 'fr' ? 'Aucune information disponible.' : 'No staff information available.'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {creators.map((cl, i) => (
            <div
              key={i}
              className="card"
              style={{ padding: '0.75rem 1rem' }}
            >
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {cl.creator?.name ?? '—'}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                {cl.role}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
