-- ============================================================
-- NAIrrative — Migración: Campañas
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Tabla de campañas
create table if not exists public.campaigns (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  game_system text not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists campaigns_user_id_idx on public.campaigns(user_id);

-- RLS para campañas
alter table public.campaigns enable row level security;

create policy "Users can view own campaigns"
  on public.campaigns for select
  using (auth.uid() = user_id);

create policy "Users can insert own campaigns"
  on public.campaigns for insert
  with check (auth.uid() = user_id);

create policy "Users can update own campaigns"
  on public.campaigns for update
  using (auth.uid() = user_id);

create policy "Users can delete own campaigns"
  on public.campaigns for delete
  using (auth.uid() = user_id);

-- Añadir campaign_id a generations (nullable)
alter table public.generations
  add column if not exists campaign_id uuid references public.campaigns(id) on delete set null;

create index if not exists generations_campaign_id_idx on public.generations(campaign_id);
