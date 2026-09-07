-- Run this once in the Supabase SQL editor against the existing production
-- database — adds the column that stores an imported review's original
-- source-platform rating for reference/comparison only (see reviews table
-- in schema.sql for the full comment on why it's never used in scoring).

alter table reviews
  add column if not exists original_rating numeric(2, 1)
    check (original_rating between 1 and 5);
