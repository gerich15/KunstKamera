-- Создание индексов (если они еще не созданы)
-- Этот скрипт можно выполнять несколько раз

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'museums_user_id_idx') THEN
    CREATE INDEX museums_user_id_idx ON public.museums(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'museums_slug_idx') THEN
    CREATE INDEX museums_slug_idx ON public.museums(slug);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'artifacts_museum_id_idx') THEN
    CREATE INDEX artifacts_museum_id_idx ON public.artifacts(museum_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'artifacts_order_idx') THEN
    CREATE INDEX artifacts_order_idx ON public.artifacts(museum_id, order_index);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'likes_museum_id_idx') THEN
    CREATE INDEX likes_museum_id_idx ON public.likes(museum_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'likes_user_id_idx') THEN
    CREATE INDEX likes_user_id_idx ON public.likes(user_id);
  END IF;
END $$;


