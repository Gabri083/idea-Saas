-- ============================================================================
-- Kelsira — Reputación Justa y Reseñas Asistidas por IA
-- Supabase / PostgreSQL schema
--
-- Run in the Supabase SQL editor (or `supabase db push`) on a fresh project.
-- Server-side writes (the /api/reviews engine) use the SUPABASE_SERVICE_ROLE_KEY,
-- which bypasses RLS by design — RLS below protects direct client/anon access
-- (the public review form, the embeddable widget, and the dashboard client).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- businesses: one row per e-commerce tenant (Shopify / WooCommerce / marca)
-- ----------------------------------------------------------------------------
create table if not exists businesses (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  slug               text not null unique,
  contact_email      text not null,
  plan               text not null default 'free'
                       check (plan in ('free', 'starter', 'growth', 'enterprise')),
  monthly_review_cap integer, -- null = unlimited (growth/enterprise)
  category           text check (category in
                       ('restaurante', 'moda_calzado', 'belleza', 'electronica', 'hogar', 'salud', 'otro')),
  business_description text, -- short free-text context the AI uses to calibrate scoring
  locale             text not null default 'en' check (locale in ('en', 'es')), -- language for transactional emails sent to this business
  lemonsqueezy_customer_id     text,
  lemonsqueezy_subscription_id text,
  subscription_status          text, -- e.g. active, on_trial, past_due, cancelled, expired, unpaid
  customer_portal_url          text, -- Lemon Squeezy hosted "manage billing" link
  cap_alert_sent_month text, -- "YYYY-MM" of the last review-cap-reached email sent, so it fires once/month
  created_at         timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- profiles: links an auth.users row to the business they administer
-- ----------------------------------------------------------------------------
create table if not exists profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  business_id uuid not null references businesses (id) on delete cascade,
  full_name   text,
  role        text not null default 'owner' check (role in ('owner', 'staff')),
  created_at  timestamptz not null default now()
);

create index if not exists profiles_business_id_idx on profiles (business_id);

