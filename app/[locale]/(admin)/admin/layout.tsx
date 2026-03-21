import type { ReactNode } from 'react'
import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/session'
import { PageContainer } from '@/components/layouts/PageContainer'

interface AdminLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params
  await requireAdmin(locale)

  const navLinks = [
    { href: `/${locale}/admin`, label: 'Dashboard' },
    { href: `/${locale}/admin/users`, label: 'Users' },
    { href: `/${locale}/admin/reviews`, label: 'Reviews' },
  ]

  return (
    <PageContainer>
      <div className="mb-6 flex items-center gap-2">
        <span className="rounded bg-crystal-blue px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
          Admin
        </span>
        <h1 className="font-display text-xl font-bold">Panel</h1>
      </div>
      <div className="flex gap-8">
        <nav className="w-40 shrink-0">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-elevated hover:text-text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </PageContainer>
  )
}
