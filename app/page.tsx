import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { MuseumCard } from '@/components/MuseumCard'
import { HeroSection } from '@/components/HeroSection'
import { ImageIcon, Share2, Sparkles } from 'lucide-react'

export default async function HomePage() {
  // Получаем публичные музеи (если Supabase настроен)
  let museums = null
  
  try {
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('museums')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          full_name
        ),
        artifacts (
          id
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(6)
    museums = data
  } catch (error) {
    // Если переменные окружения не настроены, просто не загружаем музеи
    console.error('Error loading museums:', error)
    museums = null
  }

  return (
    <div className="container py-10">
      {/* Hero Section */}
      <HeroSection />

      {/* Features */}
      <section className="py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Возможности платформы
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <ImageIcon className="h-10 w-10 mb-4 text-primary" />
              <CardTitle>Создавайте коллекции</CardTitle>
              <CardDescription>
                Добавляйте изображения, тексты, ссылки и видео в ваши музеи
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Share2 className="h-10 w-10 mb-4 text-primary" />
              <CardTitle>Делитесь с миром</CardTitle>
              <CardDescription>
                Каждый музей имеет уникальную ссылку для публичного просмотра
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Sparkles className="h-10 w-10 mb-4 text-primary" />
              <CardTitle>Красивый дизайн</CardTitle>
              <CardDescription>
                Выбирайте между сеткой, masonry и списком для отображения
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Featured Museums */}
      {museums && museums.length > 0 && (
        <section className="py-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Популярные музеи
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {museums.map((museum) => (
              <MuseumCard key={museum.id} museum={museum} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

