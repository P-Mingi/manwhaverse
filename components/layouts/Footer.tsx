import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface FooterProps {
  locale: string
}

export function Footer({ locale }: FooterProps) {
  const t = useTranslations('footer')

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Discover */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
              {t('discover')}
            </h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href={`/${locale}/genre`} className="text-text-secondary hover:text-text-primary">
                {t('genres')}
              </Link>
              <Link href={`/${locale}/trope`} className="text-text-secondary hover:text-text-primary">
                {t('tropes')}
              </Link>
              <Link href={`/${locale}/search?sort=popularity`} className="text-text-secondary hover:text-text-primary">
                {t('topManhwa')}
              </Link>
            </nav>
          </div>

          {/* Community */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
              {t('community')}
            </h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href={`/${locale}/feed`} className="text-text-secondary hover:text-text-primary">
                {t('feed')}
              </Link>
              <Link href={`/${locale}/search`} className="text-text-secondary hover:text-text-primary">
                {t('search')}
              </Link>
              <Link href={`/${locale}/blog`} className="text-text-secondary hover:text-text-primary">
                {t('blog')}
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
              {t('legal')}
            </h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href={`/${locale}/privacy`} className="text-text-secondary hover:text-text-primary">
                {t('privacyPolicy')}
              </Link>
              <Link href={`/${locale}/terms`} className="text-text-secondary hover:text-text-primary">
                {t('termsOfService')}
              </Link>
            </nav>
          </div>

          {/* About */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
              {t('about')}
            </h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href={`/${locale}/contact`} className="text-text-secondary hover:text-text-primary">
                {t('contact')}
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 border-t border-border pt-6 md:flex-row md:justify-between">
          <div className="font-display text-sm font-bold text-text-secondary">
            ManhwaVerse
          </div>
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} ManhwaVerse
          </p>
        </div>
      </div>
    </footer>
  )
}
