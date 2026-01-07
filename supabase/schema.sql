-- Kunstkamera Database Schema
-- Выполните этот скрипт в SQL Editor вашего Supabase проекта

-- 1. Профили пользователей (расширяет стандартную таблицу auth.users Supabase)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Музеи
create table if not exists public.museums (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  slug text not null unique, -- для URL
  description text,
  cover_image_url text, -- ссылка на обложку в Storage
  is_public boolean default true,
  layout_type text default 'grid', -- 'grid', 'masonry', 'list'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Экспонаты
create table if not exists public.artifacts (
  id uuid default gen_random_uuid() primary key,
  museum_id uuid references public.museums(id) on delete cascade not null,
  title text not null,
  description text,
  artifact_type text not null, -- 'image', 'text', 'link', 'video'
  content_url text, -- для image/video — ссылка на Storage, для link — URL
  file_metadata jsonb, -- размер, имя файла
  order_index integer default 0, -- для сортировки
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Лайки (опционально)
create table if not exists public.likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  museum_id uuid references public.museums(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, museum_id) -- один лайк от пользователя на музей
);

-- Индексы для производительности
-- Используем DO блок для безопасного создания индексов
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

-- Включи Row Level Security (RLS) на все таблицы
alter table public.profiles enable row level security;
alter table public.museums enable row level security;
alter table public.artifacts enable row level security;
alter table public.likes enable row level security;

-- Политики для profiles
create policy "Пользователи могут видеть все профили"
  on public.profiles for select
  using (true);

create policy "Пользователи могут обновлять только свой профиль"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Пользователи могут создавать свой профиль"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Политики для museums
create policy "Музеи видны всем, если публичные, или владельцу"
  on public.museums for select
  using (is_public = true or auth.uid() = user_id);

create policy "Пользователи могут создавать только свои музеи"
  on public.museums for insert
  with check (auth.uid() = user_id);

create policy "Пользователи могут редактировать только свои музеи"
  on public.museums for update
  using (auth.uid() = user_id);

create policy "Пользователи могут удалять только свои музеи"
  on public.museums for delete
  using (auth.uid() = user_id);

-- Политики для artifacts
create policy "Экспонаты видны всем, если музей публичный, или владельцу музея"
  on public.artifacts for select
  using (
    exists (
      select 1 from public.museums
      where museums.id = artifacts.museum_id
      and (museums.is_public = true or museums.user_id = auth.uid())
    )
  );

create policy "Пользователи могут создавать экспонаты только в своих музеях"
  on public.artifacts for insert
  with check (
    exists (
      select 1 from public.museums
      where museums.id = artifacts.museum_id
      and museums.user_id = auth.uid()
    )
  );

create policy "Пользователи могут редактировать экспонаты только в своих музеях"
  on public.artifacts for update
  using (
    exists (
      select 1 from public.museums
      where museums.id = artifacts.museum_id
      and museums.user_id = auth.uid()
    )
  );

create policy "Пользователи могут удалять экспонаты только из своих музеев"
  on public.artifacts for delete
  using (
    exists (
      select 1 from public.museums
      where museums.id = artifacts.museum_id
      and museums.user_id = auth.uid()
    )
  );

-- Политики для likes
create policy "Лайки видны всем"
  on public.likes for select
  using (true);

create policy "Пользователи могут создавать только свои лайки"
  on public.likes for insert
  with check (auth.uid() = user_id);

create policy "Пользователи могут удалять только свои лайки"
  on public.likes for delete
  using (auth.uid() = user_id);

-- Функция для автоматического создания профиля при регистрации
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Триггер для автоматического создания профиля
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Функция для обновления updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Триггеры для автоматического обновления updated_at
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger update_museums_updated_at
  before update on public.museums
  for each row execute procedure public.handle_updated_at();

create trigger update_artifacts_updated_at
  before update on public.artifacts
  for each row execute procedure public.handle_updated_at();

-- Политики доступа для Storage (выполните после создания buckets)
-- ВАЖНО: Сначала создайте buckets в Storage, затем выполните эти политики
-- Используйте файл supabase/apply-storage-policies.sql для безопасного применения политик

