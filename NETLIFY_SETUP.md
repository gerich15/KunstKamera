# Настройка Netlify для Kunstkamera

## Переменные окружения

Для работы приложения на Netlify необходимо настроить следующие переменные окружения:

### Обязательные переменные

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Ваш URL проекта Supabase
   - Формат: `https://ваш-project-id.supabase.co`
   - Где найти: Supabase Dashboard → Settings → API → Project URL

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Ваш публичный (anon) ключ Supabase
   - Формат: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Где найти: Supabase Dashboard → Settings → API → Project API keys → `anon` `public`

### Опциональные переменные

3. **NEXT_PUBLIC_SITE_URL** (опционально)
   - URL вашего сайта на Netlify
   - Формат: `https://your-site-name.netlify.app` или ваш кастомный домен
   - Используется для SEO метатегов и OAuth редиректов
   - Если не указан, будет использован `http://localhost:3000` (для разработки)

## Как добавить переменные в Netlify

1. Откройте ваш проект в [Netlify Dashboard](https://app.netlify.com)
2. Перейдите в **Site settings** → **Build & deploy** → **Environment**
3. Нажмите **Add variable**
4. Добавьте каждую переменную:
   - **Key**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: ваш URL из Supabase
   - **Scopes**: выберите "All scopes" (или "Build" и "Runtime")
5. Повторите для всех переменных

## После добавления переменных

1. Перейдите в **Deploys**
2. Нажмите **Trigger deploy** → **Clear cache and deploy site**
3. Дождитесь завершения сборки

## Проверка

После успешного деплоя проверьте:
- ✅ Сайт открывается без ошибок
- ✅ Страница `/sitemap.xml` доступна
- ✅ Авторизация работает
- ✅ Загрузка файлов работает

## Важно

⚠️ **НЕ добавляйте** переменные окружения в `.env.local` в git репозиторий!
- `.env.local` уже в `.gitignore`
- Переменные должны быть настроены только в Netlify Dashboard

## Troubleshooting

### Ошибка "Cannot find module 'critters'"
✅ **Исправлено**: Убрана экспериментальная функция `optimizeCss` из `next.config.js`

### Ошибка "Missing Supabase environment variables"
- Проверьте, что переменные добавлены в Netlify Dashboard
- Убедитесь, что выбраны правильные scopes (Build и Runtime)
- Очистите кэш и пересоберите проект

### Sitemap не генерируется
- Проверьте, что `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY` настроены
- Sitemap будет работать даже без переменных, но будет содержать только базовые URL

