import { Avatar } from '@/components/ui/Avatar'
import { FollowButton } from '@/components/features/social/FollowButton'
import type { Prisma } from '@prisma/client'

type ProfileUser = Prisma.UserGetPayload<{
  select: {
    id: true; username: true; display_name: true; avatar_url: true; bio: true; created_at: true
    _count: { select: { library: true; reviews: true; followers: true; following: true } }
  }
}>

interface Props {
  user: ProfileUser
  isOwnProfile: boolean
  isFollowing: boolean
  locale: string
  currentUserId?: string | null
}

export function ProfileHeader({ user, isOwnProfile, isFollowing, locale, currentUserId }: Props) {
  return (
    <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 1024, margin: '0 auto', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        <Avatar src={user.avatar_url} username={user.username} size={80} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {user.display_name ?? user.username}
          </h1>
          {user.username && (
            <p style={{ margin: '0 0 0.5rem', fontSize: '13px', color: 'var(--text-muted)' }}>@{user.username}</p>
          )}
          {user.bio && (
            <p style={{ margin: '0 0 0.75rem', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {user.bio}
            </p>
          )}

          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '12px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <span><strong style={{ color: 'var(--text-primary)' }}>{user._count.library}</strong> {locale === 'fr' ? 'titres' : 'titles'}</span>
            <span><strong style={{ color: 'var(--text-primary)' }}>{user._count.reviews}</strong> {locale === 'fr' ? 'avis' : 'reviews'}</span>
            <span><strong style={{ color: 'var(--text-primary)' }}>{user._count.followers}</strong> {locale === 'fr' ? 'abonnés' : 'followers'}</span>
            <span><strong style={{ color: 'var(--text-primary)' }}>{user._count.following}</strong> {locale === 'fr' ? 'abonnements' : 'following'}</span>
          </div>
        </div>

        {!isOwnProfile && currentUserId && (
          <FollowButton targetUserId={user.id} initialFollowing={isFollowing} isLoggedIn={true} locale={locale} />
        )}
      </div>
    </div>
  )
}
