// components/features/manhwa/ManhwaReadLinks.tsx
// Server component — no 'use client' needed

interface ReadLink {
  id: string
  url: string
  platform: string
  language: string
  is_official: boolean
  is_free: boolean
}

interface Props {
  readLinks: ReadLink[]
  locale: string
}

const SOURCE_META: Record<string, { icon: string; color: string; bg: string }> = {
  'Asura Scans':  { icon: 'A', color: '#7C3AED', bg: 'rgba(124,58,237,0.12)' },
  'Flame Comics': { icon: 'F', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  'Webtoon':      { icon: 'W', color: '#00D654', bg: 'rgba(0,214,84,0.12)' },
  'Tapas':        { icon: 'T', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  'MangaPlus':    { icon: 'M', color: '#e11d48', bg: 'rgba(225,29,72,0.12)' },
  'Naver':        { icon: 'N', color: '#03C75A', bg: 'rgba(3,199,90,0.12)' },
}

function getSourceMeta(name: string) {
  const key = Object.keys(SOURCE_META).find(k => name.toLowerCase().includes(k.toLowerCase()))
  return key ? SOURCE_META[key] : { icon: name.charAt(0).toUpperCase(), color: 'var(--accent)', bg: 'var(--accent-muted)' }
}

export default function ManhwaReadLinks({ readLinks, locale }: Props) {
  if (!readLinks || readLinks.length === 0) return null

  const sorted = [...readLinks].sort((a, b) => {
    if (a.is_official !== b.is_official) return a.is_official ? -1 : 1
    if (a.is_free !== b.is_free) return a.is_free ? -1 : 1
    const aMatch = a.language?.toLowerCase() === locale ? 1 : 0
    const bMatch = b.language?.toLowerCase() === locale ? 1 : 0
    return bMatch - aMatch
  })

  return (
    <div>
      <h3
        style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: '10px',
        }}
      >
        {locale === 'fr' ? 'Où lire' : 'Where to read'}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {sorted.map(link => {
          const meta = getSourceMeta(link.platform)
          const lang = link.language?.toUpperCase()

          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '10px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                textDecoration: 'none',
                transition: 'border-color 0.15s, background 0.15s',
                cursor: 'pointer',
              }}
            >
              {/* Source icon */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: meta.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: meta.color,
                  flexShrink: 0,
                }}
              >
                {meta.icon}
              </div>

              {/* Name */}
              <span
                style={{
                  flex: 1,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {link.platform}
              </span>

              {/* Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                {lang && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '2px 7px',
                      borderRadius: '12px',
                      background: 'var(--bg-card)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {lang}
                  </span>
                )}
                {link.is_official && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '2px 7px',
                      borderRadius: '12px',
                      background: 'rgba(0,212,180,0.12)',
                      color: 'var(--accent)',
                      border: '1px solid var(--accent-muted)',
                    }}
                  >
                    {locale === 'fr' ? 'Officiel' : 'Official'}
                  </span>
                )}
                {!link.is_free && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '2px 7px',
                      borderRadius: '12px',
                      background: 'rgba(245,158,11,0.12)',
                      color: '#f59e0b',
                      border: '1px solid rgba(245,158,11,0.2)',
                    }}
                  >
                    Premium
                  </span>
                )}
              </div>

              {/* External link arrow */}
              <span style={{ color: 'var(--text-muted)', fontSize: '12px', flexShrink: 0 }}>↗</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
