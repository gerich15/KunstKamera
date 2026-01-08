"use client"

import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import type { Profile } from '@/types'

export function useAuth() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true)
      return
    }

    if (status === 'unauthenticated') {
      setLoading(false)
      setProfile(null)
      return
    }

    if (session?.user) {
      // Загружаем профиль пользователя
      fetch(`/api/profile`)
        .then((res) => res.json())
        .then((data) => {
          if (data.profile) {
            setProfile(data.profile)
          }
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [session, status])

  const signOut = async () => {
    await nextAuthSignOut({ callbackUrl: '/' })
  }

  return {
    user: session?.user || null,
    profile,
    loading,
    isAuthenticated: !!session?.user,
    signOut,
  }
}
