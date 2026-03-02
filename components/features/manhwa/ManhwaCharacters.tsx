import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { CharacterWithRole } from '@/lib/db/character'

interface ManhwaCharactersProps {
  characters: CharacterWithRole[]
  locale: string
  manhwaSlug: string
  showAll?: boolean
}

export function ManhwaCharacters({
  characters,
  locale,
  manhwaSlug,
  showAll = false,
}: ManhwaCharactersProps) {
  const t = useTranslations('manhwa')

  if (characters.length === 0) {
    return <p className="text-sm text-text-muted">{t('noCharacters')}</p>
  }

  const displayed = showAll ? characters : characters.slice(0, 6)

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {displayed.map((mc) => (
          <div
            key={mc.character.id}
            className="flex gap-3 rounded-lg bg-surface p-3"
          >
            {mc.character.image_url ? (
              <Image
                src={mc.character.image_url}
                alt={mc.character.name_en}
                width={56}
                height={80}
                className="h-20 w-14 flex-shrink-0 rounded-md object-cover"
              />
            ) : (
              <div className="flex h-20 w-14 flex-shrink-0 items-center justify-center rounded-md bg-elevated text-xs text-text-muted">
                ?
              </div>
            )}
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-sm font-semibold text-text-primary break-words">
                {mc.character.name_en}
              </span>
              {mc.character.name_native && (
                <span className="truncate text-xs text-text-muted">
                  {mc.character.name_native}
                </span>
              )}
              <span className="mt-1 text-xs text-text-secondary">
                {t(`characterRole.${mc.role}`)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {!showAll && characters.length > 6 && (
        <Link
          href={`/${locale}/manhwa/${manhwaSlug}/characters`}
          className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
        >
          {t('seeAllCharacters')} ({characters.length})
        </Link>
      )}
    </div>
  )
}
