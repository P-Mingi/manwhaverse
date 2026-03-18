import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import type { Prisma } from '@prisma/client'

type ListWithUser = Prisma.ManhwaListGetPayload<{
  include: {
    user: { select: { username: true; display_name: true; avatar_url: true } }
    _count: { select: { items: true; likes: true } }
  }
}>

interface Props {
  list: ListWithUser
  locale: string
}

export function ListCard({ list, locale }: Props) {
  return (
    <div className="card" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <Link
          href={`/${locale}/lists/${list.slug}`}
          style={{ textDecoration: 'none', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, flex: 1 }}
        >
          {list.title}
        </Link>
        {list.is_public && <Badge variant="status">{locale === 'fr' ? 'Public' : 'Public'}</Badge>}
      </div>

      {list.description && (
        <p style={{ margin: '0 0 0.75rem', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {list.description}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '11px', color: 'var(--text-muted)' }}>
        <Avatar src={list.user.avatar_url} username={list.user.username} size={20} />
        <Link href={`/${locale}/profile/${list.user.username}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>{list.user.display_name ?? list.user.username}</Link>
        <span>·</span>
        <span>{list._count.items} {locale === 'fr' ? 'titres' : 'titles'}</span>
        <span>·</span>
        <span>❤ {list._count.likes}</span>
      </div>
    </div>
  )
}
