import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "SAIFRVW — AI Code Review",
  description: "Review code for bugs, security vulnerabilities, performance issues, and maintainability problems with SAIFRVW.",
  keywords: ["code review", "AI", "security", "bugs", "performance", "static analysis"],
  authors: [{ name: "SAIFRVW" }],
  openGraph: { title: "SAIFRVW — AI Code Review", description: "Ship cleaner code with intelligent AI-powered code review.", type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image", title: "SAIFRVW — AI Code Review", description: "Ship cleaner code with intelligent AI-powered code review." },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
        <Toaster position="bottom-right" toastOptions={{
          style: { background: "#0F1411", color: "#F2F5F2", border: "1px solid rgba(255,255,255,0.07)" },
        }} />
      </body>
    </html>
  );
}
