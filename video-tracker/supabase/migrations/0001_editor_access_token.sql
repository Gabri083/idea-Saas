-- If you already ran schema.sql before this change, run this migration too.
-- (Already included in schema.sql for fresh projects.)

alter table editors
  add column if not exists access_token uuid not null unique default gen_random_uuid();
