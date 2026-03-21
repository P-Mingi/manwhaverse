import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getAdminUser } from '@/lib/db/admin'
import { updateUserAction, toggleBanAction } from '@/lib/actions/admin'

interface UserEditPageProps {
  params: Promise<{ locale: string; id: string }>
}

export const metadata = { title: 'Admin — Edit User' }

export default async function AdminUserEditPage({ params }: UserEditPageProps) {
  const { locale, id } = await params
  const user = await getAdminUser(id)
  if (!user) notFound()

  const update = updateUserAction.bind(null, id)

  return (
    <div className="max-w-lg">
      <div className="mb-4 flex items-center gap-2 text-sm text-text-muted">
        <Link href={`/${locale}/admin/users`} className="hover:text-text-primary">
          ← Users
        </Link>
      </div>

      <div className="mb-6 flex items-center gap-4">
        {user.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt=""
            width={56}
            height={56}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-elevated text-lg font-bold text-text-muted">
            {(user.username ?? '?')[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-semibold">{user.display_name ?? user.username}</p>
          <p className="text-sm text-text-muted">@{user.username}</p>
          <div className="mt-1 flex gap-1.5">
            {user.is_seed && (
              <span className="rounded bg-elevated px-1.5 py-0.5 text-[10px] text-text-muted">
                seed
              </span>
            )}
            {user.is_banned && (
              <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] text-red-500">
                banned
              </span>
            )}
          </div>
        </div>
        {user.username && (
          <Link
            href={`/${locale}/profile/${user.username}`}
            target="_blank"
            className="ml-auto text-xs text-crystal-blue hover:underline"
          >
            View profile ↗
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="mb-6 flex gap-4 text-sm text-text-muted">
        <span>{user._count.library} in library</span>
        <span>{user._count.reviews} reviews</span>
        <span>{user._count.followers} followers</span>
        <span>{user._count.follows} following</span>
      </div>

      {/* Edit form */}
      <form action={update} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">
            Display Name
          </label>
          <input
            type="text"
            name="display_name"
            defaultValue={user.display_name ?? ''}
            maxLength={50}
            className="w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm outline-none focus:border-crystal-blue"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">
            Username{' '}
            {!user.is_seed && (
              <span className="text-text-muted">(locked — real user)</span>
            )}
          </label>
          <input
            type="text"
            name="username"
            defaultValue={user.username ?? ''}
            maxLength={30}
            disabled={!user.is_seed}
            className="w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm outline-none focus:border-crystal-blue disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">
            Avatar URL
          </label>
          <input
            type="url"
            name="avatar_url"
            defaultValue={user.avatar_url ?? ''}
            placeholder="https://example.com/avatar.jpg"
            className="w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm outline-none focus:border-crystal-blue"
          />
          <p className="mt-0.5 text-xs text-text-muted">Paste any image URL to update the avatar</p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">Bio</label>
          <textarea
            name="bio"
            defaultValue={user.bio ?? ''}
            maxLength={300}
            rows={3}
            className="w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm outline-none focus:border-crystal-blue"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-crystal-blue px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Save Changes
          </button>
        </div>
      </form>

      {/* Ban toggle */}
      <div className="mt-8 border-t border-border pt-6">
        <h3 className="mb-2 text-sm font-semibold text-text-secondary">Moderation</h3>
        <form
          action={async () => {
            'use server'
            await toggleBanAction(id)
          }}
        >
          <button
            type="submit"
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              user.is_banned
                ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
            }`}
          >
            {user.is_banned ? 'Unban this user' : 'Ban this user'}
          </button>
        </form>
      </div>
    </div>
  )
}
