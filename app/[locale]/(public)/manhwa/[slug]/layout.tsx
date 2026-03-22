import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { getManhwaBySlug } from '@/lib/db/manhwa'
import { getLibraryEntry } from '@/lib/db/library'
import { getUser } from '@/lib/auth/session'
import { getCurrentContentFilter, needsMatureGate } from '@/lib/nsfw'
import { generateManhwaJsonLd, generateBreadcrumbJsonLd } from '@/lib/seo/jsonld'
import { JsonLd } from '@/components/ui/JsonLd'
import { ManhwaHero } from '@/components/features/manhwa/ManhwaHero'
import { ManhwaTabNav } from '@/components/features/manhwa/ManhwaTabNav'
import { LibraryActions } from '@/components/features/manhwa/LibraryActions'
import { MatureGate } from '@/components/features/manhwa/MatureGate'
import { formatCount } from '@/lib/utils/formatCount'

export const revalidate = 3600

interface ManhwaLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string; slug: string }>
}

export default async function ManhwaLayout({ children, params }: ManhwaLayoutProps) {
  const { locale, slug } = await params
  const manhwa = await getManhwaBySlug(slug)

  if (!manhwa) notFound()

  const [contentFilter, user, cookieStore] = await Promise.all([
    getCurrentContentFilter(),
    getUser(),
    cookies(),
  ])
  const bypassCookie = cookieStore.get('mature_bypass')
  const showGate = !bypassCookie && needsMatureGate(manhwa.content_rating, contentFilter)

  if (showGate) {
    return <MatureGate locale={locale} isLoggedIn={!!user} />
  }
  const libraryEntry = user ? await getLibraryEntry(user.id, manhwa.id) : null

  const title = locale === 'fr' ? (manhwa.title_fr ?? manhwa.title_en) : manhwa.title_en

  const breadcrumbs = generateBreadcrumbJsonLd([
    { name: 'Home', url: `/${locale}` },
    { name: 'Explore', url: `/${locale}/explore` },
    { name: title, url: `/${locale}/manhwa/${manhwa.slug}` },
  ])

  return (
    <>
      <JsonLd data={generateManhwaJsonLd(manhwa, locale)} />
      <JsonLd data={breadcrumbs} />

      <ManhwaHero manhwa={manhwa} locale={locale}>
        <LibraryActions
          manhwaId={manhwa.id}
          currentEntry={libraryEntry ? { status: libraryEntry.status, score: libraryEntry.score, progress: libraryEntry.progress } : null}
          isLoggedIn={!!user}
          locale={locale}
          totalChapters={manhwa.chapter_count}
        />
      </ManhwaHero>

      <ManhwaTabNav slug={slug} locale={locale} />

      {/* Content + Sidebar */}
      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '2rem 1rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 220px',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          {/* Main */}
          <div style={{ minWidth: 0 }}>{children}</div>

          {/* Sidebar */}
          <aside>
            <div className="card" style={{ padding: '1rem' }}>
              <h3 style={{ margin: '0 0 0.75rem', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {locale === 'fr' ? 'Informations' : 'Information'}
              </h3>
              <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <dt style={{ color: 'var(--text-muted)' }}>Type</dt>
                  <dd style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 500 }}>{manhwa.type}</dd>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <dt style={{ color: 'var(--text-muted)' }}>{locale === 'fr' ? 'Statut' : 'Status'}</dt>
                  <dd style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 500 }}>{manhwa.status}</dd>
                </div>
                {manhwa.chapter_count && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <dt style={{ color: 'var(--text-muted)' }}>{locale === 'fr' ? 'Chapitres' : 'Chapters'}</dt>
                    <dd style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 500 }}>{manhwa.chapter_count}</dd>
                  </div>
                )}
                {manhwa.release_year && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <dt style={{ color: 'var(--text-muted)' }}>{locale === 'fr' ? 'Année' : 'Year'}</dt>
                    <dd style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 500 }}>
                      {manhwa.release_year}{manhwa.end_year ? `–${manhwa.end_year}` : ''}
                    </dd>
                  </div>
                )}
                {manhwa.reader_count > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <dt style={{ color: 'var(--text-muted)' }}>{locale === 'fr' ? 'Lecteurs' : 'Readers'}</dt>
                    <dd style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 500 }}>{formatCount(manhwa.reader_count)}</dd>
                  </div>
                )}
              </dl>
            </div>

            {manhwa.title_alt.length > 0 && (
              <div className="card" style={{ padding: '1rem', marginTop: '0.75rem' }}>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {locale === 'fr' ? 'Titres alternatifs' : 'Alt. Titles'}
                </h3>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {manhwa.title_alt.slice(0, 5).map((alt, i) => (
                    <li key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{alt}</li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  )
}
