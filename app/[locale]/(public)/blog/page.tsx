import { getTranslations } from 'next-intl/server'
import { getPublishedArticles } from '@/lib/db/article'
import { ArticleCard } from '@/components/features/blog/ArticleCard'
import { PageContainer } from '@/components/layouts/PageContainer'
import Link from 'next/link'
import type { ArticleCategory } from '@prisma/client'

export const revalidate = 600

interface BlogPageProps {
  params: Promise<{ locale: string }>
}

const CATEGORIES: ArticleCategory[] = ['NEWS', 'GUIDE', 'LIST', 'OPINION', 'ANALYSIS']

export async function generateMetadata({ params }: BlogPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })
  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })
  const articles = await getPublishedArticles()

  return (
    <PageContainer>
      <h1 className="mb-2 font-display text-2xl font-bold">{t('title')}</h1>
      <p className="mb-6 text-sm text-text-secondary">{t('description')}</p>

      {/* Category filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href={`/${locale}/blog`}
          className="rounded-full bg-crystal-blue px-3 py-1 text-xs font-medium text-white"
        >
          {t('all')}
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/${locale}/blog/category/${cat.toLowerCase()}`}
            className="rounded-full bg-elevated px-3 py-1 text-xs font-medium text-text-secondary hover:bg-border"
          >
            {t(`category.${cat}`)}
          </Link>
        ))}
      </div>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-text-muted">
          {t('noArticles')}
        </div>
      )}
    </PageContainer>
  )
}
