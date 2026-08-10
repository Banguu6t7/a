import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SAIFRVW — Sentinel Security Analyzer",
  description:
    "SAIFRVW Sentinel is a static security analysis platform for finding vulnerabilities, understanding risk, and fixing insecure code faster.",
  keywords: [
    "SAIFRVW",
    "Sentinel",
    "security",
    "code analyzer",
    "static analysis",
    "SAST",
    "vulnerability scanner",
  ],
  authors: [{ name: "Saifan Tazeem" }],
  creator: "Saifan Tazeem",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "SAIFRVW — Sentinel Security Code Analyzer",
    description:
      "Detect vulnerabilities. Understand the risk. Fix them faster.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
