import { getTranslations } from 'next-intl/server'
import { requireSession } from '@/lib/auth/session'
import { getNotifications } from '@/lib/db/notification'
import { PageContainer } from '@/components/layouts/PageContainer'
import { NotificationList } from './notification-list'

interface NotificationsPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: NotificationsPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'notifications' })
  return { title: t('title') }
}

export default async function NotificationsPage({
  params,
  searchParams,
}: NotificationsPageProps) {
  const { locale } = await params
  const { page } = await searchParams
  const user = await requireSession(locale)
  const t = await getTranslations({ locale, namespace: 'notifications' })

  const currentPage = parseInt(page ?? '1', 10)
  const { notifications, total } = await getNotifications(user.id, currentPage, 30)
  const totalPages = Math.ceil(total / 30)

  return (
    <PageContainer>
      <h1 className="mb-6 font-display text-2xl font-bold">{t('title')}</h1>

      <NotificationList
        notifications={notifications}
        locale={locale}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </PageContainer>
  )
}
