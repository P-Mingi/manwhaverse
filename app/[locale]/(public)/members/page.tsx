import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { searchUsers } from '@/lib/db/user'
import { getUser } from '@/lib/auth/session'
import { isFollowing } from '@/lib/db/follow'
import { FollowButton } from '@/components/features/FollowButton'
import { PageContainer } from '@/components/layouts/PageContainer'

export const revalidate = 60

interface MembersPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string; page?: string }>
}

export async function generateMetadata({ params }: MembersPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'members' })
  return { title: t('title') }
}

export default async function MembersPage({ params, searchParams }: MembersPageProps) {
  const { locale } = await params
  const { q, page } = await searchParams
  const t = await getTranslations({ locale, namespace: 'members' })

  const currentPage = parseInt(page ?? '1', 10)
  const currentUser = await getUser()

  const { users, total } = await searchUsers({ query: q?.trim(), page: currentPage })
  const totalPages = Math.ceil(total / 24)

  // Check follow status for each user in results
  const followStatuses = currentUser
    ? await Promise.all(
        users.map((u) =>
          u.id === currentUser.id ? Promise.resolve(false) : isFollowing(currentUser.id, u.id)
        )
      )
    : users.map(() => false)

  function href(overrides: { q?: string; page?: string }) {
    const p = new URLSearchParams()
    const nq = 'q' in overrides ? overrides.q : q
    if (nq) p.set('q', nq)
    const np = overrides.page
    if (np && np !== '1') p.set('page', np)
    const qs = p.toString()
    return `/${locale}/members${qs ? `?${qs}` : ''}`
  }

  return (
    <PageContainer>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">{t('title')}</h1>
        {total > 0 && !q && (
          <span className="text-sm text-text-muted">{total} {t('membersCount')}</span>
        )}
      </div>

      {/* Search bar */}
      <form method="GET" className="mb-8">
        <div className="flex gap-2">
          <input
            name="q"
            defaultValue={q ?? ''}
            placeholder={t('searchPlaceholder')}
            className="flex-1 rounded-lg border border-border bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-[rgba(0,255,255,0.4)] focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg border border-[rgba(0,255,255,0.3)] px-5 py-2.5 text-sm font-medium text-[#00ffff] transition-colors hover:bg-[rgba(0,255,255,0.08)]"
          >
            {t('search')}
          </button>
          {q && (
            <Link
              href={`/${locale}/members`}
              className="rounded-lg border border-border px-4 py-2.5 text-sm text-text-secondary hover:bg-elevated"
            >
              {t('clear')}
            </Link>
          )}
        </div>
      </form>

      {q && (
        <p className="mb-4 text-sm text-text-muted">
          {total} {total === 1 ? t('result') : t('results')} {t('for')} &quot;{q}&quot;
        </p>
      )}

      {users.length === 0 ? (
        <div className="py-20 text-center text-text-muted">{t('noUsers')}</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((u, i) => {
            const isOwn = currentUser?.id === u.id
            const following = followStatuses[i]

            return (
              <div key={u.id} className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
                {/* Avatar */}
                <Link href={`/${locale}/profile/${u.username}`} className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-elevated text-base font-medium text-text-muted overflow-hidden">
                    {u.avatar_url ? (
                      <Image src={u.avatar_url} alt={u.username ?? ''} width={48} height={48} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      (u.username ?? '?').charAt(0).toUpperCase()
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <Link href={`/${locale}/profile/${u.username}`} className="group">
                    <p className="truncate font-semibold text-text-primary group-hover:text-[#00ffff]">
                      {u.display_name ?? u.username}
                    </p>
                    <p className="text-xs text-text-muted">@{u.username}</p>
                  </Link>

                  {u.bio && (
                    <p className="mt-1 line-clamp-2 text-xs text-text-secondary">{u.bio}</p>
                  )}

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-text-muted">
                      {u._count.followers} {t('followers')} · {u._count.library} {t('titles')}
                    </span>

                    {!isOwn && (
                      <FollowButton
                        targetUserId={u.id}
                        initialFollowing={following ?? false}
                        isLoggedIn={!!currentUser}
                      />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (() => {
        const windowSize = 10
        let start = Math.max(1, currentPage - Math.floor(windowSize / 2))
        let end = start + windowSize - 1
        if (end > totalPages) { end = totalPages; start = Math.max(1, end - windowSize + 1) }
        const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)
        return (
          <div className="mt-8 flex justify-center gap-2">
            {currentPage > 1 && (
              <Link href={href({ page: String(currentPage - 1) })} className="rounded-md px-3 py-1.5 text-sm bg-elevated text-text-secondary hover:bg-border">‹</Link>
            )}
            {pages.map((p) => (
              <Link key={p} href={href({ page: String(p) })} className={`rounded-md px-3 py-1.5 text-sm ${p === currentPage ? 'bg-[rgba(0,255,255,0.08)] border border-[rgba(0,255,255,0.3)] text-[#00ffff]' : 'bg-elevated text-text-secondary hover:bg-border'}`}>
                {p}
              </Link>
            ))}
            {currentPage < totalPages && (
              <Link href={href({ page: String(currentPage + 1) })} className="rounded-md px-3 py-1.5 text-sm bg-elevated text-text-secondary hover:bg-border">›</Link>
            )}
          </div>
        )
      })()}
    </PageContainer>
  )
}
