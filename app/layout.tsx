import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Toaster } from '@/components/ui/toaster'
import { EnvCheck } from './env-check'
import { ErrorBoundary } from '@/components/ErrorBoundary'

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
        <ErrorBoundary>
          <EnvCheck />
          <Header />
          <main>{children}</main>
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  )
}

