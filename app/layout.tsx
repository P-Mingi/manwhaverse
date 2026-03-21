import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Bebas_Neue, Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg',
  },
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0C0E13' },
    { media: '(prefers-color-scheme: light)', color: '#F7F5F0' },
  ],
}

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--loaded-bebas',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--loaded-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--loaded-dm-sans',
  display: 'swap',
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className={`${bebasNeue.variable} ${playfair.variable} ${dmSans.variable}`}>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
