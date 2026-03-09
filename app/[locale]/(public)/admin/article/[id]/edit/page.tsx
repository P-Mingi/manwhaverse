import { notFound, redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'
import { updateArticle, deleteArticle } from '@/lib/actions/admin-article'

export const dynamic = 'force-dynamic'

interface EditArticlePageProps {
  params: Promise<{ locale: string; id: string }>
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { locale, id } = await params

  if (!(await isAdmin())) notFound()

  const article = await prisma.article.findUnique({
    where: { id },
    select: {
      id: true, slug: true, title_en: true, title_fr: true,
      content_en: true, content_fr: true,
      excerpt_en: true, excerpt_fr: true,
      cover_image_url: true, category: true, status: true,
    },
  })

  if (!article) notFound()

  const backHref = article.category === 'NEWS'
    ? `/${locale}/news/${article.slug}`
    : `/${locale}/blog/${article.slug}`

  async function handleUpdate(formData: FormData) {
    'use server'
    const data = {
      title_en: formData.get('title_en') as string,
      title_fr: formData.get('title_fr') as string || undefined,
      content_en: formData.get('content_en') as string,
      content_fr: formData.get('content_fr') as string || undefined,
      excerpt_en: formData.get('excerpt_en') as string || undefined,
      excerpt_fr: formData.get('excerpt_fr') as string || undefined,
      cover_image_url: formData.get('cover_image_url') as string || undefined,
    }
    await updateArticle(id, data)
    redirect(backHref)
  }

  async function handleDelete() {
    'use server'
    await deleteArticle(id)
    redirect(`/${locale}/admin/news`)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Edit Article</h1>
        <span className="rounded-full bg-elevated px-3 py-1 text-xs text-text-muted uppercase">
          {article.category} · {article.status}
        </span>
      </div>

      <form action={handleUpdate} className="space-y-5">
        {/* Title EN */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Title (EN)</label>
          <input
            name="title_en"
            defaultValue={article.title_en}
            required
            className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-crystal-blue focus:outline-none"
          />
        </div>

        {/* Title FR */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Title (FR)</label>
          <input
            name="title_fr"
            defaultValue={article.title_fr ?? ''}
            className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-crystal-blue focus:outline-none"
          />
        </div>

        {/* Excerpt EN */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Excerpt (EN)</label>
          <textarea
            name="excerpt_en"
            defaultValue={article.excerpt_en ?? ''}
            rows={2}
            className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-crystal-blue focus:outline-none"
          />
        </div>

        {/* Excerpt FR */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Excerpt (FR)</label>
          <textarea
            name="excerpt_fr"
            defaultValue={article.excerpt_fr ?? ''}
            rows={2}
            className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-crystal-blue focus:outline-none"
          />
        </div>

        {/* Cover image URL */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Cover Image URL</label>
          <input
            name="cover_image_url"
            defaultValue={article.cover_image_url ?? ''}
            type="url"
            className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-crystal-blue focus:outline-none"
          />
        </div>

        {/* Content EN */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Content (EN) — Markdown</label>
          <textarea
            name="content_en"
            defaultValue={article.content_en}
            rows={20}
            required
            className="w-full rounded-lg border border-border bg-elevated px-3 py-2 font-mono text-sm text-text-primary placeholder-text-muted focus:border-crystal-blue focus:outline-none"
          />
        </div>

        {/* Content FR */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Content (FR) — Markdown</label>
          <textarea
            name="content_fr"
            defaultValue={article.content_fr ?? ''}
            rows={20}
            className="w-full rounded-lg border border-border bg-elevated px-3 py-2 font-mono text-sm text-text-primary placeholder-text-muted focus:border-crystal-blue focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <button
            type="submit"
            className="rounded-lg bg-crystal-blue px-6 py-2 text-sm font-semibold text-background hover:opacity-90"
          >
            Save changes
          </button>
          <a href={backHref} className="text-sm text-text-muted hover:text-text-primary">
            Cancel
          </a>
        </div>
      </form>

      {/* Danger zone */}
      <div className="mt-10 rounded-lg border border-error/30 bg-error/5 p-5">
        <p className="mb-3 text-sm font-medium text-error">Danger zone</p>
        <form action={handleDelete}>
          <button
            type="submit"
            className="rounded-lg border border-error/40 px-4 py-2 text-sm text-error hover:bg-error/10"
          >
            Delete this article permanently
          </button>
        </form>
      </div>
    </div>
  )
}
