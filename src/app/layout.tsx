import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { getLocale } from "@/lib/i18n/get-locale";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const GA_MEASUREMENT_ID = "G-BGKBW47HCV";

// Static metadata can't read the locale cookie (it isn't per-request), so it
// defaults to English to match DEFAULT_LOCALE — most crawlers and unfurlers
// don't send Accept-Language anyway. Page-level metadata can still override
// this per-locale where it matters (see app/opengraph-image.tsx).
const TITLE = "Kelsira — Real Reviews, Fairly Scored";
const DESCRIPTION =
  "Every review is published exactly as your customer wrote it — never hidden, edited, or filtered. Kelsira adds an impartial fairness check on the score, so one angry moment doesn't unfairly define your business.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s — Kelsira" },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Kelsira",
    locale: "en",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        {/* Lemon Squeezy affiliate attribution — must run on every page since a
         * referral link can point anywhere on the site, not just /afiliados. */}
        <Script id="ls-affiliate-config" strategy="afterInteractive">
          {`window.lemonSqueezyAffiliateConfig = { store: "kelsira" };`}
        </Script>
        <Script src="https://lmsqueezy.com/affiliate.js" strategy="afterInteractive" />

        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');`}
        </Script>
      </body>
    </html>
  );
}
