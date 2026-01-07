-- Политики доступа для Storage
-- ВАЖНО: Выполните этот скрипт ПОСЛЕ создания buckets в Storage!
-- Этот скрипт можно выполнять несколько раз - он использует IF NOT EXISTS

-- Удаляем старые политики, если они есть (опционально)
-- DROP POLICY IF EXISTS "Публичный доступ к обложкам музеев" ON storage.objects;
-- DROP POLICY IF EXISTS "Пользователи могут загружать обложки" ON storage.objects;
-- DROP POLICY IF EXISTS "Пользователи могут обновлять свои обложки" ON storage.objects;
-- DROP POLICY IF EXISTS "Пользователи могут удалять свои обложки" ON storage.objects;
-- DROP POLICY IF EXISTS "Публичный доступ к экспонатам" ON storage.objects;
-- DROP POLICY IF EXISTS "Пользователи могут загружать экспонаты" ON storage.objects;
-- DROP POLICY IF EXISTS "Пользователи могут обновлять свои экспонаты" ON storage.objects;
-- DROP POLICY IF EXISTS "Пользователи могут удалять свои экспонаты" ON storage.objects;

-- Политики для museum-covers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Публичный доступ к обложкам музеев'
  ) THEN
    CREATE POLICY "Публичный доступ к обложкам музеев"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'museum-covers');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Пользователи могут загружать обложки'
  ) THEN
    CREATE POLICY "Пользователи могут загружать обложки"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'museum-covers' AND
      auth.uid() IS NOT NULL
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Пользователи могут обновлять свои обложки'
  ) THEN
    CREATE POLICY "Пользователи могут обновлять свои обложки"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'museum-covers' AND
      auth.uid() IS NOT NULL
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Пользователи могут удалять свои обложки'
  ) THEN
    CREATE POLICY "Пользователи могут удалять свои обложки"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'museum-covers' AND
      auth.uid() IS NOT NULL
    );
  END IF;
END $$;

-- Политики для artifacts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Публичный доступ к экспонатам'
  ) THEN
    CREATE POLICY "Публичный доступ к экспонатам"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'artifacts');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Пользователи могут загружать экспонаты'
  ) THEN
    CREATE POLICY "Пользователи могут загружать экспонаты"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'artifacts' AND
      auth.uid() IS NOT NULL
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Пользователи могут обновлять свои экспонаты'
  ) THEN
    CREATE POLICY "Пользователи могут обновлять свои экспонаты"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'artifacts' AND
      auth.uid() IS NOT NULL
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Пользователи могут удалять свои экспонаты'
  ) THEN
    CREATE POLICY "Пользователи могут удалять свои экспонаты"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'artifacts' AND
      auth.uid() IS NOT NULL
    );
  END IF;
END $$;


