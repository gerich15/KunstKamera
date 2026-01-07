"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import type { Museum } from '@/types'
import { Eye, Calendar } from 'lucide-react'

interface MuseumCardProps {
  museum: Museum
  isOwner?: boolean
}

export function MuseumCard({ museum, isOwner = false }: MuseumCardProps) {
  // Безопасная обработка profiles (может быть объектом или массивом)
  const profile = Array.isArray(museum.profiles) ? museum.profiles[0] : museum.profiles
  const username = profile?.username || museum.user_id
  
  const href = isOwner
    ? `/museum/${museum.id}`
    : `/public/${username}/${museum.slug}`

  return (
    <Link href={href}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        {museum.cover_image_url && (
          <div className="relative w-full h-48">
            <Image
              src={museum.cover_image_url}
              alt={museum.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="line-clamp-2">{museum.title}</CardTitle>
          {museum.description && (
            <CardDescription className="line-clamp-2">
              {museum.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(museum.created_at)}</span>
            </div>
            {museum.artifacts && (
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{museum.artifacts.length} экспонатов</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}


