import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Absolute base for Open Graph URLs (/m/…, /watch/…). Read directly rather than via env(), which
// requires every server secret and so can't run at build time.
const appUrl = process.env.APP_URL && URL.canParse(process.env.APP_URL) ? process.env.APP_URL : "http://localhost:3000";

const description =
  "Turn recorded lectures and talks into knowledge you can search, ask and share — every answer is a clip of the moment it was said.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "Pravaha — ask your recordings, watch the answer",
  description,
  openGraph: { siteName: "Pravaha", type: "website", title: "Pravaha — ask your recordings, watch the answer", description },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1112" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-dvh">
        <header className="mx-auto flex max-w-[1120px] items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Pravaha<span className="text-accent">.</span>
          </Link>
          <Link href="/studio" className="text-sm text-muted hover:text-fg">
            Studio
          </Link>
        </header>
        <main className="mx-auto max-w-[1120px] px-4 pb-16">{children}</main>
      </body>
    </html>
  );
}