-- ----------------------------------------------------------------------------
-- widget_configs: one-to-one visual configuration for the embeddable widget
-- ----------------------------------------------------------------------------
create table if not exists widget_configs (
  business_id    uuid primary key references businesses (id) on delete cascade,
  theme_mode     text not null default 'light' check (theme_mode in ('light', 'dark')),
  accent_color   text not null default '#4f7cff',
  border_radius  text not null default 'lg' check (border_radius in ('none', 'sm', 'md', 'lg', 'full')),
  font_family    text not null default 'inter',
  layout         text not null default 'carousel'
                   check (layout in ('carousel', 'badge', 'grid', 'wall', 'spotlight', 'sello', 'mosaico', 'cinta', 'lanzador', 'barra', 'fila')),
  card_style     text not null default 'recibo' check (card_style in ('recibo', 'medidor')),
  show_breakdown boolean not null default true,
  show_branding  boolean not null default true, -- "Verificado por Kelsira" footer; forced true on free/starter regardless of this value
  updated_at     timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- reviews: the immutable customer text + the AI-computed objective score
-- ----------------------------------------------------------------------------
create table if not exists reviews (
  id                    uuid primary key default gen_random_uuid(),
  business_id           uuid not null references businesses (id) on delete cascade,
  customer_name         text not null,
  customer_email        text not null,
  review_text           text not null, -- verbatim, never edited or censored

  -- customer's own emotional/gut star pick, captured optionally at submit time.
  -- this is what powers the "IA vs Cliente" contrast on the dashboard header.
  customer_star_rating  smallint check (customer_star_rating between 1 and 5),

  -- AI-computed structured analysis (OpenAI JSON mode output). One decimal
  -- of precision (e.g. 4.7) reads as far less "blocky" than whole stars.
  product_score         numeric(2,1) not null check (product_score between 1 and 5),
  service_score         numeric(2,1) not null check (service_score between 1 and 5),
  delivery_score        numeric(2,1) not null check (delivery_score between 1 and 5),
  detected_issues        text[] not null default '{}',
  ai_summary             text,
  ai_raw_response        jsonb, -- full model payload, kept for transparency/audits

  -- final published rating: weighted (40/30/30) minus any inaction penalty
  overall_ai_rating      numeric(2,1) not null check (overall_ai_rating between 1.0 and 5.0),
  penalty_applied        numeric(2,1) not null default 0,

  status                 text not null default 'published'
                            check (status in ('published', 'in_appeal', 'resolved', 'archived')),

  -- optional public reply from the business owner, shown under the review
  -- itself (result page + widget) — not part of the AI scoring, just a
  -- public conversation layer on top of it.
  business_reply         text check (char_length(business_reply) <= 1000),
  business_reply_at      timestamptz,

  created_at             timestamptz not null default now()
);

create index if not exists reviews_business_id_created_idx on reviews (business_id, created_at desc);
create index if not exists reviews_status_idx on reviews (business_id, status);
create index if not exists reviews_detected_issues_gin on reviews using gin (detected_issues);

-- ----------------------------------------------------------------------------
-- recurring_issues: operational bottlenecks tracked across reviews, with a
-- 30-day resolution clock. Unresolved issues trigger the inaction penalty.
-- ----------------------------------------------------------------------------
create table if not exists recurring_issues (
  id                  uuid primary key default gen_random_uuid(),
  business_id         uuid not null references businesses (id) on delete cascade,
  issue_key           text not null, -- normalized tag, e.g. "envio_agencia_x"
  issue_label         text not null, -- human readable, e.g. "Retrasos con la agencia X"
  occurrences         integer not null default 1,
  status              text not null default 'open'
                        check (status in ('open', 'acknowledged', 'resolved')),
  penalty_factor      numeric(2,1) not null default 0.3,
  first_detected_at   timestamptz not null default now(),
  resolution_deadline timestamptz not null default (now() + interval '30 days'),
  resolved_at         timestamptz,
  resolution_evidence text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  unique (business_id, issue_key)
);

create index if not exists recurring_issues_business_status_idx on recurring_issues (business_id, status);

-- ----------------------------------------------------------------------------
-- appeals: business disputes a review as false/defamatory, with evidence
-- ----------------------------------------------------------------------------
create table if not exists appeals (
  id               uuid primary key default gen_random_uuid(),
  review_id        uuid not null references reviews (id) on delete cascade,
  business_id      uuid not null references businesses (id) on delete cascade,
  reason           text not null,
  evidence_urls    text[] not null default '{}', -- Supabase Storage object paths
  status           text not null default 'pending'
                     check (status in ('pending', 'approved', 'rejected')),
  resolution_notes text,
  created_at       timestamptz not null default now(),
  resolved_at      timestamptz
);

create index if not exists appeals_business_status_idx on appeals (business_id, status);

-- ----------------------------------------------------------------------------
-- calibration_requests: business proves a historical issue is fixed and asks
-- for past reviews tied to it to be re-weighted/archived (Centro de Calibración)
-- ----------------------------------------------------------------------------
create table if not exists calibration_requests (
  id                  uuid primary key default gen_random_uuid(),
  business_id         uuid not null references businesses (id) on delete cascade,
  recurring_issue_id  uuid not null references recurring_issues (id) on delete cascade,
  affected_review_ids uuid[] not null default '{}',
  evidence            text not null,
  status              text not null default 'pending'
                        check (status in ('pending', 'approved', 'rejected')),
  requested_at        timestamptz not null default now(),
  resolved_at         timestamptz
);

create index if not exists calibration_business_idx on calibration_requests (business_id);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table businesses          enable row level security;
alter table profiles            enable row level security;
alter table widget_configs      enable row level security;
alter table reviews             enable row level security;
alter table recurring_issues    enable row level security;
alter table appeals             enable row level security;
alter table calibration_requests enable row level security;

-- helper predicate used repeatedly below: "does auth.uid() belong to this business?"
create or replace function is_business_member(target_business_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and profiles.business_id = target_business_id
  );
$$;

-- businesses -----------------------------------------------------------------
create policy "members can read their business"
  on businesses for select
  using (is_business_member(id));

create policy "owners can update their business"
  on businesses for update
  using (is_business_member(id));

-- profiles ---------------------------------------------------------------
create policy "users can read own profile"
  on profiles for select
  using (id = auth.uid());

create policy "users can update own profile"
  on profiles for update
  using (id = auth.uid());

-- widget_configs -----------------------------------------------------------
-- public select: the embeddable <script> fetches styling anonymously
create policy "anyone can read widget config"
  on widget_configs for select
  using (true);

create policy "members manage their widget config"
  on widget_configs for all
  using (is_business_member(business_id))
  with check (is_business_member(business_id));

-- reviews --------------------------------------------------------------------
-- anyone (anon) can submit a review through the public form
create policy "anyone can submit a review"
  on reviews for insert
  to anon, authenticated
  with check (true);

-- published reviews are publicly readable (result page + widget)
create policy "published reviews are public"
  on reviews for select
  using (status in ('published', 'resolved'));

-- business members can read/manage all of their own reviews regardless of status
create policy "members can read all their reviews"
  on reviews for select
  using (is_business_member(business_id));

create policy "members can update their reviews status"
  on reviews for update
  using (is_business_member(business_id));

-- recurring_issues -----------------------------------------------------------
create policy "members manage their recurring issues"
  on recurring_issues for all
  using (is_business_member(business_id))
  with check (is_business_member(business_id));

-- appeals ----------------------------------------------------------------
create policy "members manage their appeals"
  on appeals for all
  using (is_business_member(business_id))
  with check (is_business_member(business_id));

-- calibration_requests -----------------------------------------------------
create policy "members manage their calibration requests"
  on calibration_requests for all
  using (is_business_member(business_id))
  with check (is_business_member(business_id));

-- ============================================================================
-- Storage bucket for appeal evidence (comprobantes, capturas de chat, etc.)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('appeal-evidence', 'appeal-evidence', false)
on conflict (id) do nothing;

create policy "members upload their own appeal evidence"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'appeal-evidence'
    and is_business_member((storage.foldername(name))[1]::uuid)
  );

create policy "members read their own appeal evidence"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'appeal-evidence'
    and is_business_member((storage.foldername(name))[1]::uuid)
  );
