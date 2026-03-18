import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getUserByUsername } from '@/lib/db/user'
import { getUserLibrary } from '@/lib/db/library'
import { getUserActivity } from '@/lib/db/activity'
import { getFollowerPreview, isFollowing } from '@/lib/db/follow'
import { getUser } from '@/lib/auth/session'
import { ManhwaCard } from '@/components/features/manhwa/ManhwaCard'
import { ActivityRow } from '@/components/features/social/ActivityRow'
import { FollowButton } from '@/components/features/social/FollowButton'
import { PageContainer } from '@/components/layouts/PageContainer'

export const revalidate = 300

interface ProfilePageProps {
  params: Promise<{ locale: string; username: string }>
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params
  const user = await getUserByUsername(username)
  if (!user) return {}
  return {
    title: `${user.display_name ?? user.username} — ManhwaVerse`,
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale, username } = await params
  const t = await getTranslations({ locale, namespace: 'profile' })

  const [profileUser, currentUser] = await Promise.all([
    getUserByUsername(username),
    getUser(),
  ])
  if (!profileUser) notFound()

  const isOwnProfile = currentUser?.id === profileUser.id

  const [userFollowing, recentLibrary, { activities: recentActivity }, followerPreview] =
    await Promise.all([
      currentUser && !isOwnProfile
        ? isFollowing(currentUser.id, profileUser.id)
        : Promise.resolve(false),
      getUserLibrary(profileUser.id),
      getUserActivity(profileUser.id, 1, 5),
      getFollowerPreview(profileUser.id, 5),
    ])

  return (
    <PageContainer>
      {/* Profile header */}
      <div className="flex items-start gap-6">
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-elevated text-2xl text-text-muted">
          {profileUser.avatar_url ? (
            <img
              src={profileUser.avatar_url}
              alt={profileUser.username ?? ''}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            (profileUser.username ?? '?').charAt(0).toUpperCase()
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl font-bold">
              {profileUser.display_name ?? profileUser.username}
            </h1>
            {!isOwnProfile && (
              <FollowButton
                targetUserId={profileUser.id}
                initialFollowing={userFollowing}
                isLoggedIn={!!currentUser}
              />
            )}
            {isOwnProfile && (
              <Link
                href={`/${locale}/settings`}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
              >
                {t('editProfile')}
              </Link>
            )}
          </div>
          <p className="text-sm text-text-muted">@{profileUser.username}</p>
          {profileUser.bio && (
            <p className="mt-2 text-sm text-text-secondary">{profileUser.bio}</p>
          )}
          <p className="mt-1 text-xs text-text-muted">
            {t('memberSince', {
              date: new Date(profileUser.created_at).toLocaleDateString(locale, {
                year: 'numeric',
                month: 'long',
              }),
            })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 flex gap-6 text-center">
        <div>
          <div className="font-mono text-lg font-bold">{profileUser._count.library}</div>
          <div className="text-xs text-text-muted">{t('titles')}</div>
        </div>
        <div>
          <div className="font-mono text-lg font-bold">{profileUser._count.reviews}</div>
          <div className="text-xs text-text-muted">{t('reviewsWritten')}</div>
        </div>
        <Link href={`/${locale}/profile/${profileUser.username}/followers`} className="transition-colors hover:text-accent">
          <div className="font-mono text-lg font-bold">{profileUser._count.followers}</div>
          <div className="text-xs text-text-muted">{t('followers')}</div>
        </Link>
        <Link href={`/${locale}/profile/${profileUser.username}/following`} className="transition-colors hover:text-accent">
          <div className="font-mono text-lg font-bold">{profileUser._count.follows}</div>
          <div className="text-xs text-text-muted">{t('following')}</div>
        </Link>
      </div>

      {/* Follower avatar row */}
      {followerPreview.length > 0 && (
        <Link
          href={`/${locale}/profile/${profileUser.username}/followers`}
          className="mt-4 flex items-center gap-2"
        >
          <div className="flex -space-x-2">
            {followerPreview.map((f) => (
              <div
                key={f.id}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-void bg-elevated text-[10px] text-text-muted"
              >
                {f.avatar_url ? (
                  <img
                    src={f.avatar_url}
                    alt={f.username ?? ''}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  (f.username ?? '?').charAt(0).toUpperCase()
                )}
              </div>
            ))}
          </div>
          {profileUser._count.followers > followerPreview.length && (
            <span className="text-xs text-text-muted">
              +{profileUser._count.followers - followerPreview.length}
            </span>
          )}
        </Link>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 font-display text-lg font-bold">{t('recentActivity')}</h2>
          <div className="space-y-2">
            {recentActivity.map((activity) => (
              <ActivityRow key={activity.id} activity={activity} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* Recent library */}
      {recentLibrary.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 font-display text-lg font-bold">{t('titles')}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {recentLibrary.slice(0, 12).map((entry) => (
              <ManhwaCard key={entry.id} manhwa={entry.manhwa} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </PageContainer>
  )
}
