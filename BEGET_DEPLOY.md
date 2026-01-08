# 🚀 Развертывание на Beget

Пошаговая инструкция по развертыванию приложения Kunstkamera на хостинге Beget.

## 📋 Предварительные требования

1. **Аккаунт Beget** с доступом к:
   - SSH
   - Node.js (версия 18+)
   - Возможность запуска процессов в фоне (PM2 или systemd)

2. **Аккаунт Supabase** (для базы данных и аутентификации)

3. **Домен** (опционально, можно использовать поддомен Beget)

---

## 🔧 Шаг 1: Подготовка проекта

### 1.1. Клонирование репозитория

Подключитесь к серверу Beget по SSH:

```bash
ssh your-username@your-server.beget.com
```

Создайте директорию для проекта:

```bash
cd ~
mkdir kunstkamera
cd kunstkamera
```

Клонируйте репозиторий (или загрузите файлы через FTP/SFTP):

```bash
git clone https://github.com/gerich15/KunstKamera.git .
```

---

## 🔐 Шаг 2: Настройка переменных окружения

Создайте файл `.env.local` в корне проекта:

```bash
nano .env.local
```

Добавьте следующие переменные:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# URL вашего сайта
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Node.js
NODE_ENV=production
PORT=3000
```

**Где взять ключи Supabase:**
1. Откройте [Supabase Dashboard](https://app.supabase.com)
2. Выберите ваш проект
3. Перейдите в **Settings** → **API**
4. Скопируйте:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret key** → `SUPABASE_SERVICE_ROLE_KEY`

Сохраните файл (Ctrl+O, Enter, Ctrl+X в nano).

---

## 📦 Шаг 3: Установка зависимостей

Установите Node.js зависимости:

```bash
npm install --production
```

**Примечание:** Если на сервере нет Node.js 18+, обратитесь в поддержку Beget для установки.

---

## 🔨 Шаг 4: Сборка проекта

Соберите Next.js приложение:

```bash
npm run build
```

Это создаст оптимизированную production версию в папке `.next`.

---

## ⚙️ Шаг 5: Настройка Supabase

### 5.1. Настройка Redirect URLs

1. Откройте [Supabase Dashboard](https://app.supabase.com)
2. Перейдите в **Authentication** → **URL Configuration**
3. В **Redirect URLs** добавьте:
   ```
   https://your-domain.com/**
   https://your-domain.com/auth/callback
   ```
4. В **Site URL** укажите: `https://your-domain.com`
5. Сохраните изменения

### 5.2. Применение SQL схемы

1. В Supabase Dashboard перейдите в **SQL Editor**
2. Откройте файл `supabase/schema.sql` из проекта
3. Скопируйте содержимое и выполните в SQL Editor
4. Повторите для `supabase/apply-storage-policies.sql`

---

## 🚀 Шаг 6: Запуск приложения

### Вариант 1: Использование PM2 (рекомендуется)

#### 6.1. Установка PM2

```bash
npm install -g pm2
```

#### 6.2. Настройка конфигурации

Отредактируйте `ecosystem.config.js`:

```bash
nano ecosystem.config.js
```

Измените путь `cwd` на ваш реальный путь:

```javascript
cwd: '/home/u/your-username/kunstkamera',
```

#### 6.3. Запуск через PM2

```bash
pm2 start ecosystem.config.js
```

#### 6.4. Сохранение конфигурации PM2

```bash
pm2 save
pm2 startup
```

Следуйте инструкциям, которые выведет команда `pm2 startup`.

#### 6.5. Управление приложением

```bash
# Просмотр статуса
pm2 status

# Просмотр логов
pm2 logs kunstkamera

# Перезапуск
pm2 restart kunstkamera

# Остановка
pm2 stop kunstkamera
```

### Вариант 2: Использование systemd (альтернатива)

Создайте файл сервиса:

```bash
sudo nano /etc/systemd/system/kunstkamera.service
```

Добавьте:

