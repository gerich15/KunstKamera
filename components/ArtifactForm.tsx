"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { artifactSchema, type ArtifactFormData } from '@/lib/validation'
import type { Artifact } from '@/types'
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

interface ArtifactFormProps {
  museumId: string
  artifact?: Artifact | null
  onSuccess: () => void
  onCancel: () => void
}

export function ArtifactForm({
  museumId,
  artifact,
  onSuccess,
  onCancel,
}: ArtifactFormProps) {
  const { toast } = useToast()
  const supabase = createSupabaseClient()
  const [loading, setLoading] = useState(false)
  const [contentUrl, setContentUrl] = useState<string>('')
  const [artifactType, setArtifactType] = useState<
    'image' | 'text' | 'link' | 'video'
  >('image')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ArtifactFormData>({
    resolver: zodResolver(artifactSchema),
    defaultValues: artifact
      ? {
          title: artifact.title,
          description: artifact.description || '',
          artifact_type: artifact.artifact_type,
          content_url: artifact.content_url || '',
          order_index: artifact.order_index,
        }
      : {
          artifact_type: 'image',
          order_index: 0,
        },
  })

  useEffect(() => {
    if (artifact) {
      setContentUrl(artifact.content_url || '')
      setArtifactType(artifact.artifact_type)
    }
  }, [artifact])

  const onSubmit = async (data: ArtifactFormData) => {
    try {
      setLoading(true)

      // Валидация для ссылок
      if (data.artifact_type === 'link' && !data.content_url) {
        toast({
          title: 'Ошибка',
          description: 'Укажите URL для ссылки',
          variant: 'destructive',
        })
        return
      }

      // Валидация для изображений и видео
      if (
        (data.artifact_type === 'image' || data.artifact_type === 'video') &&
        !contentUrl
      ) {
        toast({
          title: 'Ошибка',
          description: 'Загрузите файл',
          variant: 'destructive',
        })
        return
      }

      const artifactData = {
        ...data,
        content_url: contentUrl || data.content_url || null,
        museum_id: museumId,
      }

      if (artifact) {
        // Обновление
        const { error } = await supabase
          .from('artifacts')
          .update(artifactData)
          .eq('id', artifact.id)

        if (error) throw error

        toast({
          title: 'Экспонат обновлен',
        })
      } else {
        // Создание
        // Получаем максимальный order_index
        const { data: existing } = await supabase
          .from('artifacts')
          .select('order_index')
          .eq('museum_id', museumId)
          .order('order_index', { ascending: false })
          .limit(1)
          .single()

        const maxOrder = existing?.order_index || 0

        const { error } = await supabase.from('artifacts').insert({
          ...artifactData,
          order_index: maxOrder + 1,
        })

        if (error) throw error

        toast({
          title: 'Экспонат добавлен',
        })
      }

      onSuccess()
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

  const selectedType = watch('artifact_type')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Название *</Label>
        <Input id="title" {...register('title')} placeholder="Название экспоната" />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="artifact_type">Тип экспоната *</Label>
        <Select
          value={selectedType}
          onValueChange={(value) => {
            setValue('artifact_type', value as any)
            setArtifactType(value as any)
            setContentUrl('')
          }}
        >
          <SelectTrigger id="artifact_type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image">Изображение</SelectItem>
            <SelectItem value="text">Текст</SelectItem>
            <SelectItem value="link">Ссылка</SelectItem>
            <SelectItem value="video">Видео</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedType === 'image' && (
        <div className="space-y-2">
          <Label>Изображение *</Label>
          <FileUploader
            bucket="artifacts"
            folder={museumId}
            onUploadComplete={setContentUrl}
            currentUrl={contentUrl}
            accept="image/*"
          />
        </div>
      )}

      {selectedType === 'video' && (
        <div className="space-y-2">
          <Label>Видео файл *</Label>
          <FileUploader
            bucket="artifacts"
            folder={museumId}
            onUploadComplete={setContentUrl}
            currentUrl={contentUrl}
            accept="video/*"
          />
        </div>
      )}

      {selectedType === 'link' && (
        <div className="space-y-2">
          <Label htmlFor="content_url">URL *</Label>
          <Input
            id="content_url"
            type="url"
            {...register('content_url')}
            placeholder="https://example.com"
            value={contentUrl}
            onChange={(e) => {
              setContentUrl(e.target.value)
              setValue('content_url', e.target.value)
            }}
          />
          {errors.content_url && (
            <p className="text-sm text-destructive">
              {errors.content_url.message}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Описание экспоната..."
          rows={selectedType === 'text' ? 10 : 4}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Сохранение...' : artifact ? 'Сохранить' : 'Добавить'}
        </Button>
      </div>
    </form>
  )
}


