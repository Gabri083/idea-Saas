import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Video Tracker — Reels y pagos a editores",
  description:
    "Panel interno para trackear reels en producción, qué editor hizo cada video y qué pagos están pendientes.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
