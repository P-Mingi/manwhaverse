import Image from 'next/image'
import Link from 'next/link'

interface ArticleCardProps {
  article: {
    slug: string
    title_en: string
    title_fr: string | null
    excerpt_en: string | null
    excerpt_fr: string | null
    cover_image_url: string | null
    category: string
    reading_time: number | null
    published_at: Date | null
  }
  locale: string
}

export function ArticleCard({ article, locale }: ArticleCardProps) {
  const title = locale === 'fr' && article.title_fr ? article.title_fr : article.title_en
  const excerpt = locale === 'fr' && article.excerpt_fr ? article.excerpt_fr : article.excerpt_en

  return (
    <Link
      href={`/${locale}/blog/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-white/5 bg-[#0d0d16] card-hover"
    >
      {article.cover_image_url && (
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={article.cover_image_url}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full border border-[rgba(0,255,255,0.2)] bg-[rgba(0,255,255,0.06)] px-2 py-0.5 text-xs uppercase tracking-widest text-[#00bfff]">
            {article.category}
          </span>
          {article.reading_time && (
            <span className="text-xs text-[#6b6b88]">{article.reading_time} min</span>
          )}
        </div>
        <h3 className="mb-1 font-display text-xl tracking-wide text-[#e8e8f0] transition-colors group-hover:text-[#00ffff]">
          {title}
        </h3>
        {excerpt && (
          <p className="line-clamp-2 text-sm text-[#9999b8]">{excerpt}</p>
        )}
        {article.published_at && (
          <time className="mt-auto pt-3 text-xs text-[#6b6b88]">
            {new Date(article.published_at).toLocaleDateString(locale, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </time>
        )}
      </div>
    </Link>
  )
}
