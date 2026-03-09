import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getFanArtPostById, checkUserLikedFanArt, getArtistPosts } from '@/lib/db/fan-art'
import { getUser } from '@/lib/auth/session'
import { PageContainer } from '@/components/layouts/PageContainer'
import { FanArtLikeButton } from './FanArtLikeButton'
import { CommentForm } from './CommentForm'
import { deleteFanArtAction } from '@/lib/actions/fan-art'

export const revalidate = 60

interface ArtworkDetailProps {
  params: Promise<{ locale: string; postId: string }>
}

export async function generateMetadata({ params }: ArtworkDetailProps) {
  const { postId } = await params
  const post = await getFanArtPostById(postId)
  if (!post) return {}
  const firstImg = post.images[0]
  return {
    title: `${post.title}${post.manhwa ? ` | ${post.manhwa.title_en}` : ''} — Fan Art — ManhwaVerse`,
    description: post.description?.slice(0, 155) ?? `Fan art by @${post.user.username}`,
    openGraph: {
      type: 'article',
      images: firstImg ? [{ url: firstImg.image_url, alt: post.title }] : [],
    },
  }
}

export default async function ArtworkDetailPage({ params }: ArtworkDetailProps) {
  const { locale, postId } = await params
  const t = await getTranslations({ locale, namespace: 'artwork' })

  const [post, user] = await Promise.all([getFanArtPostById(postId), getUser()])
  if (!post) notFound()

  const isOwner = !!user && user.id === post.user.id
  const userLiked = user ? await checkUserLikedFanArt(user.id, post.id) : false

  // More from artist (exclude this post)
  const morePosts = (await getArtistPosts(post.user.id)).filter((p) => p.id !== post.id).slice(0, 4)

  const date = new Date(post.created_at).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <PageContainer className="max-w-4xl">
      {/* Back */}
      <Link href={`/${locale}/artwork`} className="mb-6 inline-block text-sm text-text-muted hover:text-text-primary">
        {t('backToGallery')}
      </Link>

      {/* Images */}
      <div className="mb-8 space-y-3">
        {post.images.map((img, i) => (
          <div key={i} className="overflow-hidden rounded-xl bg-elevated">
            {post.is_nsfw ? (
              <div className="relative">
                <img src={img.image_url} alt="" className="w-full h-auto blur-2xl" />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-center p-6">
                  <p className="font-bold text-white">{t('nsfwWarning')}</p>
                  <p className="mt-1 text-sm text-white/60">{t('nsfwBlurHint')}</p>
                </div>
              </div>
            ) : (
              <img
                src={img.image_url}
                alt={img.alt_text ?? post.title}
                className="w-full h-auto object-contain max-h-[80vh]"
              />
            )}
          </div>
        ))}
      </div>

      {/* Header info */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">{post.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-text-muted">
            <span>{t('by')} </span>
            {post.user.username ? (
              <Link href={`/${locale}/profile/${post.user.username}`} className="text-text-secondary hover:text-crystal-blue">
                {post.user.display_name ?? post.user.username}
              </Link>
            ) : (
              <span>{post.user.display_name ?? '?'}</span>
            )}
            <span>·</span>
            <span>{date}</span>
          </div>

          {post.description && (
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">{post.description}</p>
          )}

          {/* Linked manhwa */}
          {post.manhwa && (
            <div className="mt-3 text-sm">
              <span className="text-text-muted">{t('linkedTo')}: </span>
              <Link href={`/${locale}/manhwa/${post.manhwa.slug}`} className="text-crystal-blue hover:underline">
                {post.manhwa.title_en}
              </Link>
            </div>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/${locale}/artwork?tag=${tag}`}
                  className="rounded-full bg-elevated px-2.5 py-0.5 text-xs text-text-muted hover:text-text-secondary"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Credit block for non-original art */}
          {!post.is_original && post.credit_name && (
            <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
              <p className="font-medium text-amber-400">Original artist: {post.credit_name}</p>
              {post.credit_url && (
                <a href={post.credit_url} target="_blank" rel="noopener noreferrer" className="mt-0.5 block text-xs text-amber-400/70 hover:text-amber-400">
                  {post.credit_url}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <FanArtLikeButton
            postId={post.id}
            initialLiked={userLiked}
            initialCount={post.like_count}
            disabled={!user}
          />
          {isOwner && (
            <form action={deleteFanArtAction.bind(null, post.id, locale)}>
              <button
                type="submit"
                className="rounded-lg bg-elevated px-3 py-2 text-sm text-error/60 hover:text-error hover:bg-error/10"
              >
                {t('deletePost')}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Artist social links */}
      {post.user.is_artist && (
        <div className="mb-8 flex flex-wrap gap-2">
          {post.user.artist_twitter && (
            <a href={`https://twitter.com/${post.user.artist_twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
              className="rounded-md bg-elevated px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary">
              Twitter
            </a>
          )}
          {post.user.artist_instagram && (
            <a href={`https://instagram.com/${post.user.artist_instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
              className="rounded-md bg-elevated px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary">
              Instagram
            </a>
          )}
          {post.user.artist_pixiv && (
            <a href={post.user.artist_pixiv} target="_blank" rel="noopener noreferrer"
              className="rounded-md bg-elevated px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary">
              Pixiv
            </a>
          )}
          {post.user.artist_artstation && (
            <a href={post.user.artist_artstation} target="_blank" rel="noopener noreferrer"
              className="rounded-md bg-elevated px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary">
              ArtStation
            </a>
          )}
          {post.user.artist_portfolio_url && (
            <a href={post.user.artist_portfolio_url} target="_blank" rel="noopener noreferrer"
              className="rounded-md bg-elevated px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary">
              Portfolio
            </a>
          )}
        </div>
      )}

      {/* Comments */}
      <section className="mb-10">
        <h2 className="mb-4 font-display text-lg font-semibold">
          {t('comments')} ({post.comment_count})
        </h2>

        {user && (
          <div className="mb-6">
            <CommentForm postId={post.id} placeholder={t('writeComment')} submitLabel={t('postComment')} />
          </div>
        )}

        {post.comments.length === 0 ? (
          <p className="text-sm text-text-muted">{t('noComments')}</p>
        ) : (
          <div className="space-y-4">
            {post.comments.map((comment) => (
              <div key={comment.id} className="space-y-3">
                <div className="rounded-xl bg-elevated p-4">
                  <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
                    <span className="font-medium text-text-secondary">
                      @{comment.user.username ?? comment.user.display_name ?? '?'}
                    </span>
                    <span>·</span>
                    <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-text-primary">{comment.content}</p>
                </div>

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div className="ml-6 space-y-2">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="rounded-xl bg-surface p-3 border border-border">
                        <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
                          <span className="font-medium text-text-secondary">
                            @{reply.user.username ?? reply.user.display_name ?? '?'}
                          </span>
                          <span>·</span>
                          <span>{new Date(reply.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-text-primary">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* More from artist */}
      {morePosts.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-lg font-semibold">{t('sameArtist')}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {morePosts.map((p) => {
              const img = p.images[0]
              if (!img) return null
              return (
                <Link key={p.id} href={`/${locale}/artwork/${p.id}`} className="group overflow-hidden rounded-xl">
                  <img
                    src={img.thumb_url}
                    alt={p.title}
                    className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </PageContainer>
  )
}
