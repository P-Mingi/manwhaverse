import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { RelationWithManhwa } from '@/lib/db/relation'

interface ManhwaRelationsProps {
  relations: RelationWithManhwa[]
  locale: string
}

const RELATION_BADGE_STYLES: Record<string, string> = {
  ADAPTATION: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  SEQUEL: 'bg-green-500/20 text-green-400 border border-green-500/30',
  PREQUEL: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  SIDE_STORY: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  SOURCE: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
  ALTERNATIVE: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  LIGHT_NOVEL: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
}

export function ManhwaRelations({ relations, locale }: ManhwaRelationsProps) {
  const t = useTranslations('manhwa')

  if (relations.length === 0) return null

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
      {relations.map((rel, i) => (
        <Link
          key={`${rel.manhwa.id}-${rel.relation_type}-${i}`}
          href={`/${locale}/manhwa/${rel.manhwa.slug}`}
          className="flex w-24 flex-shrink-0 flex-col gap-1.5 rounded-lg transition-opacity hover:opacity-80"
        >
          {rel.manhwa.cover_url ? (
            <Image
              src={rel.manhwa.cover_url}
              alt={locale === 'fr' ? (rel.manhwa.title_fr ?? rel.manhwa.title_en) : rel.manhwa.title_en}
              width={96}
              height={132}
              className="h-[132px] w-24 rounded-md object-cover"
            />
          ) : (
            <div className="flex h-[132px] w-24 items-center justify-center rounded-md bg-elevated text-xs text-text-muted">
              No Cover
            </div>
          )}
          <div>
            <span className="line-clamp-2 text-[11px] font-medium leading-tight text-text-primary">
              {locale === 'fr' ? (rel.manhwa.title_fr ?? rel.manhwa.title_en) : rel.manhwa.title_en}
            </span>
            <span className={`mt-1 inline-block rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${RELATION_BADGE_STYLES[rel.relation_type] ?? 'bg-gray-500/20 text-gray-400'}`}>
              {t(`relationType.${rel.relation_type}`)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
