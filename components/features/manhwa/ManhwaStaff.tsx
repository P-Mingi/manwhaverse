import Image from 'next/image'
import { useTranslations } from 'next-intl'

interface CreatorLink {
  creator_id: string
  role: 'AUTHOR' | 'ILLUSTRATOR' | 'BOTH' | string
  role_detail: string | null
  creator: {
    id: string
    name: string
    name_native: string | null
    avatar_url: string | null
    [key: string]: unknown
  }
  [key: string]: unknown
}

interface ManhwaStaffProps {
  creatorLinks: CreatorLink[]
}

export function ManhwaStaff({ creatorLinks }: ManhwaStaffProps) {
  const t = useTranslations('manhwa')

  if (creatorLinks.length === 0) {
    return <p className="text-sm text-text-muted">{t('noStaff')}</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {creatorLinks.map((cl) => (
        <div
          key={`${cl.creator_id}-${cl.role}`}
          className="flex gap-3 rounded-lg bg-surface p-4"
        >
          {cl.creator.avatar_url ? (
            <Image
              src={cl.creator.avatar_url}
              alt={cl.creator.name}
              width={48}
              height={48}
              className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-elevated text-sm font-bold text-text-muted">
              {cl.creator.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col justify-center overflow-hidden">
            <span className="truncate text-sm font-semibold text-text-primary">
              {cl.creator.name}
            </span>
            {cl.creator.name_native && (
              <span className="truncate text-xs text-text-muted">
                {cl.creator.name_native}
              </span>
            )}
            <span className="mt-0.5 text-xs text-text-secondary">
              {cl.role_detail ?? cl.role.charAt(0) + cl.role.slice(1).toLowerCase()}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
