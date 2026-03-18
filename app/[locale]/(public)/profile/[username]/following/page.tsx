import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getUserByUsername } from '@/lib/db/user'
import { getFollowing } from '@/lib/db/follow'
import { getUser } from '@/lib/auth/session'
import { isFollowing } from '@/lib/db/follow'
import { FollowButton } from '@/components/features/social/FollowButton'
import { PageContainer } from '@/components/layouts/PageContainer'

interface FollowingPageProps {
  params: Promise<{ locale: string; username: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: FollowingPageProps) {
  const { locale, username } = await params
  const t = await getTranslations({ locale, namespace: 'profile' })
  return { title: `${username} — ${t('followingList')}` }
}

export default async function FollowingPage({ params, searchParams }: FollowingPageProps) {
  const { locale, username } = await params
  const { page } = await searchParams
  const t = await getTranslations({ locale, namespace: 'profile' })

  const profileUser = await getUserByUsername(username)
  if (!profileUser) notFound()

  const currentUser = await getUser()
  const currentPage = parseInt(page ?? '1', 10)
  const { users, total } = await getFollowing(profileUser.id, currentPage)
  const totalPages = Math.ceil(total / 30)

  const followStatuses = currentUser
    ? await Promise.all(users.map((u) => isFollowing(currentUser.id, u.id)))
    : users.map(() => false)

  return (
    <PageContainer>
      <div className="mb-6">
        <Link href={`/${locale}/profile/${username}`} className="text-sm text-crystal-blue hover:underline">
          &larr; {profileUser.display_name ?? profileUser.username}
        </Link>
        <h1 className="mt-2 font-display text-xl font-bold">
          {t('followingList')} ({total})
        </h1>
      </div>

      {users.length === 0 ? (
        <p className="text-sm text-text-muted">{t('noFollowing')}</p>
      ) : (
        <div className="space-y-3">
          {users.map((user, i) => (
            <div key={user.id} className="flex items-center gap-3 rounded-lg bg-surface p-3">
              <Link href={`/${locale}/profile/${user.username}`} className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-elevated text-sm text-text-muted">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username ?? ''} className="h-full w-full rounded-full object-cover" />
                ) : (
                  (user.username ?? '?').charAt(0).toUpperCase()
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/${locale}/profile/${user.username}`} className="text-sm font-medium text-text-primary hover:text-crystal-blue">
                  {user.display_name ?? user.username}
                </Link>
                {user.bio && (
                  <p className="truncate text-xs text-text-muted">{user.bio}</p>
                )}
              </div>
              {currentUser && currentUser.id !== user.id && (
                <FollowButton
                  targetUserId={user.id}
                  initialFollowing={followStatuses[i]!}
                  isLoggedIn={true}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (() => {
          const _ws = 10
          let _s = Math.max(1, currentPage - Math.floor(_ws / 2))
          let _e = _s + _ws - 1
          if (_e > totalPages) { _e = totalPages; _s = Math.max(1, _e - _ws + 1) }
          const _pages = Array.from({ length: _e - _s + 1 }, (_, i) => _s + i)
          return (
        <div className="mt-6 flex justify-center gap-2">
          {_pages.map((p) => (
              <a
                key={p}
                href={`/${locale}/profile/${username}/following?page=${p}`}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  p === currentPage
                    ? 'bg-crystal-blue text-white'
                    : 'bg-elevated text-text-secondary hover:bg-border'
                }`}
              >
                {p}
              </a>
          ))}
        </div>
          )
      })()}
    </PageContainer>
  )
}