```ini
[Unit]
Description=Kunstkamera Next.js App
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/home/u/your-username/kunstkamera
Environment=NODE_ENV=production
EnvironmentFile=/home/u/your-username/kunstkamera/.env.local
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Активируйте сервис:

```bash
sudo systemctl daemon-reload
sudo systemctl enable kunstkamera
sudo systemctl start kunstkamera
```

Проверьте статус:

```bash
sudo systemctl status kunstkamera
```

---

## 🌐 Шаг 7: Настройка веб-сервера

### Вариант 1: Nginx (рекомендуется)

Создайте конфигурацию Nginx:

```bash
sudo nano /etc/nginx/sites-available/kunstkamera
```

Добавьте:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Кэширование статических файлов
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

Активируйте конфигурацию:

```bash
sudo ln -s /etc/nginx/sites-available/kunstkamera /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Вариант 2: Apache

Если используете Apache, файл `.htaccess` уже создан в проекте. Убедитесь, что включены модули:

```bash
sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo systemctl restart apache2
```

---

## 🔒 Шаг 8: Настройка SSL (HTTPS)

### Использование Let's Encrypt (бесплатно)

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Или для Apache:

```bash
sudo certbot --apache -d your-domain.com -d www.your-domain.com
```

Следуйте инструкциям. Сертификат будет автоматически обновляться.

---

## ✅ Шаг 9: Проверка работы

1. Откройте ваш сайт в браузере: `https://your-domain.com`
2. Проверьте:
   - ✅ Страница загружается
   - ✅ Стили применяются
   - ✅ Можно зарегистрироваться
   - ✅ Можно войти
   - ✅ Можно создать музей

---

## 🔄 Обновление приложения

Когда нужно обновить код:

```bash
cd ~/kunstkamera
git pull
npm install --production
npm run build
pm2 restart kunstkamera
```

Или если используете systemd:

```bash
cd ~/kunstkamera
git pull
npm install --production
npm run build
sudo systemctl restart kunstkamera
```

---

## 🐛 Решение проблем

### Приложение не запускается

1. Проверьте логи:
   ```bash
   pm2 logs kunstkamera
   # или
   sudo journalctl -u kunstkamera -f
   ```

2. Проверьте переменные окружения:
   ```bash
   cat .env.local
   ```

3. Проверьте, что порт 3000 свободен:
   ```bash
   netstat -tulpn | grep 3000
   ```

### Стили не загружаются

1. Убедитесь, что сборка прошла успешно:
   ```bash
   ls -la .next/static/css
   ```

2. Проверьте права доступа:
   ```bash
   chmod -R 755 .next
   ```

3. Очистите кэш и пересоберите:
   ```bash
   rm -rf .next
   npm run build
   ```

### Ошибки аутентификации

1. Проверьте Redirect URLs в Supabase
2. Убедитесь, что `NEXT_PUBLIC_SITE_URL` указан правильно
3. Проверьте переменные окружения в `.env.local`

### Проблемы с базой данных

1. Проверьте подключение к Supabase в логах
2. Убедитесь, что SQL схемы применены
3. Проверьте RLS политики в Supabase Dashboard

---

## 📞 Поддержка

Если возникли проблемы:

1. Проверьте логи приложения
2. Проверьте логи веб-сервера (Nginx/Apache)
3. Обратитесь в поддержку Beget
4. Проверьте документацию Next.js: https://nextjs.org/docs/deployment

---

## 📝 Чеклист развертывания

- [ ] Репозиторий склонирован на сервер
- [ ] Файл `.env.local` создан и заполнен
- [ ] Зависимости установлены (`npm install`)
- [ ] Проект собран (`npm run build`)
- [ ] Supabase настроен (Redirect URLs, SQL схемы)
- [ ] Приложение запущено (PM2 или systemd)
- [ ] Веб-сервер настроен (Nginx/Apache)
- [ ] SSL сертификат установлен
- [ ] Сайт доступен и работает
- [ ] Регистрация и вход работают
- [ ] Можно создавать музеи и экспонаты

---

**Готово! Ваше приложение должно быть доступно по адресу вашего домена.** 🎉

