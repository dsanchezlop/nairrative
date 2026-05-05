-- ============================================================
-- NAIrrative — Migración inicial
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Tabla principal de generaciones
create table if not exists public.generations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null default 'Sin título',
  prompt      text not null,
  content     text not null,
  category    text not null check (category in ('personaje','historia','mundo','encuentro','otro')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Índice para acelerar consultas por usuario
create index if not exists generations_user_id_idx on public.generations(user_id);

-- Función para actualizar updated_at automáticamente
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger que llama a la función anterior
create trigger on_generations_updated
  before update on public.generations
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

alter table public.generations enable row level security;

-- Solo el dueño puede ver sus generaciones
create policy "Users can view own generations"
  on public.generations for select
  using (auth.uid() = user_id);

-- Solo el dueño puede insertar sus generaciones
create policy "Users can insert own generations"
  on public.generations for insert
  with check (auth.uid() = user_id);

-- Solo el dueño puede actualizar sus generaciones
create policy "Users can update own generations"
  on public.generations for update
  using (auth.uid() = user_id);

-- Solo el dueño puede eliminar sus generaciones
create policy "Users can delete own generations"
  on public.generations for delete
  using (auth.uid() = user_id);
