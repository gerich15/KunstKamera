"use client"

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createSupabaseClient()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const origin = typeof window !== 'undefined' ? window.location.origin : ''
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${origin}/auth/callback`,
          },
        })

        if (error) throw error

        toast({
          title: 'Успешно!',
          description: 'Проверьте почту для подтверждения регистрации',
        })
        onOpenChange(false)
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        toast({
          title: 'Вход выполнен',
        })
        onOpenChange(false)
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGitHubAuth = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      toast({
        title: 'Ошибка входа',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isSignUp ? 'Регистрация' : 'Вход'}</DialogTitle>
          <DialogDescription>
            {isSignUp
              ? 'Создайте аккаунт для начала работы'
              : 'Войдите в свой аккаунт'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleEmailAuth} className="space-y-4">
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
            {isSignUp ? 'Зарегистрироваться' : 'Войти'}
          </Button>
        </form>

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
          className="w-full"
          onClick={handleGitHubAuth}
        >
          Войти через GitHub
        </Button>

        <div className="text-center text-sm">
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
      </DialogContent>
    </Dialog>
  )
}

