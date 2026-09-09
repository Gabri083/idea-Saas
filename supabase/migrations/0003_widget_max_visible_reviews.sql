-- Run this once in the Supabase SQL editor against the existing production
-- database — adds the column that lets a merchant control how many cards a
-- "whole shelf at once" widget layout (carousel/wall/grid/mosaico) shows
-- (see widget_configs table in schema.sql for the full comment).

alter table widget_configs
  add column if not exists max_visible_reviews integer not null default 8
    check (max_visible_reviews between 2 and 12);
