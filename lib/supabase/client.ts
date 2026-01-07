import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton для клиента Supabase (только в браузере)
let supabaseClient: SupabaseClient | null = null

export function createSupabaseClient() {
  // Если клиент уже создан, возвращаем его (singleton pattern)
  if (typeof window !== 'undefined' && supabaseClient) {
    return supabaseClient
  }

  // Проверяем наличие переменных окружения
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined') {
      console.error(
        '❌ Missing Supabase environment variables!',
        '\nNEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌',
        '\nNEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌',
        '\n\nPlease check your .env.local file and restart the dev server.'
      )
    }
    // Возвращаем клиент с placeholder значениями для предотвращения краша
    // Это позволит приложению работать, но функции аутентификации не будут работать
    const placeholderClient = createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-key'
    )
    if (typeof window !== 'undefined') {
      supabaseClient = placeholderClient
    }
    return placeholderClient
  }

  // Проверяем, что URL и ключ не являются placeholder значениями
  if (supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder')) {
    if (typeof window !== 'undefined') {
      console.error('❌ Supabase environment variables are using placeholder values!')
    }
  }
  
  // Используем прямой createClient с явными переменными
  // Это гарантирует, что используются правильные значения из .env.local
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  })

  // Кэшируем клиент для повторного использования (только в браузере)
  if (typeof window !== 'undefined') {
    supabaseClient = client
  }

  return client
}

export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

