'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { adminEditUserAction, adminEditReviewAction } from '@/lib/actions/admin-user'

interface UserData {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  reviews: {
    id: string
    content: string | null
    created_at: string
    manhwa: { title_en: string; slug: string } | null
  }[]
}

export default function AdminEditUserPage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string
  const locale = params.locale as string

  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const [avatarPreview, setAvatarPreview] = useState('')
  const [editingReview, setEditingReview] = useState<string | null>(null)
  const [reviewContent, setReviewContent] = useState('')
  const [reviewPending, startReviewTransition] = useTransition()
  const [reviewSaved, setReviewSaved] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/admin/user/${username}`)
      .then((r) => r.json())
      .then((data) => {
        setUser(data)
        setAvatarPreview(data.avatar_url ?? '')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [username])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSaved(false)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await adminEditUserAction(user!.id, fd)
      if ('error' in res) {
        setError(res.error ?? '')
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        if (res.username !== username) {
          router.replace(`/${locale}/admin/users/${res.username}`)
        }
      }
    })
  }

  function handleEditReview(review: UserData['reviews'][0]) {
    setEditingReview(review.id)
    setReviewContent(review.content ?? '')
  }

  function handleSaveReview(reviewId: string) {
    const fd = new FormData()
    fd.set('content', reviewContent)
    startReviewTransition(async () => {
      const res = await adminEditReviewAction(reviewId, fd)
      if ('error' in res) {
        setError(res.error ?? '')
      } else {
        setReviewSaved(reviewId)
        setEditingReview(null)
        setUser((prev) =>
          prev
            ? {
                ...prev,
                reviews: prev.reviews.map((r) =>
                  r.id === reviewId ? { ...r, content: reviewContent } : r
                ),
              }
            : prev
        )
        setTimeout(() => setReviewSaved(null), 2000)
      }
    })
  }

  if (loading) return <div className="p-8 text-text-muted">Loading...</div>
  if (!user) return <div className="p-8 text-error">User not found</div>

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-sm text-text-muted hover:text-text-primary"
        >
          ← Back
        </button>
        <h1 className="font-display text-xl font-bold">Edit @{username}</h1>
      </div>

      {/* Profile edit form */}
      <form onSubmit={handleSubmit} className="mb-10 space-y-4 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-semibold text-text-primary">Profile</h2>

        {/* Avatar */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Profile Picture URL</label>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 overflow-hidden rounded-full bg-elevated text-text-muted items-center justify-center">
              {avatarPreview
                ? <img src={avatarPreview} alt="preview" className="h-full w-full object-cover" />
                : <span className="text-lg">{(user.username ?? '?').charAt(0).toUpperCase()}</span>
              }
            </div>
            <input
              name="avatar_url"
              type="url"
              defaultValue={user.avatar_url ?? ''}
              placeholder="https://..."
              className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text-primary focus:border-crystal-blue focus:outline-none"
              onChange={(e) => setAvatarPreview(e.target.value)}
            />
          </div>
        </div>

        {/* Display name */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Display Name</label>
          <input
            name="display_name"
            type="text"
            defaultValue={user.display_name ?? ''}
            maxLength={50}
            required
            className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text-primary focus:border-crystal-blue focus:outline-none"
          />
        </div>

        {/* Username */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Username (nametag)</label>
          <div className="flex items-center gap-2">
            <span className="text-text-muted">@</span>
            <input
              name="username"
              type="text"
              defaultValue={user.username ?? ''}
              maxLength={30}
              pattern="[a-z0-9_]+"
              required
              className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text-primary focus:border-crystal-blue focus:outline-none"
            />
          </div>
          <p className="mt-1 text-xs text-text-muted">Lowercase letters, numbers and underscores only</p>
        </div>

        {/* Bio */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Bio</label>
          <textarea
            name="bio"
            defaultValue={user.bio ?? ''}
            maxLength={300}
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text-primary focus:border-crystal-blue focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-error">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-crystal-blue px-4 py-2 text-sm font-medium text-white hover:bg-crystal-blue/90 disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save Profile'}
          </button>
          {saved && <span className="text-sm text-green-400">✓ Saved</span>}
        </div>
      </form>

      {/* Reviews */}
      {user.reviews.length > 0 && (
        <div>
          <h2 className="mb-4 font-semibold text-text-primary">Reviews ({user.reviews.length})</h2>
          <div className="space-y-3">
            {user.reviews.map((review) => (
              <div key={review.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary">
                    {review.manhwa?.title_en ?? 'Unknown'}
                  </span>
                  <div className="flex items-center gap-3">
                    {reviewSaved === review.id && (
                      <span className="text-xs text-green-400">✓ Saved</span>
                    )}
                    {editingReview === review.id ? (
                      <>
                        <button
                          onClick={() => handleSaveReview(review.id)}
                          disabled={reviewPending}
                          className="text-xs text-crystal-blue hover:underline disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingReview(null)}
                          className="text-xs text-text-muted hover:underline"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEditReview(review)}
                        className="text-xs text-text-muted hover:text-text-primary"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
                {editingReview === review.id ? (
                  <textarea
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text-primary focus:border-crystal-blue focus:outline-none"
                  />
                ) : (
                  <p className="text-sm text-text-secondary line-clamp-3">{review.content}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
