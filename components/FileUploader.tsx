"use client"

import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'

interface FileUploaderProps {
  bucket: string
  folder?: string
  onUploadComplete: (url: string) => void
  currentUrl?: string | null
  accept?: string
}

export function FileUploader({
  bucket,
  folder = '',
  onUploadComplete,
  currentUrl,
  accept = 'image/*',
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const { toast } = useToast()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('Выберите файл для загрузки')
      }

      const file = e.target.files[0]

      // Валидация размера файла (максимум 5MB)
      const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB в байтах
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(
          `Файл слишком большой. Максимальный размер: 5MB. Ваш файл: ${(file.size / 1024 / 1024).toFixed(2)}MB`
        )
      }

      // Валидация имени файла (защита от path traversal)
      const sanitizedFileName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/\.\./g, '_')
        .substring(0, 255)

      if (!sanitizedFileName || sanitizedFileName.length === 0) {
        throw new Error('Недопустимое имя файла')
      }

      // Валидация расширения файла
      const fileExt = sanitizedFileName.split('.').pop()?.toLowerCase()
      if (!fileExt) {
        throw new Error('Файл должен иметь расширение')
      }

      // Разрешённые расширения
      const allowedImageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
      const allowedVideoExts = ['mp4', 'webm', 'ogg']

      const isImage = accept?.includes('image')
      const isVideo = accept?.includes('video')

      if (isImage && !allowedImageExts.includes(fileExt)) {
        throw new Error(
          `Недопустимый формат изображения. Разрешены: ${allowedImageExts.join(', ')}`
        )
      }

      if (isVideo && !allowedVideoExts.includes(fileExt)) {
        throw new Error(
          `Недопустимый формат видео. Разрешены: ${allowedVideoExts.join(', ')}`
        )
      }

      // Загружаем файл через API
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', bucket)
      if (folder) {
        formData.append('folder', folder)
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Ошибка загрузки файла')
      }

      const data = await response.json()

      setPreview(data.url)
      onUploadComplete(data.url)

      toast({
        title: 'Файл загружен',
      })
    } catch (error: any) {
      toast({
        title: 'Ошибка загрузки',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    setPreview(null)
    onUploadComplete('')
    toast({
      title: 'Файл удален',
    })
  }

  return (
    <div className="space-y-2">
      {preview && (
        <div className="relative w-full h-48 rounded-md overflow-hidden border">
          <Image
            src={preview}
            alt="Preview"
            fill
            sizes="(max-width: 768px) 100vw, 512px"
            className="object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          className="relative"
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? 'Загрузка...' : 'Загрузить файл'}
          <input
            type="file"
            accept={accept}
            onChange={handleUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
        </Button>
      </div>
    </div>
  )
}
