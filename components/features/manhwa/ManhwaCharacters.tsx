import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import type { CharacterWithRole } from '@/lib/db/character'

interface Props {
  characters: CharacterWithRole[]
  locale: string
}

export function ManhwaCharacters({ characters, locale }: Props) {
  if (characters.length === 0) return null

  return (
    <div>
      <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {locale === 'fr' ? 'Personnages' : 'Characters'}
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {characters.map((ch) => {
          const name = ch.character.name_en
          return (
            <div
              key={ch.character.id}
              className="card"
              style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center' }}
            >
              {ch.character.image_url ? (
                <Image
                  src={ch.character.image_url}
                  alt={name}
                  width={60}
                  height={60}
                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--bg-elevated)' }} />
              )}
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{name}</p>
              <Badge variant="type">{ch.role}</Badge>
            </div>
          )
        })}
      </div>
    </div>
  )
}
