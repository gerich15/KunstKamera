# 🔑 Переменные окружения для Beget

## ✅ ОБЯЗАТЕЛЬНО для работы приложения:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hwgqzsziskhnqqbjpdvz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_anon_ключ_из_supabase
```

**Без этих двух переменных приложение НЕ БУДЕТ работать!**

---

## ⚠️ РЕКОМЕНДУЕТСЯ (для OAuth и SEO):

```env
NEXT_PUBLIC_SITE_URL=https://ваш-реальный-домен.com
```

**Важно:** 
- Замените на ваш реальный домен на Beget
- Нужно для правильной работы OAuth редиректов (GitHub, Email)
- Нужно для правильной генерации sitemap.xml и robots.txt

---

## 🔧 Для production (опционально, но рекомендуется):

```env
NODE_ENV=production
PORT=3000
```

**Примечание:**
- `NODE_ENV=production` - включает оптимизации Next.js
- `PORT=3000` - порт, на котором будет работать приложение (или другой, если настроен)

---

## ❌ НЕ НУЖНО на Beget:

```env
# SUPABASE_SERVICE_ROLE_KEY - не используется в текущем коде
```

---

## 📋 Итоговый минимальный .env.local для Beget:

```env
# Обязательные
NEXT_PUBLIC_SUPABASE_URL=https://hwgqzsziskhnqqbjpdvz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_anon_ключ

# Рекомендуется
NEXT_PUBLIC_SITE_URL=https://ваш-домен.beget.app
# или
NEXT_PUBLIC_SITE_URL=https://ваш-домен.com

# Production
NODE_ENV=production
PORT=3000
```

---

## 🔍 Где взять ключи:

1. **NEXT_PUBLIC_SUPABASE_URL** и **NEXT_PUBLIC_SUPABASE_ANON_KEY**:
   - Откройте [Supabase Dashboard](https://app.supabase.com)
   - Выберите проект
   - Settings → API
   - Скопируйте:
     - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
     - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **NEXT_PUBLIC_SITE_URL**:
   - Это URL вашего сайта на Beget
   - Например: `https://your-site.beget.app` или `https://your-domain.com`

---

## ✅ Чеклист перед деплоем:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - скопирован из Supabase
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - скопирован из Supabase
- [ ] `NEXT_PUBLIC_SITE_URL` - указан реальный домен (не localhost!)
- [ ] `NODE_ENV=production` - установлен
- [ ] `PORT=3000` - соответствует настройкам PM2/Nginx
