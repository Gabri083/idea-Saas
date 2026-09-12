-- Video Tracker schema
-- Run this in the Supabase SQL editor of a fresh project.

create extension if not exists "pgcrypto";

do $$ begin
  create type video_status as enum (
    'pendiente',
    'en_edicion',
    'en_revision',
    'aprobado',
    'publicado'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type video_payment_status as enum (
    'no_pagado',
    'pendiente',
    'pagado'
  );
exception
  when duplicate_object then null;
end $$;

-- Editors / freelance video editors you work with
create table if not exists editors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  rate_per_video numeric(10, 2) not null default 0,
  payment_method text,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

-- A payout made to an editor, covering one or more videos
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  editor_id uuid not null references editors(id) on delete restrict,
  amount numeric(10, 2) not null,
  paid_at date not null default current_date,
  method text,
  notes text,
  created_at timestamptz not null default now()
);

-- Each reel/video that needs to be produced
create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  reference text not null,
  client_name text,
  platform text,
  status video_status not null default 'pendiente',
  editor_id uuid references editors(id) on delete set null,
  price numeric(10, 2),
  video_url text,
  due_date date,
  delivered_at timestamptz,
  approved_at timestamptz,
  payment_status video_payment_status not null default 'no_pagado',
  payment_id uuid references payments(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists videos_editor_id_idx on videos(editor_id);
create index if not exists videos_status_idx on videos(status);
create index if not exists videos_payment_status_idx on videos(payment_status);
create index if not exists videos_created_at_idx on videos(created_at desc);
create index if not exists payments_editor_id_idx on payments(editor_id);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists videos_set_updated_at on videos;
create trigger videos_set_updated_at
  before update on videos
  for each row
  execute function set_updated_at();

-- Row Level Security: this is a single-tenant internal tool, so any
-- authenticated (logged-in) user has full access to every row.
alter table editors enable row level security;
alter table payments enable row level security;
alter table videos enable row level security;

drop policy if exists "authenticated full access" on editors;
create policy "authenticated full access" on editors
  for all to authenticated using (true) with check (true);

drop policy if exists "authenticated full access" on payments;
create policy "authenticated full access" on payments
  for all to authenticated using (true) with check (true);

drop policy if exists "authenticated full access" on videos;
create policy "authenticated full access" on videos
  for all to authenticated using (true) with check (true);
