"use client"

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    // Проверяем наличие переменных окружения
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setLoading(false)
      return
    }

    // Таймаут на случай, если загрузка зависнет
    const timeoutId = setTimeout(() => {
      console.warn('Auth check timeout, setting loading to false')
      setLoading(false)
    }, 5000) // 5 секунд максимум

    // Сначала проверяем сессию
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          clearTimeout(timeoutId)
          setLoading(false)
          return
        }

        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
          clearTimeout(timeoutId)
        } else {
          // Если нет сессии, проверяем пользователя
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            setUser(user)
            await fetchProfile(user.id)
            clearTimeout(timeoutId)
          } else {
            clearTimeout(timeoutId)
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('Error checking session:', error)
        clearTimeout(timeoutId)
        setLoading(false)
      }
    }

    checkSession()

    return () => {
      clearTimeout(timeoutId)
    }

    // Слушаем изменения аутентификации
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        // Если профиль не найден, это не критично - пользователь всё равно авторизован
        setProfile(null)
        setLoading(false)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error in fetchProfile:', error)
      setProfile(null)
    } finally {
      // Всегда устанавливаем loading в false после попытки загрузки профиля
      setLoading(false)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return {
    user,
    profile,
    loading,
    signOut,
  }
}

