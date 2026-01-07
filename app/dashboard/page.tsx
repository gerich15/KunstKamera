"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createSupabaseClient } from '@/lib/supabase/client'
import { MuseumCard } from '@/components/MuseumCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Loader2 } from 'lucide-react'
import type { Museum } from '@/types'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [museums, setMuseums] = useState<Museum[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      loadMuseums()
    }
  }, [user, authLoading, router])

  const loadMuseums = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading museums:', error)
        setMuseums([])
      } else {
        setMuseums(data || [])
      }
    } catch (error) {
      console.error('Error in loadMuseums:', error)
      setMuseums([])
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container py-10 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Мои музеи</h1>
          <p className="text-muted-foreground mt-2">
            Управляйте своими коллекциями цифровых артефактов
          </p>
        </div>
        <Link href="/dashboard/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Создать музей
          </Button>
        </Link>
      </div>

      {museums && museums.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {museums.map((museum) => (
            <MuseumCard key={museum.id} museum={museum} isOwner />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">
            У вас пока нет музеев
          </p>
          <Link href="/dashboard/new">
            <Button>Создать первый музей</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

