# Инструкция по настройке Kunstkamera

## 1. Настройка Supabase

### Создание проекта
1. Перейдите на [supabase.com](https://supabase.com) и создайте новый проект
2. Дождитесь завершения инициализации проекта

### Настройка базы данных
1. Откройте SQL Editor в панели Supabase
2. Скопируйте содержимое файла `supabase/schema.sql`
3. Выполните SQL скрипт в SQL Editor

### Настройка Storage (хранилище файлов)
1. Перейдите в раздел Storage в панели Supabase
2. Создайте два bucket:
   - `museum-covers` - для обложек музеев
   - `artifacts` - для экспонатов (изображения, видео)
3. Для каждого bucket:
   - Установите публичный доступ (Public bucket)
   - Или настройте политики доступа через RLS

### Настройка аутентификации
1. Перейдите в раздел Authentication > Providers
2. Включите Email provider
3. **Для разработки (опционально):** Отключите "Confirm email" - пользователи смогут сразу войти без подтверждения
4. Включите GitHub OAuth (опционально):
   - Создайте OAuth App на GitHub (НЕ GitHub App!)
   - Добавьте Client ID и Client Secret в настройки GitHub provider
   - Укажите Redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### Настройка SMTP (опционально, для MVP не обязательно)

Supabase имеет встроенный SMTP, который работает для базовых случаев (3 письма в час).

**Для MVP можно пропустить настройку SMTP:**
- Встроенный SMTP достаточно для тестирования
- Можно отключить подтверждение email для разработки
- Настройте кастомный SMTP позже, если понадобится

Если все же хотите настроить:
1. Перейдите в Settings > Auth > SMTP Settings
2. Используйте бесплатный SMTP (Gmail с App Password, Mailgun и т.д.)
3. Или оставьте встроенный SMTP (рекомендуется для MVP)

### Получение ключей API
1. Перейдите в Settings > API
2. Скопируйте:
   - Project URL (это `NEXT_PUBLIC_SUPABASE_URL`)
   - `anon` `public` key (это `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - `service_role` `secret` key (это `SUPABASE_SERVICE_ROLE_KEY`)

## 2. Настройка локального окружения

1. Скопируйте `.env.local.example` в `.env.local`:
```bash
cp .env.local.example .env.local
```

2. Заполните переменные окружения в `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 3. Установка зависимостей

```bash
npm install
```

## 4. Запуск приложения

```bash
npm run dev
```

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000)

## 5. Развертывание на Vercel

1. Подключите ваш репозиторий к Vercel
2. В настройках проекта добавьте переменные окружения:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Также добавьте переменную `NEXT_PUBLIC_SITE_URL` с URL вашего сайта на Vercel
4. Деплой произойдет автоматически

## 6. Настройка Storage политик (опционально)

Если вы хотите использовать приватные bucket, создайте политики в SQL Editor:

```sql
-- Политика для museum-covers
CREATE POLICY "Пользователи могут загружать обложки в свои музеи"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'museum-covers' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Публичный доступ к обложкам"
ON storage.objects FOR SELECT
USING (bucket_id = 'museum-covers');

-- Политика для artifacts
CREATE POLICY "Пользователи могут загружать экспонаты"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'artifacts' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Публичный доступ к экспонатам"
ON storage.objects FOR SELECT
USING (bucket_id = 'artifacts');
```

## Примечания

- Убедитесь, что все bucket настроены как публичные, или настройте соответствующие политики RLS
- Для работы GitHub OAuth необходимо настроить OAuth App на GitHub
- После создания профиля пользователя, username будет автоматически сгенерирован из email

