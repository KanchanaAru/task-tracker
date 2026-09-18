-- Task Tracker schema
-- Run this in Supabase -> SQL Editor -> New query -> Run

-- ---------------------------------------------------------------
-- Table 1: profiles (one row per authenticated user)
-- ---------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Table 2: tasks (child of profiles via foreign key)
-- ---------------------------------------------------------------
do $$ begin
  create type task_priority as enum ('low', 'medium', 'high');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_status as enum ('todo', 'in_progress', 'done');
exception when duplicate_object then null; end $$;

create table if not exists public.tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  title        text not null check (char_length(title) between 1 and 160),
  description  text,
  priority     task_priority not null default 'medium',
  status       task_status   not null default 'todo',
  due_date     date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_status_idx  on public.tasks (user_id, status);

-- keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists tasks_touch_updated_at on public.tasks;
create trigger tasks_touch_updated_at
  before update on public.tasks
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------
-- Create a profile row automatically whenever a user signs up
-- ---------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------
-- Row Level Security: a user only ever sees their own rows
-- ---------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.tasks    enable row level security;

drop policy if exists "read own profile"   on public.profiles;
drop policy if exists "update own profile" on public.profiles;
create policy "read own profile"   on public.profiles for select using (auth.uid() = id);
create policy "update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "read own tasks"   on public.tasks;
drop policy if exists "insert own tasks" on public.tasks;
drop policy if exists "update own tasks" on public.tasks;
drop policy if exists "delete own tasks" on public.tasks;
create policy "read own tasks"   on public.tasks for select using (auth.uid() = user_id);
create policy "insert own tasks" on public.tasks for insert with check (auth.uid() = user_id);
create policy "update own tasks" on public.tasks for update using (auth.uid() = user_id);
create policy "delete own tasks" on public.tasks for delete using (auth.uid() = user_id);
