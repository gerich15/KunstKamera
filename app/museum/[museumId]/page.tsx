"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import type { Museum, Artifact } from '@/types'
import { Button } from '@/components/ui/button'
import { ArtifactCard } from '@/components/ArtifactCard'
import { Plus, Trash2, Edit, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ArtifactForm } from '@/components/ArtifactForm'

export default function MuseumEditPage({
  params,
}: {
  params: { museumId: string }
}) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const supabase = createSupabaseClient()
  const [museum, setMuseum] = useState<Museum | null>(null)
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [loading, setLoading] = useState(true)
  const [showArtifactForm, setShowArtifactForm] = useState(false)
  const [editingArtifact, setEditingArtifact] = useState<Artifact | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/')
      return
    }

    loadMuseum()
  }, [user, authLoading, params.museumId])

  async function loadMuseum() {
    try {
      const { data: museumData, error: museumError } = await supabase
        .from('museums')
        .select('*')
        .eq('id', params.museumId)
        .single()

      if (museumError) throw museumError

      // Проверяем, что пользователь - владелец
      if (museumData.user_id !== user?.id) {
        toast({
          title: 'Доступ запрещен',
          description: 'Вы не можете редактировать этот музей',
          variant: 'destructive',
        })
        router.push('/dashboard')
        return
      }

      setMuseum(museumData)

      // Загружаем экспонаты
      const { data: artifactsData, error: artifactsError } = await supabase
        .from('artifacts')
        .select('*')
        .eq('museum_id', params.museumId)
        .order('order_index', { ascending: true })

      if (artifactsError) throw artifactsError
      setArtifacts(artifactsData || [])
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

  async function handleDeleteArtifact(artifactId: string) {
    if (!confirm('Удалить этот экспонат?')) return

    try {
      const { error } = await supabase
        .from('artifacts')
        .delete()
        .eq('id', artifactId)

      if (error) throw error

      setArtifacts(artifacts.filter((a) => a.id !== artifactId))
      toast({
        title: 'Экспонат удален',
      })
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  function handleArtifactSaved() {
    setShowArtifactForm(false)
    setEditingArtifact(null)
    loadMuseum()
  }

  if (loading || authLoading) {
    return (
      <div className="container py-10">
        <p>Загрузка...</p>
      </div>
    )
  }

  if (!museum) {
    return (
      <div className="container py-10">
        <p>Музей не найден</p>
      </div>
    )
  }

  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/public/${user?.id}/${museum.slug}`
    : ''

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{museum.title}</h1>
          {museum.description && (
            <p className="text-muted-foreground mt-2">{museum.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={publicUrl} target="_blank">
            <Button variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Публичная страница
            </Button>
          </Link>
          <Button onClick={() => setShowArtifactForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить экспонат
          </Button>
        </div>
      </div>

      <div
        className={`grid gap-6 ${
          museum.layout_type === 'list'
            ? 'grid-cols-1'
            : museum.layout_type === 'masonry'
            ? 'md:grid-cols-2 lg:grid-cols-3'
            : 'md:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {artifacts.map((artifact) => (
          <div key={artifact.id} className="relative group">
            <ArtifactCard artifact={artifact} layout={museum.layout_type} />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                onClick={() => {
                  setEditingArtifact(artifact)
                  setShowArtifactForm(true)
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                onClick={() => handleDeleteArtifact(artifact.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {artifacts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">
            Пока нет экспонатов в этом музее
          </p>
          <Button onClick={() => setShowArtifactForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить первый экспонат
          </Button>
        </div>
      )}

      <Dialog open={showArtifactForm} onOpenChange={setShowArtifactForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingArtifact ? 'Редактировать экспонат' : 'Добавить экспонат'}
            </DialogTitle>
            <DialogDescription>
              Заполните информацию об экспонате
            </DialogDescription>
          </DialogHeader>
          <ArtifactForm
            museumId={museum.id}
            artifact={editingArtifact}
            onSuccess={handleArtifactSaved}
            onCancel={() => {
              setShowArtifactForm(false)
              setEditingArtifact(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

