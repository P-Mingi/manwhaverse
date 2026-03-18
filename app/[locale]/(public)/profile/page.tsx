import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { requireSession } from '@/lib/auth/session'
import { getUserById } from '@/lib/db/user'
import { getUserLibrary } from '@/lib/db/library'
import { getUserActivity } from '@/lib/db/activity'
import { getFollowerPreview } from '@/lib/db/follow'
import { ManhwaCard } from '@/components/features/manhwa/ManhwaCard'
import { ActivityRow } from '@/components/features/social/ActivityRow'
import { PageContainer } from '@/components/layouts/PageContainer'

interface MyProfilePageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: MyProfilePageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'profile' })
  return { title: t('myProfile') }
}

export default async function MyProfilePage({ params }: MyProfilePageProps) {
  const { locale } = await params
  const sessionUser = await requireSession(locale)
  const t = await getTranslations({ locale, namespace: 'profile' })

  const user = await getUserById(sessionUser.id)
  if (!user) return null

  const [library, { activities: recentActivity }, followerPreview] = await Promise.all([
    getUserLibrary(user.id),
    getUserActivity(user.id, 1, 5),
    getFollowerPreview(user.id, 5),
  ])

  return (
    <PageContainer>
      {/* Profile header */}
      <div className="flex items-start gap-6">
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-elevated text-2xl text-text-muted">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username ?? ''}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            (user.username ?? '?').charAt(0).toUpperCase()
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl font-bold">
              {user.display_name ?? user.username}
            </h1>
            <Link
              href={`/${locale}/settings`}
              className="rounded-lg bg-elevated px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-border hover:text-text-primary"
            >
              {t('editProfile')}
            </Link>
          </div>
          <p className="text-sm text-text-muted">@{user.username}</p>
          {user.bio && (
            <p className="mt-2 text-sm text-text-secondary">{user.bio}</p>
          )}
          <p className="mt-1 text-xs text-text-muted">
            {t('memberSince', {
              date: new Date(user.created_at).toLocaleDateString(locale, {
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
          <div className="font-mono text-lg font-bold">{user._count.library}</div>
          <div className="text-xs text-text-muted">{t('titles')}</div>
        </div>
        <div>
          <div className="font-mono text-lg font-bold">{user._count.reviews}</div>
          <div className="text-xs text-text-muted">{t('reviewsWritten')}</div>
        </div>
        <Link href={`/${locale}/profile/${user.username}/followers`} className="transition-colors hover:text-accent">
          <div className="font-mono text-lg font-bold">{user._count.followers}</div>
          <div className="text-xs text-text-muted">{t('followers')}</div>
        </Link>
        <Link href={`/${locale}/profile/${user.username}/following`} className="transition-colors hover:text-accent">
          <div className="font-mono text-lg font-bold">{user._count.follows}</div>
          <div className="text-xs text-text-muted">{t('following')}</div>
        </Link>
      </div>

      {/* Follower avatar row */}
      {followerPreview.length > 0 && (
        <Link
          href={`/${locale}/profile/${user.username}/followers`}
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
          {user._count.followers > followerPreview.length && (
            <span className="text-xs text-text-muted">
              +{user._count.followers - followerPreview.length}
            </span>
          )}
        </Link>
      )}

      {/* Library */}
      {library.length > 0 && (
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">{t('myLibrary')}</h2>
            <Link
              href={`/${locale}/library`}
              className="text-sm text-accent hover:underline"
            >
              {t('viewAll')}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {library.slice(0, 12).map((entry) => (
              <ManhwaCard key={entry.id} manhwa={entry.manhwa} locale={locale} />
            ))}
          </div>
        </section>
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
    </PageContainer>
  )
}
