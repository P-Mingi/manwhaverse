import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getListBySlug, checkUserLikedList } from '@/lib/db/list'
import { getUser } from '@/lib/auth/session'
import { getCurrentContentFilter } from '@/lib/nsfw'
import Image from 'next/image'
import { PageContainer } from '@/components/layouts/PageContainer'
import { formatScore } from '@/lib/utils/formatScore'
import { shouldBlurCover } from '@/lib/nsfw'
import { LikeButton } from './LikeButton'
import { removeItemFromListAction } from '@/lib/actions/list'

export const revalidate = 300

interface ListDetailProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: ListDetailProps) {
  const { locale, slug } = await params
  const list = await getListBySlug(slug)
  if (!list || !list.is_public) return {}
  const title = list.og_title ?? list.title
  const author = list.user.display_name ?? list.user.username ?? 'ManhwaVerse'
  const description =
    list.description?.slice(0, 155) ??
    `A thematic manhwa list by ${author} with ${list.item_count} titles`
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://manhwaverse.com'
  const canonical = `${baseUrl}/${locale}/lists/${slug}`
  return {
    title: `${title} — ManhwaVerse`,
    description,
    alternates: {
      canonical,
      languages: {
        'en': `${baseUrl}/en/lists/${slug}`,
        'fr': `${baseUrl}/fr/lists/${slug}`,
      },
    },
    openGraph: {
      title,
      description: list.description ?? description,
      type: 'website',
      url: canonical,
    },
  }
}

export default async function ListDetailPage({ params }: ListDetailProps) {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: 'lists' })

  const [list, user, contentFilter] = await Promise.all([
    getListBySlug(slug),
    getUser(),
    getCurrentContentFilter(),
  ])

  if (!list || (!list.is_public && list.user_id !== user?.id)) notFound()

  const isOwner = !!user && user.id === list.user_id
  const userLiked = user ? await checkUserLikedList(user.id, list.id) : false

  const date = new Date(list.created_at).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://manhwaverse.com'
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: list.og_title ?? list.title,
    description: list.description ?? undefined,
    url: `${baseUrl}/${locale}/lists/${slug}`,
    numberOfItems: list.item_count,
    itemListElement: list.items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: locale === 'fr' ? (item.manhwa.title_fr ?? item.manhwa.title_en) : item.manhwa.title_en,
      url: `${baseUrl}/${locale}/manhwa/${item.manhwa.slug}`,
    })),
  }

  return (
    <PageContainer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      {/* Back */}
      <Link
        href={`/${locale}/lists`}
        className="mb-6 inline-block text-sm text-text-muted hover:text-text-primary"
      >
        {t('backToLists')}
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold sm:text-3xl">{list.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-text-muted">
              <span>
                {t('by')}{' '}
                {list.user.username ? (
                  <Link
                    href={`/${locale}/profile/${list.user.username}`}
                    className="text-text-secondary hover:text-crystal-blue"
                  >
                    {list.user.display_name ?? list.user.username}
                  </Link>
                ) : (
                  <span>{list.user.display_name ?? '?'}</span>
                )}
              </span>
              <span>·</span>
              <span>{date}</span>
              <span>·</span>
              <span>{t('items', { count: list.item_count })}</span>
            </div>
            {list.description && (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary">
                {list.description}
              </p>
            )}
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            <LikeButton
              listId={list.id}
              initialLiked={userLiked}
              initialCount={list.likes_count}
              likeLabel={t('likeList')}
              likedLabel={t('liked')}
              disabled={!user}
            />
            {isOwner && (
              <>
                <Link
                  href={`/${locale}/lists/${slug}/edit`}
                  className="rounded-lg bg-elevated px-4 py-2 text-sm font-medium text-text-secondary hover:bg-border"
                >
                  {t('editList')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      {list.items.length === 0 ? (
        <div className="py-20 text-center text-text-muted">{t('emptyList')}</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {list.items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-elevated px-3 py-3"
            >
              {/* Position number */}
              <span className="w-6 shrink-0 text-center font-mono text-sm font-bold text-text-muted">
                {index + 1}
              </span>

              {/* Cover */}
              <Link
                href={`/${locale}/manhwa/${item.manhwa.slug}`}
                className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-elevated"
              >
                {item.manhwa.cover_url && !shouldBlurCover(item.manhwa, contentFilter) ? (
                  <Image
                    src={item.manhwa.cover_url}
                    alt={item.manhwa.title_en}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-text-muted">—</div>
                )}
              </Link>

              {/* Info */}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <Link
                  href={`/${locale}/manhwa/${item.manhwa.slug}`}
                  className="line-clamp-2 text-sm font-semibold leading-snug text-text-primary hover:text-crystal-blue"
                >
                  {locale === 'fr' && item.manhwa.title_fr
                    ? item.manhwa.title_fr
                    : item.manhwa.title_en}
                </Link>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  {item.manhwa.display_score && (
                    <span>★ {formatScore(item.manhwa.display_score)}</span>
                  )}
                </div>
                {item.note && (
                  <p className="line-clamp-1 text-xs italic text-text-muted">{item.note}</p>
                )}
              </div>

              {/* Owner actions */}
              {isOwner && (
                <form
                  action={removeItemFromListAction.bind(null, list.id, item.manhwa.id)}
                  className="shrink-0"
                >
                  <button
                    type="submit"
                    className="text-xs text-error/60 hover:text-error"
                  >
                    {t('removeItem')}
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  )
}
