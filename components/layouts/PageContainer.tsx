import type { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  className?: string
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <main className={`mx-auto max-w-5xl px-4 py-6 md:py-8 ${className}`}>
      {children}
    </main>
  )
}
