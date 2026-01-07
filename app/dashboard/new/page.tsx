"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { museumSchema, type MuseumFormData } from '@/lib/validation'
import { slugify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FileUploader } from '@/components/FileUploader'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function NewMuseumPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createSupabaseClient()
  const [loading, setLoading] = useState(false)
  const [coverImageUrl, setCoverImageUrl] = useState<string>('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MuseumFormData>({
    resolver: zodResolver(museumSchema),
    defaultValues: {
      is_public: true,
      layout_type: 'grid',
    },
  })

  const title = watch('title')

  const onSubmit = async (data: MuseumFormData) => {
    try {
      setLoading(true)
      console.log('Form submitted with data:', data)
      console.log('Cover image URL:', coverImageUrl)

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      console.log('User check:', { user: user?.id, error: userError })

      if (!user) {
        console.error('User not authenticated')
        toast({
          title: 'Ошибка',
          description: 'Вы должны быть авторизованы',
          variant: 'destructive',
        })
        setLoading(false)
        return
      }

      // Генерируем slug из названия, если не указан
      const slug = data.slug || slugify(data.title)
      console.log('Generated slug:', slug)

      // Проверяем уникальность slug
      const { data: existing, error: checkError } = await supabase
        .from('museums')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()

      console.log('Slug check:', { existing, checkError })

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 = no rows returned, это нормально
        console.error('Error checking slug:', checkError)
      }

      if (existing) {
        toast({
          title: 'Ошибка',
          description: 'Музей с таким URL уже существует',
          variant: 'destructive',
        })
        setLoading(false)
        return
      }

      const museumData = {
        ...data,
        slug,
        cover_image_url: coverImageUrl || null,
        user_id: user.id,
      }
      console.log('Inserting museum:', museumData)

      const { data: museum, error } = await supabase
        .from('museums')
        .insert(museumData)
        .select()
        .single()

      console.log('Insert result:', { museum, error })

      if (error) {
        console.error('Insert error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        throw error
      }

      if (!museum) {
        throw new Error('Музей не был создан. Проверьте данные и попробуйте снова.')
      }

      toast({
        title: 'Музей создан!',
        description: 'Теперь вы можете добавить экспонаты',
      })

      console.log('Redirecting to museum page:', `/museum/${museum.id}`)
      router.push(`/museum/${museum.id}`)
    } catch (error: any) {
      console.error('Form submission error:', error)
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось создать музей. Проверьте консоль для деталей.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Создать новый музей</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Название музея *</Label>
          <Input
            id="title"
            {...register('title')}
            placeholder="Моя коллекция артефактов"
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">URL (опционально)</Label>
          <Input
            id="slug"
            {...register('slug')}
            placeholder={title ? slugify(title) : 'my-museum'}
          />
          <p className="text-sm text-muted-foreground">
            Если не указан, будет сгенерирован из названия
          </p>
          {errors.slug && (
            <p className="text-sm text-destructive">{errors.slug.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Описание</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Расскажите о вашей коллекции..."
            rows={4}
          />
          {errors.description && (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Обложка</Label>
          <FileUploader
            bucket="museum-covers"
            onUploadComplete={setCoverImageUrl}
            currentUrl={coverImageUrl}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="layout_type">Тип отображения</Label>
          <Select
            value={watch('layout_type')}
            onValueChange={(value) =>
              setValue('layout_type', value as 'grid' | 'masonry' | 'list')
            }
          >
            <SelectTrigger id="layout_type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Сетка</SelectItem>
              <SelectItem value="masonry">Masonry</SelectItem>
              <SelectItem value="list">Список</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_public"
            {...register('is_public')}
            className="rounded"
          />
          <Label htmlFor="is_public" className="cursor-pointer">
            Публичный музей (доступен всем)
          </Label>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Создание...' : 'Создать музей'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Отмена
          </Button>
        </div>
      </form>
    </div>
  )
}

