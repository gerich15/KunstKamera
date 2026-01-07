"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Проверяем, есть ли ошибка в URL
        const urlParams = new URLSearchParams(window.location.search)
        const error = urlParams.get('error')
        const errorDescription = urlParams.get('error_description')

        if (error) {
          console.error('OAuth error:', error, errorDescription)
          
          // Показываем понятное сообщение об ошибке
          let errorMessage = 'Ошибка авторизации'
          if (error === 'server_error') {
            if (errorDescription?.includes('exchange')) {
              errorMessage = 'Ошибка обмена кода. Проверьте настройки GitHub OAuth в Supabase (Client Secret)'
            } else if (errorDescription?.includes('profile') || errorDescription?.includes('user profile')) {
              errorMessage = 'Ошибка получения профиля. Убедитесь, что ваш email виден в настройках GitHub (Settings → Profile → Email → Keep my email addresses private - должно быть выключено)'
            } else {
              errorMessage = `Ошибка сервера: ${errorDescription || error}`
            }
          }
          
          router.push(`/login?error=${encodeURIComponent(errorMessage)}`)
          return
        }

        // Обрабатываем OAuth callback
        const { data, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Session error:', sessionError)
          router.push('/login?error=auth_failed')
          return
        }

        // Проверяем, есть ли сессия
        if (data.session) {
          // Ждем немного, чтобы сессия сохранилась
          await new Promise(resolve => setTimeout(resolve, 500))
          router.push('/dashboard')
          router.refresh()
        } else {
          // Пытаемся получить сессию из URL (для OAuth)
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const accessToken = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')

          if (accessToken && refreshToken) {
            // Устанавливаем сессию вручную
            const { error: setError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })

            if (!setError) {
              router.push('/dashboard')
              router.refresh()
              return
            }
          }

          router.push('/login?error=no_session')
        }
      } catch (error) {
        console.error('Error in auth callback:', error)
        router.push('/login?error=callback_error')
      }
    }

    handleAuthCallback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="container py-20">
      <div className="text-center">
        <p>Обработка входа...</p>
      </div>
    </div>
  )
}

