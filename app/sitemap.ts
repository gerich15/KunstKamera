import { MetadataRoute } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  const sitemapEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Проверяем наличие переменных окружения перед запросом к Supabase
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      // Получаем все публичные музеи
      const supabase = createSupabaseServerClient()
      const { data: museums } = await supabase
        .from('museums')
        .select(`
          slug,
          updated_at,
          profiles:user_id (
            username
          )
        `)
        .eq('is_public', true)
        .order('updated_at', { ascending: false })
        .limit(1000) // Ограничение для производительности

      if (museums) {
        museums.forEach((museum: any) => {
          // Обрабатываем profiles как массив или объект
          const profile = Array.isArray(museum.profiles) 
            ? museum.profiles[0] 
            : museum.profiles
          
          if (profile?.username) {
            sitemapEntries.push({
              url: `${baseUrl}/public/${profile.username}/${museum.slug}`,
              lastModified: new Date(museum.updated_at),
              changeFrequency: 'weekly',
              priority: 0.8,
            })
          }
        })
      }
    } catch (error) {
      // Логируем ошибку, но не прерываем генерацию sitemap
      console.error('Error generating sitemap (continuing with base URLs):', error)
    }
  } else {
    console.warn('Supabase environment variables not set. Sitemap will only include base URLs.')
  }

  return sitemapEntries
}
