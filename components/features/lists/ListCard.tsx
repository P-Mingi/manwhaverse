import Image from 'next/image'
import Link from 'next/link'
import { formatCount } from '@/lib/utils/formatCount'

interface ListCardProps {
  list: {
    slug: string
    title: string
    item_count: number
    likes_count: number
    user: {
      username: string | null
      display_name: string | null
    }
    preview_covers: string[]
  }
  locale: string
}

export function ListCard({ list, locale }: ListCardProps) {
  const author = list.user.display_name ?? list.user.username ?? 'Anonymous'
  const covers = list.preview_covers.slice(0, 4)

  return (
    <Link
      href={`/${locale}/lists/${list.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-electric-border bg-card card-hover"
    >
      {/* 2×2 cover mosaic */}
      <div className="relative aspect-video w-full overflow-hidden bg-elevated">
        {covers.length > 0 ? (
          <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-px bg-void">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="overflow-hidden bg-elevated">
                {covers[i] && (
                  <Image
                    src={covers[i]}
                    alt=""
                    width={160}
                    height={90}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-4xl text-electric-border">♾</span>
          </div>
        )}
        {/* Item count badge */}
        <div className="absolute bottom-2 right-2 rounded bg-void/80 px-1.5 py-0.5 text-[10px] font-mono font-bold text-electric backdrop-blur-sm">
          {list.item_count}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="truncate text-sm font-semibold text-text-primary transition-colors group-hover:text-electric">
          {list.title}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted">{author}</p>
          {list.likes_count > 0 && (
            <span className="text-xs text-text-muted">
              ♥ {formatCount(list.likes_count)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
