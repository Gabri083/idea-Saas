import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getLocale } from "@/lib/i18n/get-locale";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://kelsira.app";
// Static metadata can't read the locale cookie (it isn't per-request), so it
// defaults to English to match DEFAULT_LOCALE — most crawlers and unfurlers
// don't send Accept-Language anyway. Page-level metadata can still override
// this per-locale where it matters (see app/opengraph-image.tsx).
const TITLE = "Kelsira — Fair Reputation, AI-Assisted Reviews";
const DESCRIPTION =
  "The first unbiased review platform powered by AI. Protect your brand from anger bias and turn unfair criticism into operational growth.";

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
      </body>
    </html>
  );
}
