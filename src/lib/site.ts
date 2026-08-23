/**
 * The one stable public URL for Kelsira. Anything a business copies into its
 * own storefront (the widget embed snippet, shared review links) must use
 * this instead of the current request's origin — otherwise generating it
 * from a Vercel preview deployment bakes a temporary *.vercel.app hostname
 * into a link/script tag meant to keep working forever.
 */
export const SITE_URL = "https://kelsira.app";
