import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { SessionProvider } from '@/components/SessionProvider'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'Kunstkamera - Digital Curiosity Cabinet',
  description: 'Платформа для создания и демонстрации коллекций цифровых артефактов',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <SessionProvider>
          <ErrorBoundary>
            <Header />
            <main>{children}</main>
            <Toaster />
          </ErrorBoundary>
        </SessionProvider>
      </body>
    </html>
  )
}

