-- Политики доступа для Storage
-- ВАЖНО: Выполните этот скрипт ПОСЛЕ создания buckets в Storage!

-- Сначала убедитесь, что buckets созданы:
-- 1. museum-covers (публичный)
-- 2. artifacts (публичный)

-- Политики для museum-covers
CREATE POLICY IF NOT EXISTS "Публичный доступ к обложкам музеев"
ON storage.objects FOR SELECT
USING (bucket_id = 'museum-covers');

CREATE POLICY IF NOT EXISTS "Пользователи могут загружать обложки"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'museum-covers' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY IF NOT EXISTS "Пользователи могут обновлять свои обложки"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'museum-covers' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY IF NOT EXISTS "Пользователи могут удалять свои обложки"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'museum-covers' AND
  auth.uid() IS NOT NULL
);

-- Политики для artifacts
CREATE POLICY IF NOT EXISTS "Публичный доступ к экспонатам"
ON storage.objects FOR SELECT
USING (bucket_id = 'artifacts');

CREATE POLICY IF NOT EXISTS "Пользователи могут загружать экспонаты"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'artifacts' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY IF NOT EXISTS "Пользователи могут обновлять свои экспонаты"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'artifacts' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY IF NOT EXISTS "Пользователи могут удалять свои экспонаты"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'artifacts' AND
  auth.uid() IS NOT NULL
);


