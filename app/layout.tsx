import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import Provider from './provider'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI YouTube Content Generator - Supercharge Your Growth',
  description:
    'Transform your YouTube channel with AI-powered content creation tools. Generate ideas, titles, thumbnails, and more.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className} suppressHydrationWarning>
          
            <Provider>{children}</Provider>
          
        </body>
      </html>
    </ClerkProvider>
  )
}
