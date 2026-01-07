import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ShareButtonClient } from '@/components/ShareButtonClient'
import { MuseumArtifactsClient } from '@/components/MuseumArtifactsClient'
import type { Museum, Artifact } from '@/types'

async function getMuseum(username: string, slug: string) {
  const supabase = createSupabaseServerClient()

  // Сначала находим пользователя по username
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (!profile) {
    return null
  }

  // Затем находим музей по slug и user_id
  const { data: museum } = await supabase
    .from('museums')
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        full_name
      )
    `)
    .eq('slug', slug)
    .eq('user_id', profile.id)
    .eq('is_public', true)
    .single()

  if (!museum) {
    return null
  }

  // Загружаем экспонаты
  const { data: artifacts } = await supabase
    .from('artifacts')
    .select('*')
    .eq('museum_id', museum.id)
    .order('order_index', { ascending: true })

  return {
    ...museum,
    artifacts: artifacts || [],
  }
}

// Генерируем метаданные для SEO
export async function generateMetadata({
  params,
}: {
  params: { username: string; museumSlug: string }
}): Promise<Metadata> {
  const museum = await getMuseum(params.username, params.museumSlug)

  if (!museum) {
    return {
      title: 'Музей не найден',
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const url = `${siteUrl}/public/${params.username}/${params.museumSlug}`
  const title = `${museum.title} | Kunstkamera`
  
  // Безопасная обработка profiles (может быть объектом или массивом)
  const profile = Array.isArray(museum.profiles) ? museum.profiles[0] : museum.profiles
  const authorName = profile?.full_name || profile?.username || 'пользователя'
  const description = museum.description || `Коллекция цифровых артефактов от ${authorName}`
  const image = museum.cover_image_url || `${siteUrl}/og-image.png`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Kunstkamera',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: museum.title,
        },
      ],
      locale: 'ru_RU',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: profile?.username ? `@${profile.username}` : undefined,
    },
    alternates: {
      canonical: url,
    },
  }
}

// ISR: ревалидация каждые 60 секунд
export const revalidate = 60

export default async function PublicMuseumPage({
  params,
}: {
  params: { username: string; museumSlug: string }
}) {
  const museum = await getMuseum(params.username, params.museumSlug)

  if (!museum) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b bg-muted/40">
        <div className="container py-12">
          {museum.cover_image_url && (
            <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={museum.cover_image_url}
                alt={museum.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{museum.title}</h1>
              {museum.description && (
                <p className="text-xl text-muted-foreground">
                  {museum.description}
                </p>
              )}
              {(() => {
                const profile = Array.isArray(museum.profiles) ? museum.profiles[0] : museum.profiles
                return profile && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Создано {profile.full_name || profile.username}
                  </p>
                )
              })()}
            </div>
            <div className="flex gap-2">
              <ShareButtonClient
                title={museum.title}
                username={params.username}
                slug={params.museumSlug}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Artifacts */}
      <div className="container py-10">
        <MuseumArtifactsClient
          artifacts={museum.artifacts || []}
          layoutType={museum.layout_type || 'grid'}
        />
      </div>
    </div>
  )
}


