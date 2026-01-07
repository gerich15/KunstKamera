/**
 * Диагностическая утилита для проверки конфигурации Supabase
 * Вызывайте эту функцию в консоли браузера для отладки
 */
export function checkSupabaseConfig() {
  if (typeof window === 'undefined') {
    console.log('❌ Эта функция должна вызываться только в браузере')
    return
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('🔍 Проверка конфигурации Supabase:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL не установлен')
  } else {
    console.log('✅ NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
    if (supabaseUrl.includes('placeholder')) {
      console.warn('⚠️  URL содержит "placeholder" - это неверное значение!')
    }
  }

  if (!supabaseAnonKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY не установлен')
  } else {
    const keyPreview = supabaseAnonKey.substring(0, 20) + '...' + supabaseAnonKey.substring(supabaseAnonKey.length - 10)
    console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY:', keyPreview)
    if (supabaseAnonKey.includes('placeholder')) {
      console.warn('⚠️  Ключ содержит "placeholder" - это неверное значение!')
    }
    if (supabaseAnonKey.length < 100) {
      console.warn('⚠️  Ключ слишком короткий - возможно, он неполный')
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('\n❌ ПРОБЛЕМА: Переменные окружения не настроены!')
    console.log('\n📝 Что делать:')
    console.log('1. Откройте файл .env.local в корне проекта')
    console.log('2. Убедитесь, что там есть строки:')
    console.log('   NEXT_PUBLIC_SUPABASE_URL=https://ваш-проект.supabase.co')
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш-anon-ключ')
    console.log('3. Сохраните файл')
    console.log('4. ОСТАНОВИТЕ сервер (Ctrl+C) и запустите заново: npm run dev')
    return false
  }

  if (supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder')) {
    console.error('\n❌ ПРОБЛЕМА: Используются placeholder значения!')
    console.log('Переменные окружения не загружены правильно.')
    console.log('Убедитесь, что файл .env.local существует и сервер перезапущен.')
    return false
  }

  console.log('\n✅ Конфигурация выглядит правильно!')
  console.log('\n💡 Если авторизация все еще не работает:')
  console.log('1. Проверьте в Supabase Dashboard → Settings → API, что ключи совпадают')
  console.log('2. Убедитесь, что пользователь существует в Authentication → Users')
  console.log('3. Проверьте, что Email confirmation отключен (для разработки)')
  console.log('4. Очистите cookies и localStorage браузера')
  
  return true
}

// Автоматически проверяем при загрузке (только в dev режиме)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Запускаем проверку через небольшую задержку, чтобы переменные успели загрузиться
  setTimeout(() => {
    console.log('\n🔧 Диагностика Supabase (автоматическая проверка):')
    checkSupabaseConfig()
  }, 1000)
}

