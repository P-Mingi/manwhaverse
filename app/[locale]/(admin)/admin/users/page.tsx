import Link from 'next/link'
import Image from 'next/image'
import { getAdminUsers } from '@/lib/db/admin'
import { toggleBanAction } from '@/lib/actions/admin'

export const metadata = { title: 'Admin — Users' }

interface UsersPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string; search?: string; filter?: string }>
}

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'real', label: 'Real' },
  { value: 'seed', label: 'Seed' },
  { value: 'banned', label: 'Banned' },
] as const

type FilterValue = (typeof FILTERS)[number]['value']

export default async function AdminUsersPage({ params, searchParams }: UsersPageProps) {
  const { locale } = await params
  const { page, search, filter } = await searchParams

  const currentPage = Math.max(1, parseInt(page ?? '1', 10))
  const currentFilter = (FILTERS.find((f) => f.value === filter)?.value ?? 'all') as FilterValue

  const { users, total, pages } = await getAdminUsers({
    page: currentPage,
    search: search || undefined,
    filter: currentFilter,
  })

  function buildHref(overrides: { page?: number; search?: string; filter?: string }) {
    const p = new URLSearchParams()
    const s = overrides.search ?? search ?? ''
    const f = overrides.filter ?? currentFilter
    const pg = overrides.page ?? currentPage
    if (s) p.set('search', s)
    if (f !== 'all') p.set('filter', f)
    if (pg > 1) p.set('page', String(pg))
    const qs = p.toString()
    return `/${locale}/admin/users${qs ? `?${qs}` : ''}`
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          Users{' '}
          <span className="text-sm font-normal text-text-muted">({total.toLocaleString()})</span>
        </h2>

        {/* Search */}
        <form method="GET" action={`/${locale}/admin/users`} className="flex gap-2">
          {currentFilter !== 'all' && (
            <input type="hidden" name="filter" value={currentFilter} />
          )}
          <input
            type="search"
            name="search"
            defaultValue={search ?? ''}
            placeholder="Search username, email…"
            className="rounded-md border border-border bg-elevated px-3 py-1.5 text-sm outline-none focus:border-crystal-blue"
          />
          <button
            type="submit"
            className="rounded-md bg-crystal-blue px-3 py-1.5 text-sm text-white hover:opacity-90"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={buildHref({ filter: f.value, page: 1 })}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              currentFilter === f.value
                ? 'bg-crystal-blue text-white'
                : 'bg-elevated text-text-secondary hover:bg-border'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-elevated text-left text-xs text-text-muted">
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Stats</th>
              <th className="px-3 py-2">Joined</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border last:border-0 hover:bg-elevated">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt=""
                        width={28}
                        height={28}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-elevated text-xs text-text-muted">
                        {(user.username ?? '?')[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{user.display_name ?? user.username ?? '—'}</p>
                      <p className="text-xs text-text-muted">@{user.username ?? 'no username'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 text-xs text-text-muted">{user.email ?? '—'}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-col gap-1">
                    {user.is_seed && (
                      <span className="inline-block rounded bg-elevated px-1.5 py-0.5 text-[10px] text-text-muted">
                        seed
                      </span>
                    )}
                    {user.is_banned && (
                      <span className="inline-block rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] text-red-500">
                        banned
                      </span>
                    )}
                    {!user.is_seed && !user.is_banned && (
                      <span className="inline-block rounded bg-green-500/10 px-1.5 py-0.5 text-[10px] text-green-600">
                        real
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 text-xs text-text-muted">
                  {user._count.library}L · {user._count.reviews}R · {user._count.followers}F
                </td>
                <td className="px-3 py-2 text-xs text-text-muted">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/${locale}/admin/users/${user.id}`}
                      className="text-xs text-crystal-blue hover:underline"
                    >
                      Edit
                    </Link>
                    {user.username && (
                      <Link
                        href={`/${locale}/profile/${user.username}`}
                        target="_blank"
                        className="text-xs text-text-muted hover:underline"
                      >
                        Profile ↗
                      </Link>
                    )}
                    <form
                      action={async () => {
                        'use server'
                        await toggleBanAction(user.id)
                      }}
                    >
                      <button
                        type="submit"
                        className={`text-xs hover:underline ${
                          user.is_banned ? 'text-green-500' : 'text-red-400'
                        }`}
                      >
                        {user.is_banned ? 'Unban' : 'Ban'}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="py-8 text-center text-sm text-text-muted">No users found.</p>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {currentPage > 1 && (
            <Link
              href={buildHref({ page: currentPage - 1 })}
              className="rounded-md bg-elevated px-3 py-1.5 text-xs hover:bg-border"
            >
              ← Prev
            </Link>
          )}
          <span className="text-xs text-text-muted">
            Page {currentPage} / {pages}
          </span>
          {currentPage < pages && (
            <Link
              href={buildHref({ page: currentPage + 1 })}
              className="rounded-md bg-elevated px-3 py-1.5 text-xs hover:bg-border"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
