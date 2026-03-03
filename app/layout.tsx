import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import { bebasNeue, sora, jetbrainsMono } from '@/app/fonts'
import '@/app/globals.css'

export default async function RootLayout({ children }: { children: ReactNode }) {
  const headersList = await headers()
  const locale = headersList.get('x-next-intl-locale') ?? 'en'

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body
        className={`${bebasNeue.variable} ${sora.variable} ${jetbrainsMono.variable} overflow-x-hidden bg-void text-text-primary antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
