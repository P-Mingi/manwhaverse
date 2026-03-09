import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface FooterProps {
  locale: string
}

export function Footer({ locale }: FooterProps) {
  const t = useTranslations('footer')

  return (
    <footer className="border-t border-electric-border bg-void">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Discover */}
          <div>
            <h4 className="mb-3 font-display text-sm tracking-widest text-text-primary">
              {t('discover')}
            </h4>
            <nav className="flex flex-col gap-2">
              <Link href={`/${locale}/genre`} className="text-xs text-text-muted transition-colors hover:text-electric">
                {t('genres')}
              </Link>
              <Link href={`/${locale}/trope`} className="text-xs text-text-muted transition-colors hover:text-electric">
                {t('tropes')}
              </Link>
              <Link href={`/${locale}/search?sort=popularity`} className="text-xs text-text-muted transition-colors hover:text-electric">
                {t('topManhwa')}
              </Link>
            </nav>
          </div>

          {/* Community */}
          <div>
            <h4 className="mb-3 font-display text-sm tracking-widest text-text-primary">
              {t('community')}
            </h4>
            <nav className="flex flex-col gap-2">
              <Link href={`/${locale}/news`} className="text-xs text-text-muted transition-colors hover:text-electric">
                {t('news')}
              </Link>
              <Link href={`/${locale}/feed`} className="text-xs text-text-muted transition-colors hover:text-electric">
                {t('feed')}
              </Link>
              <Link href={`/${locale}/search`} className="text-xs text-text-muted transition-colors hover:text-electric">
                {t('search')}
              </Link>
              <Link href={`/${locale}/lists`} className="text-xs text-text-muted transition-colors hover:text-electric">
                {t('lists')}
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-3 font-display text-sm tracking-widest text-text-primary">
              {t('legal')}
            </h4>
            <nav className="flex flex-col gap-2">
              <Link href={`/${locale}/privacy`} className="text-xs text-text-muted transition-colors hover:text-electric">
                {t('privacyPolicy')}
              </Link>
              <Link href={`/${locale}/terms`} className="text-xs text-text-muted transition-colors hover:text-electric">
                {t('termsOfService')}
              </Link>
              <Link href={`/${locale}/legal/affiliate-disclosure`} className="text-xs text-text-muted transition-colors hover:text-electric">
                {t('affiliateDisclosure')}
              </Link>
            </nav>
          </div>

          {/* About */}
          <div>
            <h4 className="mb-3 font-display text-sm tracking-widest text-text-primary">
              {t('about')}
            </h4>
            <nav className="flex flex-col gap-2">
              <Link href={`/${locale}/about`} className="text-xs text-text-muted transition-colors hover:text-electric">
                {t('about')}
              </Link>
              <Link href={`/${locale}/faq`} className="text-xs text-text-muted transition-colors hover:text-electric">
                {t('faq')}
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 border-t border-electric-border pt-6 md:flex-row md:justify-between">
          <div className="font-display text-xl tracking-widest text-electric opacity-50">
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
