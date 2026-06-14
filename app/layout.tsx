import './globals.css'
import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import Provider from './provider'

export const metadata: Metadata = {
  title: 'Imagine & Build - AI Tools for YouTube Creators',
  description:
    'Plan videos, generate titles and descriptions, create thumbnails, and research ideas in one creator workspace.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>
          <Provider>{children}</Provider>
        </body>
      </html>
    </ClerkProvider>
  )
}
