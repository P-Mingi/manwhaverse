import { getTranslations } from 'next-intl/server'
import { getPublishedArticles } from '@/lib/db/article'
import { ArticleCard } from '@/components/features/blog/ArticleCard'
import { PageContainer } from '@/components/layouts/PageContainer'
import Link from 'next/link'
import type { ArticleCategory } from '@prisma/client'

export const revalidate = 600

interface CategoryPageProps {
  params: Promise<{ locale: string; cat: string }>
}

const VALID_CATEGORIES: ArticleCategory[] = ['NEWS', 'GUIDE', 'LIST', 'OPINION', 'ANALYSIS']

export async function generateStaticParams() {
  return VALID_CATEGORIES.flatMap((cat) => [
    { locale: 'en', cat: cat.toLowerCase() },
    { locale: 'fr', cat: cat.toLowerCase() },
  ])
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, cat } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })

  const category = cat.toUpperCase() as ArticleCategory
  if (!VALID_CATEGORIES.includes(category)) {
    return (
      <PageContainer>
        <div className="py-20 text-center text-text-muted">Category not found</div>
      </PageContainer>
    )
  }

  const articles = await getPublishedArticles(category)

  return (
    <PageContainer>
      <div className="mb-6">
        <Link href={`/${locale}/blog`} className="text-xs text-text-muted hover:text-crystal-blue">
          &larr; {t('title')}
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold">
          {t(`category.${category}`)}
        </h1>
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
