-- Применение только политик RLS (если таблицы уже созданы)
-- Этот скрипт можно выполнять несколько раз

-- Политики для profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Пользователи могут видеть все профили'
  ) THEN
    CREATE POLICY "Пользователи могут видеть все профили"
    ON public.profiles FOR SELECT
    USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Пользователи могут обновлять только свой профиль'
  ) THEN
    CREATE POLICY "Пользователи могут обновлять только свой профиль"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Пользователи могут создавать свой профиль'
  ) THEN
    CREATE POLICY "Пользователи могут создавать свой профиль"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Политики для museums
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'museums' 
    AND policyname = 'Музеи видны всем, если публичные, или владельцу'
  ) THEN
    CREATE POLICY "Музеи видны всем, если публичные, или владельцу"
    ON public.museums FOR SELECT
    USING (is_public = true OR auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'museums' 
    AND policyname = 'Пользователи могут создавать только свои музеи'
  ) THEN
    CREATE POLICY "Пользователи могут создавать только свои музеи"
    ON public.museums FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'museums' 
    AND policyname = 'Пользователи могут редактировать только свои музеи'
  ) THEN
    CREATE POLICY "Пользователи могут редактировать только свои музеи"
    ON public.museums FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'museums' 
    AND policyname = 'Пользователи могут удалять только свои музеи'
  ) THEN
    CREATE POLICY "Пользователи могут удалять только свои музеи"
    ON public.museums FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Политики для artifacts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'artifacts' 
    AND policyname = 'Экспонаты видны всем, если музей публичный, или владельцу музея'
  ) THEN
    CREATE POLICY "Экспонаты видны всем, если музей публичный, или владельцу музея"
    ON public.artifacts FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.museums
        WHERE museums.id = artifacts.museum_id
        AND (museums.is_public = true OR museums.user_id = auth.uid())
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'artifacts' 
    AND policyname = 'Пользователи могут создавать экспонаты только в своих музеях'
  ) THEN
    CREATE POLICY "Пользователи могут создавать экспонаты только в своих музеях"
    ON public.artifacts FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.museums
        WHERE museums.id = artifacts.museum_id
        AND museums.user_id = auth.uid()
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'artifacts' 
    AND policyname = 'Пользователи могут редактировать экспонаты только в своих музеях'
  ) THEN
    CREATE POLICY "Пользователи могут редактировать экспонаты только в своих музеях"
    ON public.artifacts FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.museums
        WHERE museums.id = artifacts.museum_id
        AND museums.user_id = auth.uid()
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'artifacts' 
    AND policyname = 'Пользователи могут удалять экспонаты только из своих музеев'
  ) THEN
    CREATE POLICY "Пользователи могут удалять экспонаты только из своих музеев"
    ON public.artifacts FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM public.museums
        WHERE museums.id = artifacts.museum_id
        AND museums.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Политики для likes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'likes' 
    AND policyname = 'Лайки видны всем'
  ) THEN
    CREATE POLICY "Лайки видны всем"
    ON public.likes FOR SELECT
    USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'likes' 
    AND policyname = 'Пользователи могут создавать только свои лайки'
  ) THEN
    CREATE POLICY "Пользователи могут создавать только свои лайки"
    ON public.likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'likes' 
    AND policyname = 'Пользователи могут удалять только свои лайки'
  ) THEN
    CREATE POLICY "Пользователи могут удалять только свои лайки"
    ON public.likes FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;


