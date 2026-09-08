-- Run this once in the Supabase SQL editor against the existing production
-- database — schema.sql only applies to a fresh project, this brings an
-- already-running one up to date with the same two columns (see reviews
-- table in schema.sql for the full comments on what these are for).

alter table reviews
  add column if not exists source text not null default 'kelsira'
    check (source in ('kelsira', 'imported')),
  add column if not exists source_platform text;
