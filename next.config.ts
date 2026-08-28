import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// Lets next/image optimize (resize + serve WebP) business logos stored in
// Supabase Storage on /review and /resenas, instead of shipping the raw
// upload — the whole point of allowing logos there was not to slow the page
// down. Silently skipped when the env var isn't set (e.g. local/demo runs).
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHostname
      ? [{ protocol: "https", hostname: supabaseHostname, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // No-ops (and stays quiet) until SENTRY_AUTH_TOKEN is set — source map upload
  // isn't needed for Sentry to start reporting errors, only for readable stack traces.
  silent: !process.env.SENTRY_AUTH_TOKEN,
});
