import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { requireSession } from '@/lib/auth/session'
import { getNotifications } from '@/lib/db/notification'
import { markAllAsRead } from '@/lib/db/notification'
import { PageContainer } from '@/components/layouts/PageContainer'
import { FriendRequestActions } from '@/components/features/social/FriendRequestActions'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'notifications' })
  return { title: t('title') }
}

type NotifData = Record<string, string | null>

function NotificationItem({
  type,
  data,
  read,
  date,
  locale,
}: {
  type: string
  data: NotifData
  read: boolean
  date: Date
  locale: string
}) {
  const dateStr = new Date(date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  let icon = '🔔'
  let content: React.ReactNode = null

  if (type === 'new_follower') {
    icon = '👤'
    const name = data.follower_display_name ?? data.follower_username ?? '?'
    content = (
      <>
        <Link
          href={`/${locale}/profile/${data.follower_username}`}
          style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}
        >
          {name}
        </Link>{' '}
        {locale === 'fr' ? 'vous suit maintenant.' : 'started following you.'}
      </>
    )
  } else if (type === 'review_liked') {
    icon = '❤️'
    const name = data.liker_display_name ?? data.liker_username ?? '?'
    content = (
      <>
        <Link
          href={`/${locale}/profile/${data.liker_username}`}
          style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}
        >
          {name}
        </Link>{' '}
        {locale === 'fr' ? 'a aimé votre critique de' : 'liked your review of'}{' '}
        <Link
          href={`/${locale}/manhwa/${data.manhwa_slug}`}
          style={{ fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}
        >
          {data.manhwa_title}
        </Link>
        .
      </>
    )
  } else if (type === 'new_chapter') {
    icon = '📖'
    content = (
      <>
        {locale === 'fr' ? 'Nouveau chapitre disponible pour' : 'New chapter available for'}{' '}
        <Link
          href={`/${locale}/manhwa/${data.manhwa_slug}`}
          style={{ fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}
        >
          {data.manhwa_title}
        </Link>
        .
      </>
    )
  } else if (type === 'friend_request') {
    icon = '👋'
    const name = data.sender_display_name ?? data.sender_username ?? '?'
    content = (
      <>
        <Link
          href={`/${locale}/profile/${data.sender_username}`}
          style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}
        >
          {name}
        </Link>{' '}
        {locale === 'fr' ? 'vous a envoyé une demande d\'ami.' : 'sent you a friend request.'}
        {data.request_id && (
          <FriendRequestActions requestId={data.request_id} locale={locale} />
        )}
      </>
    )
  } else if (type === 'friend_request_accepted') {
    icon = '🤝'
    const name = data.accepter_display_name ?? data.accepter_username ?? '?'
    content = (
      <>
        <Link
          href={`/${locale}/profile/${data.accepter_username}`}
          style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}
        >
          {name}
        </Link>{' '}
        {locale === 'fr' ? 'a accepté votre demande d\'ami.' : 'accepted your friend request.'}
      </>
    )
  } else {
    content = <span>{type}</span>
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 16px',
        background: read ? 'var(--bg-card)' : 'var(--bg-elevated)',
        borderRadius: '10px',
        border: `1px solid ${read ? 'var(--border)' : 'var(--accent)'}`,
        opacity: read ? 0.75 : 1,
      }}
    >
      <span style={{ fontSize: '20px', flexShrink: 0, lineHeight: 1.2 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {content}
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>{dateStr}</p>
      </div>
      {!read && (
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--accent)',
            flexShrink: 0,
            marginTop: 4,
          }}
        />
      )}
    </div>
  )
}

export default async function NotificationsPage({ params }: Props) {
  const { locale } = await params
  const sessionUser = await requireSession(locale)
  const t = await getTranslations({ locale, namespace: 'notifications' })

  const { notifications } = await getNotifications(sessionUser.id, 1, 50)

  // Auto-mark all as read when page is opened
  await markAllAsRead(sessionUser.id)

  return (
    <PageContainer>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '20px',
          }}
        >
          {t('title')}
        </h1>

        {notifications.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 24px',
              color: 'var(--text-muted)',
              fontSize: '14px',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔔</div>
            <p style={{ margin: 0 }}>{t('empty')}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {notifications.map((n) => (
              <NotificationItem
                key={n.id}
                type={n.type}
                data={n.data as NotifData}
                read={n.read}
                date={n.created_at}
                locale={locale}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  )
}
