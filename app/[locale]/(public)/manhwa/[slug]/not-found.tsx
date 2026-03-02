import Link from 'next/link'

export default function ManhwaNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 font-mono text-7xl font-bold text-text-muted/30">404</div>
      <h1 className="mb-2 font-display text-2xl font-bold text-text-primary">
        Manhwa not found
      </h1>
      <p className="mb-8 max-w-sm text-sm text-text-secondary">
        This title doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/en/search"
        className="rounded-lg bg-crystal-blue px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-crystal-blue/90"
      >
        Search manhwa
      </Link>
    </div>
  )
}
