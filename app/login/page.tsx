"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

// Импортируем диагностику для использования в консоли
if (typeof window !== 'undefined') {
  import('@/lib/diagnostics').then(({ checkSupabaseConfig }) => {
    ;(window as any).checkSupabase = checkSupabaseConfig
    console.log('💡 Для диагностики введите в консоли: checkSupabase()')
  })
}

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createSupabaseClient()

  // Проверяем ошибки из URL (например, после OAuth редиректа)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    if (error) {
      toast({
        title: 'Ошибка авторизации',
        description: decodeURIComponent(error),
        variant: 'destructive',
      })
      // Очищаем URL от параметра ошибки
      router.replace('/login')
    }
  }, [router, toast])

  const handleGitHubSignIn = async () => {
    try {
      setLoading(true)
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      })

      if (error) {
        console.error('GitHub OAuth error:', error)
        toast({
          title: 'Ошибка входа через GitHub',
          description:
            error.message ||
            'Проверьте настройки GitHub OAuth в Supabase или используйте вход по email и паролю',
          variant: 'destructive',
        })
        setLoading(false)
      }
      // При успехе Supabase сам сделает редирект на GitHub, дальше обработает /auth/callback
    } catch (error: any) {
      console.error('GitHub sign in error:', error)
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось войти через GitHub',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Проверяем переменные окружения перед запросом
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
          'Переменные окружения Supabase не настроены. Проверьте файл .env.local и перезапустите сервер.'
        )
      }

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) {
          console.error('Sign up error:', error)
          throw error
        }

        console.log('Sign up success:', data)

        // Если email confirmation отключен, пользователь сразу залогинен
        if (data.session) {
          toast({
            title: 'Регистрация успешна!',
            description: 'Вы автоматически вошли в систему',
          })
          await new Promise(resolve => setTimeout(resolve, 500))
          router.push('/dashboard')
          router.refresh()
        } else {
          toast({
            title: 'Успешно!',
            description: 'Проверьте почту для подтверждения регистрации',
          })
        }
      } else {
        console.log('Attempting sign in with:', { email, supabaseUrl })
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          console.error('Sign in error:', {
            message: error.message,
            status: error.status,
            name: error.name,
          })
          throw error
        }

        console.log('Sign in success:', { user: data.user?.email, session: !!data.session })

        if (!data.session) {
          throw new Error('Сессия не была создана. Попробуйте еще раз.')
        }

        toast({
          title: 'Вход выполнен',
        })
        // Ждем немного, чтобы сессия сохранилась
        await new Promise(resolve => setTimeout(resolve, 500))
        router.push('/dashboard')
        router.refresh() // Обновляем страницу для синхронизации сессии
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      let errorMessage = error.message || 'Произошла ошибка при авторизации'

      // Более понятные сообщения об ошибках
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Неверный email или пароль'
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Пожалуйста, подтвердите ваш email. Проверьте почту.'
      } else if (error.status === 401) {
        errorMessage =
          'Ошибка авторизации (401). Проверьте правильность NEXT_PUBLIC_SUPABASE_ANON_KEY в .env.local'
      }

      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignUp ? 'Регистрация' : 'Вход'}</CardTitle>
          <CardDescription>
            {isSignUp
              ? 'Создайте аккаунт для начала работы'
              : 'Войдите в свой аккаунт'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Загрузка...' : isSignUp ? 'Зарегистрироваться' : 'Войти'}
            </Button>
          </form>

        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">или</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full mt-4"
            onClick={handleGitHubSignIn}
            disabled={loading}
          >
            {loading ? 'Загрузка...' : 'Войти через GitHub'}
          </Button>
        </div>

        <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:underline"
            >
              {isSignUp
                ? 'Уже есть аккаунт? Войти'
                : 'Нет аккаунта? Зарегистрироваться'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              ← Вернуться на главную
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

