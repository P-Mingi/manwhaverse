'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface ReadLink {
  id: string
  platform: string
  url: string
  is_free: boolean
  language: string
  is_affiliate: boolean
  affiliate_url: string | null
}

interface WhereToReadProps {
  readLinks: ReadLink[]
  locale: string
}

// Map any DB language format (short code or full name) to canonical key
const LANG_NORMALIZE: Record<string, string> = {
  en: 'english', english: 'english',
  fr: 'french', french: 'french', français: 'french',
  ko: 'korean', kr: 'korean', korean: 'korean',
  th: 'thai', thai: 'thai',
  de: 'german', german: 'german',
  zh: 'chinese', chinese: 'chinese',
  es: 'spanish', spanish: 'spanish',
  pt: 'portuguese', portuguese: 'portuguese',
  it: 'italian', italian: 'italian',
  ja: 'japanese', japanese: 'japanese',
}

function normalizeLanguageKey(lang: string): string {
  return LANG_NORMALIZE[lang.toLowerCase().trim()] ?? lang.toLowerCase().trim()
}

// Primary canonical languages shown by default
const PRIMARY_LANGS = ['french', 'english']

export function WhereToRead({ readLinks, locale }: WhereToReadProps) {
  const t = useTranslations('manhwa')
  const [showMore, setShowMore] = useState(false)

  if (readLinks.length === 0) return null

  // Group by normalized language key
  const grouped = readLinks.reduce<Record<string, ReadLink[]>>((acc, link) => {
    const lang = normalizeLanguageKey(link.language)
    if (!acc[lang]) acc[lang] = []
    acc[lang].push(link)
    return acc
  }, {})

  // Sort: user locale first, then the other primary, then rest alphabetically
  const userLang = locale === 'fr' ? 'french' : 'english'
  const secondLang = locale === 'fr' ? 'english' : 'french'
  const langOrder = [userLang, secondLang]

  const allLangs = Object.keys(grouped).sort((a, b) => {
    const ia = langOrder.indexOf(a) === -1 ? 99 : langOrder.indexOf(a)
    const ib = langOrder.indexOf(b) === -1 ? 99 : langOrder.indexOf(b)
    return ia - ib
  })

  // Separate physical edition links (Amazon, etc.)
  const physicalPlatforms = ['amazon', 'fnac', 'bookdepository']
  const physicalLinks: ReadLink[] = []
  const digitalGroups: Record<string, ReadLink[]> = {}

  for (const lang of allLangs) {
    const links = grouped[lang]!
    const digital: ReadLink[] = []
    for (const link of links) {
      if (physicalPlatforms.some(p => link.platform.toLowerCase().includes(p))) {
        physicalLinks.push(link)
      } else {
        digital.push(link)
      }
    }
    if (digital.length > 0) {
      digitalGroups[lang] = digital
    }
  }

  const primaryEntries = Object.entries(digitalGroups).filter(([lang]) => PRIMARY_LANGS.includes(lang))
  const secondaryEntries = Object.entries(digitalGroups).filter(([lang]) => !PRIMARY_LANGS.includes(lang))

  return (
    <div className="rounded-lg border border-crystal-blue/20 bg-gradient-to-b from-crystal-blue/[0.08] to-surface p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-crystal-blue uppercase tracking-wide">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        {t('whereToRead')}
      </h3>

      <div className="space-y-3">
        {/* Primary languages (FR + EN) */}
        {primaryEntries.map(([lang, links]) => (
          <div key={lang}>
            <p className="mb-1.5 text-xs font-medium text-text-secondary">
              {t.has(`languages.${lang}`) ? t(`languages.${lang}`) : lang.charAt(0).toUpperCase() + lang.slice(1)}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.affiliate_url ?? link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-crystal-blue/25 bg-crystal-blue/10 px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-crystal-blue/20 hover:text-crystal-blue"
                >
                  {link.platform}
                  {link.is_free && (
                    <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-emerald-400">
                      {t('free')}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        ))}

        {/* Secondary languages — collapsible */}
        {secondaryEntries.length > 0 && (
          <>
            {showMore && secondaryEntries.map(([lang, links]) => (
              <div key={lang}>
                <p className="mb-1.5 text-xs font-medium text-text-secondary">
                  {t.has(`languages.${lang}`) ? t(`languages.${lang}`) : lang.charAt(0).toUpperCase() + lang.slice(1)}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {links.map((link) => (
                    <a
                      key={link.id}
                      href={link.affiliate_url ?? link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-crystal-blue/25 bg-crystal-blue/10 px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-crystal-blue/20 hover:text-crystal-blue"
                    >
                      {link.platform}
                      {link.is_free && (
                        <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-emerald-400">
                          {t('free')}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={() => setShowMore(!showMore)}
              className="text-xs font-medium text-crystal-blue hover:underline"
            >
              {showMore ? t('showLessLangs') : t('morePlatforms', { count: secondaryEntries.length })}
            </button>
          </>
        )}

        {/* Physical editions */}
        {physicalLinks.length > 0 && (
          <div className="border-t border-crystal-blue/10 pt-3">
            <p className="mb-1.5 text-xs font-medium text-text-secondary">
              {t('physicalEdition')}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {physicalLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.affiliate_url ?? link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-400/20"
                >
                  {link.platform} &rarr;
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
