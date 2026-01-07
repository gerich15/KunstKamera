"use client"

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
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
  const supabase = createSupabaseClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleUpload called', e.target.files)
    try {
      setUploading(true)

      if (!e.target.files || e.target.files.length === 0) {
        console.log('No file selected')
        throw new Error('Выберите файл для загрузки')
      }
      
      console.log('File selected, starting upload process...')

      const file = e.target.files[0]
      console.log('Step 1: File extracted:', file.name, file.size, 'bytes')
      
      // Валидация размера файла (максимум 5MB)
      const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB в байтах
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`Файл слишком большой. Максимальный размер: 5MB. Ваш файл: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
      }

      // Валидация имени файла (защита от path traversal)
      const sanitizedFileName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, '_') // Заменяем опасные символы
        .replace(/\.\./g, '_') // Защита от path traversal
        .substring(0, 255) // Ограничение длины
      
      if (!sanitizedFileName || sanitizedFileName.length === 0) {
        throw new Error('Недопустимое имя файла')
      }

      // Валидация расширения файла
      const fileExt = sanitizedFileName.split('.').pop()?.toLowerCase()
      if (!fileExt) {
        throw new Error('Файл должен иметь расширение')
      }

      // Разрешённые расширения для изображений
      const allowedImageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
      // Разрешённые расширения для видео
      const allowedVideoExts = ['mp4', 'webm', 'ogg']
      
      const isImage = accept?.includes('image')
      const isVideo = accept?.includes('video')
      
      if (isImage && !allowedImageExts.includes(fileExt)) {
        throw new Error(`Недопустимый формат изображения. Разрешены: ${allowedImageExts.join(', ')}`)
      }
      
      if (isVideo && !allowedVideoExts.includes(fileExt)) {
        throw new Error(`Недопустимый формат видео. Разрешены: ${allowedVideoExts.join(', ')}`)
      }

      // Генерируем безопасное имя файла
      const safeFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
      const filePath = folder ? `${folder}/${safeFileName}` : safeFileName
      console.log('Step 2: File path generated:', filePath)

      // Удаляем старый файл, если есть
      if (currentUrl) {
        console.log('Step 3: Removing old file if exists...')
        try {
          // Извлекаем путь из URL
          const urlParts = currentUrl.split('/')
          const bucketIndex = urlParts.findIndex(part => part === bucket)
          if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
            const oldPath = urlParts.slice(bucketIndex + 1).join('/')
            await supabase.storage.from(bucket).remove([oldPath])
            console.log('Step 3: Old file removed')
          }
        } catch (error) {
          // Игнорируем ошибки при удалении старого файла
          console.warn('Step 3: Failed to remove old file (ignoring):', error)
        }
      } else {
        console.log('Step 3: No old file to remove')
      }

      // Проверяем, что пользователь авторизован
      console.log('Step 4: Checking user authentication...')
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log('Step 4: User check result:', { user: user?.id, error: userError })
      
      if (userError || !user) {
        console.error('User not authenticated:', userError)
        throw new Error('Вы не авторизованы. Войдите в систему.')
      }
      console.log('Step 4: User authenticated:', user.id)

      // Проверяем, что bucket существует и доступен
      // Пробуем сначала listBuckets, если не работает - пробуем напрямую загрузить
      console.log('Step 5: Checking bucket access...')
      
      let bucketExists = false
      let availableBuckets: string[] = []
      
      try {
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
        
        console.log('Step 5: Buckets list result:', { 
          buckets: buckets?.map(b => b.name), 
          error: bucketsError 
        })
        
        if (bucketsError) {
          console.warn('Step 5: Cannot list buckets (may need permissions), trying direct upload...', bucketsError)
          // Если не можем получить список, пробуем напрямую загрузить
          // Это сработает, если bucket существует и есть права
        } else {
          availableBuckets = buckets?.map(b => b.name) || []
          bucketExists = availableBuckets.includes(bucket)
          console.log('Step 5: Bucket exists in list?', bucketExists)
        }
      } catch (listError) {
        console.warn('Step 5: Error listing buckets, will try direct upload:', listError)
      }
      
      // Если bucket не найден в списке, но это может быть из-за прав доступа
      // Пробуем проверить доступность через попытку получить список файлов
      if (!bucketExists) {
        console.log('Step 5: Bucket not in list, checking direct access...')
        try {
          const { data: files, error: testError } = await supabase.storage
            .from(bucket)
            .list('', { limit: 1 })
          
          if (!testError) {
            console.log('Step 5: Bucket is accessible (direct check)')
            bucketExists = true
          } else {
            console.error('Step 5: Bucket not accessible:', testError)
            if (testError.message?.includes('not found') || testError.message?.includes('does not exist')) {
              const bucketsList = availableBuckets.length > 0 
                ? availableBuckets.join(', ') 
                : 'нет доступных buckets (возможно, нет прав на просмотр списка)'
              
              throw new Error(
                `Bucket "${bucket}" не найден.\n\n` +
                `Доступные buckets: ${bucketsList}\n\n` +
                `Создайте bucket "${bucket}" в Supabase:\n` +
                `1. Откройте Supabase Dashboard → Storage\n` +
                `2. Нажмите "New bucket"\n` +
                `3. Название: "${bucket}"\n` +
                `4. Public bucket: включите (для публичного доступа)\n` +
                `5. Сохраните\n` +
                `6. После создания выполните supabase/apply-storage-policies.sql в SQL Editor`
              )
            }
            // Если другая ошибка (например, нет прав), пробуем загрузить всё равно
            console.warn('Step 5: Will try upload anyway, error might be permissions:', testError)
          }
        } catch (testErr: any) {
          console.error('Step 5: Direct access check failed:', testErr)
          if (testErr.message?.includes('не найден')) {
            throw testErr
          }
          // Продолжаем попытку загрузки
        }
      }
      
      console.log('Step 5: Proceeding with upload, bucket check:', bucketExists ? 'found' : 'will try anyway')

      console.log('Uploading to bucket:', bucket, 'path:', filePath, 'user:', user.id)
      
      // Отладочная информация
      console.log('File info:', {
        name: file.name,
        size: file.size,
        type: file.type,
        bucket,
        filePath,
        userId: user.id
      })

      // Загружаем новый файл
      console.log('Starting upload...', { bucket, filePath, fileSize: file.size })
      
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        console.log('Upload result:', { 
          uploadData: uploadData ? 'Success' : 'No data', 
          uploadError: uploadError ? {
            message: uploadError.message,
            statusCode: (uploadError as any)?.statusCode ?? (uploadError as any)?.status ?? null,
            name: uploadError.name
          } : null
        })

        if (uploadError) {
          // Безопасное получение statusCode из ошибки
          const errorStatusCode = (uploadError as any)?.statusCode ?? (uploadError as any)?.status ?? null
          
          console.error('Upload error details:', {
            message: uploadError.message,
            statusCode: errorStatusCode,
            error: uploadError
          })
          
          // Более понятные сообщения об ошибках
          if (uploadError.message?.includes('new row violates row-level security') || 
              uploadError.message?.includes('row-level security')) {
            throw new Error('Нет прав доступа. Проверьте политики Storage в Supabase. Выполните supabase/apply-storage-policies.sql')
          }
          if (uploadError.message?.includes('Bucket not found')) {
            throw new Error(`Bucket "${bucket}" не найден. Создайте его в Supabase Storage.`)
          }
          if (errorStatusCode === 400 || errorStatusCode === '400') {
            throw new Error(`Ошибка загрузки (400): ${uploadError.message || 'Проверьте политики Storage и права доступа'}`)
          }
          if (errorStatusCode === 403 || errorStatusCode === '403') {
            throw new Error(`Нет прав доступа (403): ${uploadError.message || 'Проверьте политики Storage в Supabase'}`)
          }
          throw new Error(uploadError.message || 'Ошибка загрузки файла')
        }

        if (!uploadData) {
          throw new Error('Файл не был загружен. Проверьте политики Storage.')
        }

        // Получаем публичный URL
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(filePath)

        console.log('Upload successful! Public URL:', publicUrl)

        setPreview(publicUrl)
        onUploadComplete(publicUrl)

        toast({
          title: 'Файл загружен',
        })
      } catch (uploadErr: any) {
        console.error('Upload exception:', uploadErr)
        throw uploadErr
      }

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
    if (currentUrl) {
      try {
        // Извлекаем путь из URL
        const urlParts = currentUrl.split('/')
        const bucketIndex = urlParts.findIndex(part => part === bucket)
        if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
          const path = urlParts.slice(bucketIndex + 1).join('/')
          await supabase.storage.from(bucket).remove([path])
        }
        setPreview(null)
        onUploadComplete('')
        toast({
          title: 'Файл удален',
        })
      } catch (error: any) {
        toast({
          title: 'Ошибка удаления',
          description: error.message,
          variant: 'destructive',
        })
      }
    }
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

