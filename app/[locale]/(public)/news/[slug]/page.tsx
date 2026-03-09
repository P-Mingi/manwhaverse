import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import Image from 'next/image'
import { getArticleBySlug, incrementArticleViews } from '@/lib/db/article'
import { MarkdownRenderer } from '@/components/features/blog/MarkdownRenderer'
import { PageContainer } from '@/components/layouts/PageContainer'
import { JsonLd } from '@/components/ui/JsonLd'
import { generateNewsArticleJsonLd, generateBreadcrumbJsonLd } from '@/lib/seo/jsonld'
import { isAdmin } from '@/lib/auth/session'

const BASE_URL = 'https://manhwaverse.com'

interface NewsArticlePageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: NewsArticlePageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return { title: 'Not Found' }

  const title = locale === 'fr' && article.title_fr ? article.title_fr : article.title_en
  const description = locale === 'fr' && article.excerpt_fr ? article.excerpt_fr : article.excerpt_en
  const seoTitle = `${title} — ManhwaVerse News`
  const images = article.cover_image_url
    ? [{ url: article.cover_image_url, width: 1200, height: 630, alt: title }]
    : []

  return {
    title: seoTitle,
    description: description ?? undefined,
    alternates: {
      canonical: `${BASE_URL}/${locale}/news/${slug}`,
      languages: {
        en: `${BASE_URL}/en/news/${slug}`,
        fr: `${BASE_URL}/fr/news/${slug}`,
      },
    },
    openGraph: {
      title: seoTitle,
      description: description ?? undefined,
      type: 'article',
      url: `${BASE_URL}/${locale}/news/${slug}`,
      siteName: 'ManhwaVerse',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: description ?? undefined,
      images: images.map((i) => i.url),
    },
  }
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const { locale, slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article || article.category !== 'NEWS') notFound()

  const [t, tBlog, adminOk] = await Promise.all([
    getTranslations({ locale, namespace: 'news' }),
    getTranslations({ locale, namespace: 'blog' }),
    isAdmin(),
  ])

  incrementArticleViews(article.id).catch(() => {})

  const title = locale === 'fr' && article.title_fr ? article.title_fr : article.title_en
  const content = locale === 'fr' && article.content_fr ? article.content_fr : article.content_en

  const articleJsonLd = generateNewsArticleJsonLd(article, locale)
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: `/${locale}` },
    { name: 'News', url: `/${locale}/news` },
    { name: title, url: `/${locale}/news/${article.slug}` },
  ])

  return (
    <PageContainer>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <article className="mx-auto max-w-3xl">
        {/* Admin bar */}
        {adminOk && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-2 text-xs">
            <span className="font-medium text-amber-400">Admin</span>
            <Link
              href={`/${locale}/admin/article/${article.id}/edit`}
              className="rounded bg-amber-500/20 px-2 py-0.5 text-amber-400 hover:bg-amber-500/30"
            >
              Edit article
            </Link>
          </div>
        )}

        {/* Breadcrumb */}
        <nav className="mb-4 text-xs text-text-muted">
          <Link href={`/${locale}/news`} className="hover:text-crystal-blue">
            {t('title')}
          </Link>
          <span className="mx-1">/</span>
          <span className="text-text-secondary">{title}</span>
        </nav>

        {/* Cover image */}
        {article.cover_image_url && (
          <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={article.cover_image_url}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
              {t('label')}
            </span>
            {article.reading_time && (
              <span className="text-xs text-text-muted">{article.reading_time} min read</span>
            )}
          </div>
          <h1 className="mb-3 font-display text-3xl font-bold leading-tight">{title}</h1>
          <div className="flex items-center gap-3 text-sm text-text-muted">
            <span>{article.author_name}</span>
            {article.published_at && (
              <>
                <span>·</span>
                <time>
                  {new Date(article.published_at).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </>
            )}
          </div>
        </header>

        {/* Content */}
        <MarkdownRenderer content={content} />

        {/* Related manhwa */}
        {article.manhwa_links.length > 0 && (
          <div className="mt-10 rounded-lg border border-border bg-surface p-6">
            <h2 className="mb-4 font-display text-lg font-semibold">{tBlog('relatedManhwa')}</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {article.manhwa_links.map(({ manhwa }) => (
                <Link
                  key={manhwa.id}
                  href={`/${locale}/manhwa/${manhwa.slug}`}
                  className="group flex items-center gap-3"
                >
                  {manhwa.cover_url && (
                    <Image
                      src={manhwa.cover_url}
                      alt={locale === 'fr' && manhwa.title_fr ? manhwa.title_fr : manhwa.title_en}
                      width={40}
                      height={56}
                      className="rounded object-cover"
                    />
                  )}
                  <span className="text-sm font-medium text-text-primary group-hover:text-crystal-blue">
                    {locale === 'fr' && manhwa.title_fr ? manhwa.title_fr : manhwa.title_en}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </PageContainer>
  )
}
