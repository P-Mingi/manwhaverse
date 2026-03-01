import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getUserByUsername } from '@/lib/db/user'
import { getUserLibrary } from '@/lib/db/library'
import { ManhwaCard } from '@/components/features/ManhwaCard'
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

  const user = await getUserByUsername(username)
  if (!user) notFound()

  const recentLibrary = await getUserLibrary(user.id)

  return (
    <PageContainer>
      {/* Profile header */}
      <div className="flex items-start gap-6">
        {/* Avatar */}
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
          <h1 className="font-display text-xl font-bold">
            {user.display_name ?? user.username}
          </h1>
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
        <div>
          <div className="font-mono text-lg font-bold">{user._count.followers}</div>
          <div className="text-xs text-text-muted">{t('followers')}</div>
        </div>
        <div>
          <div className="font-mono text-lg font-bold">{user._count.follows}</div>
          <div className="text-xs text-text-muted">{t('following')}</div>
        </div>
      </div>

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
