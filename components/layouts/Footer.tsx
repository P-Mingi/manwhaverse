import Link from 'next/link'

interface FooterProps {
  locale: string
}

export function Footer({ locale }: FooterProps) {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="font-display text-sm font-bold text-text-secondary">
            ManhwaVerse
          </div>
          <nav className="flex gap-6 text-xs text-text-muted">
            <Link href={`/${locale}/genre`} className="hover:text-text-secondary">
              Genres
            </Link>
            <Link href={`/${locale}/trope`} className="hover:text-text-secondary">
              Tropes
            </Link>
          </nav>
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} ManhwaVerse
          </p>
        </div>
      </div>
    </footer>
  )
}
