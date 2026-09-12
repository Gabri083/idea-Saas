-- Run this once in the Supabase SQL editor against the existing production
-- database — adds the column the Enterprise-only monthly AI report cron
-- uses to fire at most once per calendar month per business (mirrors
-- businesses.cap_alert_sent_month's "YYYY-MM" pattern).

alter table businesses
  add column if not exists monthly_report_sent_month text;
