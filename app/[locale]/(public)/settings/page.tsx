import { getTranslations } from 'next-intl/server'
import { requireSession } from '@/lib/auth/session'
import { getUserById } from '@/lib/db/user'
import { PageContainer } from '@/components/layouts/PageContainer'
import { SettingsForm } from './settings-form'

interface SettingsPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: SettingsPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'settings' })
  return { title: t('title') }
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { locale } = await params
  const sessionUser = await requireSession(locale)
  const t = await getTranslations({ locale, namespace: 'settings' })

  const user = await getUserById(sessionUser.id)
  if (!user) return null

  return (
    <PageContainer>
      <h1 className="font-display text-2xl font-bold">{t('title')}</h1>
      <div className="mt-6 max-w-lg">
        <SettingsForm
          initialData={{
            avatar_url: user.avatar_url ?? null,
            display_name: user.display_name ?? '',
            bio: user.bio ?? '',
            locale: user.locale,
            content_filter: user.content_filter,
            notif_new_chapter: user.notif_new_chapter,
            notif_review_liked: user.notif_review_liked,
            notif_new_follower: user.notif_new_follower,
            notif_weekly_digest: user.notif_weekly_digest,
            notif_email: user.notif_email,
          }}
        />
      </div>
    </PageContainer>
  )
}
