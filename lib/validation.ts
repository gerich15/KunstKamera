import { z } from 'zod'

export const museumSchema = z.object({
  title: z.string().min(1, 'Название обязательно').max(100, 'Максимум 100 символов'),
  slug: z.string().min(1, 'Slug обязателен').max(100),
  description: z.string().max(500, 'Максимум 500 символов').optional().nullable(),
  cover_image_url: z.string().url().optional().nullable(),
  is_public: z.boolean().default(true),
  layout_type: z.enum(['grid', 'masonry', 'list']).default('grid'),
})

// Валидация URL для link-экспонатов
const urlSchema = z.string().url('Некорректный URL').refine(
  (url) => {
    try {
      const urlObj = new URL(url)
      // Разрешённые протоколы
      const allowedProtocols = ['http:', 'https:']
      if (!allowedProtocols.includes(urlObj.protocol)) {
        return false
      }
      // Базовые проверки домена (можно расширить whitelist)
      const hostname = urlObj.hostname
      // Запрещаем localhost и внутренние IP (кроме разработки)
      if (process.env.NODE_ENV === 'production') {
        if (hostname === 'localhost' || hostname.startsWith('127.') || hostname.startsWith('192.168.')) {
          return false
        }
      }
      return true
    } catch {
      return false
    }
  },
  { message: 'Некорректный URL или недопустимый протокол' }
)

export const artifactSchema = z.object({
  title: z.string().min(1, 'Название обязательно').max(200, 'Максимум 200 символов'),
  description: z.string().max(2000, 'Максимум 2000 символов').optional().nullable(),
  artifact_type: z.enum(['image', 'text', 'link', 'video']),
  content_url: z.string().optional().nullable(),
  file_metadata: z.record(z.any()).optional().nullable(),
  order_index: z.number().int().default(0),
}).refine(
  (data) => {
    // Если тип link, content_url обязателен и должен быть валидным URL
    if (data.artifact_type === 'link') {
      if (!data.content_url || data.content_url.trim() === '') {
        return false
      }
      return urlSchema.safeParse(data.content_url).success
    }
    return true
  },
  {
    message: 'Для типа "ссылка" требуется корректный URL (http:// или https://)',
    path: ['content_url'],
  }
)

export type MuseumFormData = z.infer<typeof museumSchema>
export type ArtifactFormData = z.infer<typeof artifactSchema>


