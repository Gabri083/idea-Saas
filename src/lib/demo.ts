/** Fixed id from supabase/seed.sql — lets /review/demo and the dashboard work out of the box. */
export const DEMO_BUSINESS_ID = "11111111-1111-1111-1111-111111111111";

export function resolveBusinessId(param: string): string {
  return param === "demo" ? DEMO_BUSINESS_ID : param;
}
