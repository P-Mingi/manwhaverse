import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { ManhwaCard } from '@/components/features/manhwa/ManhwaCard'
import type { ManhwaListWithItems } from '@/lib/db/list'

interface Props {
  list: ManhwaListWithItems
  locale: string
}

export function ListDetail({ list, locale }: Props) {
  return (
    <div style={{ maxWidth: 1024, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {list.title}
        </h1>
        {list.description && (
          <p style={{ margin: '0 0 0.75rem', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {list.description}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '12px', color: 'var(--text-muted)' }}>
          <Avatar src={list.user.avatar_url} username={list.user.username} size={24} />
          <Link href={`/${locale}/profile/${list.user.username}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>
            {list.user.display_name ?? list.user.username}
          </Link>
          <span>·</span>
          <span>{list.items.length} {locale === 'fr' ? 'titres' : 'titles'}</span>
          <span>·</span>
          <span>❤ {list.likes_count}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
        {list.items.map((item) => (
          <ManhwaCard key={item.id} manhwa={item.manhwa} locale={locale} />
        ))}
      </div>
    </div>
  )
}
