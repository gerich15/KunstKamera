"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUploader } from '@/components/FileUploader'
import { Loader2 } from 'lucide-react'

export default function ProfilePage() {
  const { user, profile, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createSupabaseClient()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string>('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '')
      setFullName(profile.full_name || '')
      setAvatarUrl(profile.avatar_url || '')
    }
  }, [profile])

  const handleSave = async () => {
    if (!user) return

    try {
      setSaving(true)

      // Валидация username
      if (username && username.length < 3) {
        toast({
          title: 'Ошибка',
          description: 'Username должен быть не менее 3 символов',
          variant: 'destructive',
        })
        return
      }

      // Проверяем уникальность username, если он изменился
      if (username && username !== profile?.username) {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .neq('id', user.id)
          .maybeSingle()

        if (existing) {
          toast({
            title: 'Ошибка',
            description: 'Этот username уже занят',
            variant: 'destructive',
          })
          return
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          username: username || null,
          full_name: fullName || null,
          avatar_url: avatarUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: 'Профиль обновлен',
        description: 'Изменения сохранены',
      })

      // Обновляем страницу для синхронизации данных
      router.refresh()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось обновить профиль',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) {
    return (
      <div className="container py-10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container py-10 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Мой профиль</h1>

      <Card>
        <CardHeader>
          <CardTitle>Информация профиля</CardTitle>
          <CardDescription>
            Обновите информацию о себе. Username используется в URL ваших публичных музеев.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user.email || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              Email нельзя изменить
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              placeholder="myusername"
            />
            <p className="text-sm text-muted-foreground">
              Используется в URL: /public/{username || 'username'}/museum-slug
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Полное имя</Label>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Иван Иванов"
            />
          </div>

          <div className="space-y-2">
            <Label>Аватар</Label>
            <FileUploader
              bucket="museum-covers"
              folder="avatars"
              onUploadComplete={setAvatarUrl}
              currentUrl={avatarUrl}
              accept="image/*"
            />
            <p className="text-sm text-muted-foreground">
              Загрузите изображение для вашего профиля
            </p>
          </div>

          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                'Сохранить изменения'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              Отмена
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

