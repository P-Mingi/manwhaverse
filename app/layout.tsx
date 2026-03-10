import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import { bebasNeue, sora, jetbrainsMono, crimsonPro, dmSans } from '@/app/fonts'
import '@/app/globals.css'

export default async function RootLayout({ children }: { children: ReactNode }) {
  const headersList = await headers()
  const locale = headersList.get('x-next-intl-locale') ?? 'en'

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${bebasNeue.variable} ${sora.variable} ${jetbrainsMono.variable} ${crimsonPro.variable} ${dmSans.variable} overflow-x-hidden bg-void text-text-primary antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
