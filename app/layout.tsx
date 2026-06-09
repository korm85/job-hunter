import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Job Hunter — Michael Korenevsky",
  description: "Job search automation — find, assess, tailor, apply",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh", display: "flex" }}>
        <Nav />
        <main style={{ flex: 1, marginLeft: 220, padding: "28px 32px", maxWidth: "calc(100vw - 220px)", overflowX: "hidden" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
