"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function HeroSection() {
  const { user, loading } = useAuth()

  return (
    <section className="text-center py-20 space-y-6">
      <div className="flex justify-center">
        <Sparkles className="h-16 w-16 text-primary" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
        Kunstkamera
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Создавайте, организуйте и делитесь коллекциями цифровых артефактов.
        Ваш личный цифровой музей в интернете.
      </p>
      <div className="flex justify-center gap-4">
        {loading ? (
          <>
            <Button size="lg" disabled>Загрузка...</Button>
            <Button size="lg" variant="outline" disabled>Загрузка...</Button>
          </>
        ) : user ? (
          <>
            <Link href="/dashboard/new">
              <Button size="lg">Начать создавать</Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">
                Мои музеи
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button size="lg">Начать создавать</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Посмотреть примеры
              </Button>
            </Link>
          </>
        )}
      </div>
    </section>
  )
}

