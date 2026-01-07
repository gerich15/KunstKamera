# 🔐 Настройка аутентификации GitHub

## Вариант 1: Personal Access Token (рекомендуется)

### Шаг 1: Создайте Personal Access Token

1. Откройте [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Нажмите **Generate new token** → **Generate new token (classic)**
3. Название: `Kunstkamera Deploy`
4. Выберите срок действия (например, 90 дней или No expiration)
5. Выберите права доступа:
   - ✅ **repo** (полный доступ к репозиториям)
6. Нажмите **Generate token**
7. **ВАЖНО**: Скопируйте токен сразу! Он показывается только один раз.

### Шаг 2: Используйте токен для push

```bash
# При push Git запросит username и password
# Username: ваш GitHub username (gerich15)
# Password: вставьте Personal Access Token (НЕ ваш пароль GitHub!)

git push -u origin main
```

### Шаг 3: Сохраните токен (опционально)

Чтобы не вводить токен каждый раз:

```bash
# Сохраните токен в git credential helper
git config --global credential.helper store

# При следующем push введите токен один раз, он сохранится
```

## Вариант 2: SSH ключи (более безопасно)

### Шаг 1: Проверьте, есть ли SSH ключ

```bash
ls -la ~/.ssh/id_*.pub
```

Если файл есть, переходите к шагу 3.

### Шаг 2: Создайте SSH ключ

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# Нажмите Enter для всех вопросов (или введите пароль для ключа)
```

### Шаг 3: Добавьте SSH ключ в GitHub

1. Скопируйте публичный ключ:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   # Или если используете RSA:
   # cat ~/.ssh/id_rsa.pub
   ```

2. Откройте [GitHub Settings → SSH and GPG keys](https://github.com/settings/keys)
3. Нажмите **New SSH key**
4. Title: `Kunstkamera Deploy`
5. Key: вставьте скопированный ключ
6. Нажмите **Add SSH key**

### Шаг 4: Измените remote на SSH

```bash
# Измените URL на SSH
git remote set-url origin git@github.com:gerich15/KunstKamera.git

# Проверьте
git remote -v

# Теперь push должен работать
git push -u origin main
```

## Вариант 3: GitHub CLI (gh)

Если у вас установлен GitHub CLI:

```bash
# Авторизуйтесь
gh auth login

# Выберите:
# - GitHub.com
# - HTTPS
# - Authenticate Git with your GitHub credentials? Yes
# - Login with a web browser

# После авторизации push должен работать
git push -u origin main
```

## Проверка

После настройки проверьте:

```bash
git push -u origin main
```

Если всё настроено правильно, вы увидите:
```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
Writing objects: 100% (X/X), done.
To https://github.com/gerich15/KunstKamera.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

## Troubleshooting

### Ошибка "Authentication failed"
- Проверьте, что токен/ключ правильный
- Для HTTPS: убедитесь, что используете токен, а не пароль
- Для SSH: проверьте `ssh -T git@github.com`

### Ошибка "Permission denied"
- Проверьте, что у токена/ключа есть права на репозиторий
- Убедитесь, что репозиторий существует на GitHub

