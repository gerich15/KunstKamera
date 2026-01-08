# 🚀 Начало миграции с Supabase

## ✅ Что уже сделано

1. ✅ Создан план миграции (`MIGRATION_PLAN.md`)
2. ✅ Создана Prisma схема (`prisma/schema.prisma`)

## 📋 Следующие шаги

### 1. Установка зависимостей

```bash
npm install next-auth@beta @prisma/client prisma bcryptjs
npm install -D @types/bcryptjs
```

### 2. Настройка Prisma

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 3. Настройка переменных окружения

Создайте `.env.local`:

```env
# База данных PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/kunstkamera

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=сгенерируйте-секретный-ключ

# GitHub OAuth (опционально)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 4. Создание NextAuth.js конфигурации

Создайте `app/api/auth/[...nextauth]/route.ts`

### 5. Замена компонентов

- Заменить `lib/supabase/client.ts` на Prisma клиент
- Заменить `hooks/useAuth.ts` на NextAuth.js
- Заменить `components/FileUploader.tsx` на локальное хранилище

## ⚠️ Важно

Это большая миграция. Рекомендуется:
1. Создать отдельную ветку Git
2. Тестировать каждый шаг
3. Сохранить резервную копию данных из Supabase

## 🆘 Нужна помощь?

Если что-то не работает, проверьте:
- Подключение к PostgreSQL
- Правильность переменных окружения
- Логи приложения

