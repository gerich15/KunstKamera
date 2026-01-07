"use client"

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { LogOut, User, Plus } from 'lucide-react'

export function Header() {
  const { user, profile, signOut, loading } = useAuth()
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: 'Вы вышли из системы',
      })
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось выйти из системы',
        variant: 'destructive',
      })
    }
  }

  // Показываем заглушку во время загрузки
  if (loading) {
    return (
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Kunstkamera</span>
          </Link>
          <nav className="flex items-center space-x-4">
            <div className="h-9 w-32 bg-muted animate-pulse rounded-md" />
          </nav>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">Kunstkamera</span>
        </Link>

        <nav className="flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  <User className="mr-2 h-4 w-4" />
                  {profile?.username || profile?.full_name || 'Профиль'}
                </Button>
              </Link>
              <Link href="/dashboard/new">
                <Button variant="default" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Создать музей
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Войти
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

