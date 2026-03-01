import type { ManhwaWithRelations } from '@/lib/db/manhwa'

interface TropeListProps {
  tropes: ManhwaWithRelations['trope_links']
  locale: string
}

export function TropeList({ tropes, locale }: TropeListProps) {
  if (tropes.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {tropes.map((tl) => {
        const total = tl.upvotes + tl.downvotes
        const percentage = total > 0 ? Math.round((tl.upvotes / total) * 100) : null

        return (
          <a
            key={tl.trope.id}
            href={`/${locale}/trope/${tl.trope.slug}`}
            className="group relative overflow-hidden rounded-md bg-elevated px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-border"
          >
            <span>{tl.trope.name}</span>
            {percentage !== null && (
              <span className="ml-1.5 text-text-muted">{percentage}%</span>
            )}
          </a>
        )
      })}
    </div>
  )
}
