import { useTranslations } from 'next-intl'

export default function HomePage() {
  const t = useTranslations('home')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
        ManhwaVerse
      </h1>
      <p className="max-w-md text-center text-lg text-text-secondary">
        {t('hero.tagline')}
      </p>
      <div className="flex gap-4">
        <button className="rounded-lg bg-crystal-gold px-6 py-3 font-semibold text-base transition-colors hover:bg-crystal-gold/90">
          {t('hero.cta')}
        </button>
        <button className="rounded-lg border border-border px-6 py-3 font-semibold text-text-primary transition-colors hover:bg-elevated">
          {t('hero.ctaSecondary')}
        </button>
      </div>
    </main>
  )
}
