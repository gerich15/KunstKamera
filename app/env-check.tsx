"use client"

import { useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

export function EnvCheck() {
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const hasUrl = !!supabaseUrl && !supabaseUrl.includes('placeholder')
    const hasKey = !!supabaseAnonKey && !supabaseAnonKey.includes('placeholder')

    if (!hasUrl || !hasKey) {
      console.error('❌ Проблема с переменными окружения Supabase:')
      console.error('NEXT_PUBLIC_SUPABASE_URL:', hasUrl ? '✅' : '❌')
      console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', hasKey ? '✅' : '❌')
      console.error('\n💡 Решение:')
      console.error('1. Проверьте файл .env.local в корне проекта')
      console.error('2. Убедитесь, что переменные установлены правильно')
      console.error('3. ПЕРЕЗАПУСТИТЕ сервер (Ctrl+C, затем npm run dev)')
      console.error('\n📖 Подробнее: см. DIAGNOSTICS.md')

      toast({
        title: '⚠️ Настройка требуется',
        description: 'Проверьте переменные окружения Supabase. См. консоль для деталей.',
        variant: 'destructive',
        duration: 10000,
      })
    } else {
      // В dev режиме показываем успешную загрузку
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Переменные окружения Supabase загружены правильно')
      }
    }
  }, [toast])

  return null
}


