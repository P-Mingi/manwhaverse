import type { ReactNode } from 'react'

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={className}
      style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '2rem 1rem',
      }}
    >
      {children}
    </div>
  )
}
