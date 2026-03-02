import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 font-mono text-8xl font-bold text-text-muted/30">404</div>
      <h1 className="mb-2 font-display text-2xl font-bold text-text-primary">
        Page not found
      </h1>
      <p className="mb-8 max-w-sm text-sm text-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-crystal-blue px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-crystal-blue/90"
      >
        Back to home
      </Link>
    </div>
  )
}
