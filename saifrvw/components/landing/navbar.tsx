"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "#product", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#security", label: "Security" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[rgba(255,255,255,0.07)] bg-[#050706]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-md bg-[#7CFF9B]/10 border border-[#7CFF9B]/20 flex items-center justify-center group-hover:bg-[#7CFF9B]/20 transition-colors">
              <Terminal className="w-4 h-4 text-[#7CFF9B]" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-[#F2F5F2]">SAIFRVW</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="px-3 py-1.5 text-sm text-[#8B958D] hover:text-[#F2F5F2] rounded-md hover:bg-[#0A0D0B] transition-colors">{link.label}</Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild><Link href="/dashboard">Sign in</Link></Button>
            <Button size="sm" asChild><Link href="/review/new">Start reviewing</Link></Button>
          </div>
          <button className="md:hidden p-2 text-[#8B958D] hover:text-[#F2F5F2]" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t border-[rgba(255,255,255,0.07)] bg-[#050706]">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="block px-3 py-2 text-sm text-[#8B958D] hover:text-[#F2F5F2] hover:bg-[#0A0D0B] rounded-md" onClick={() => setMobileOpen(false)}>{link.label}</Link>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                <Button variant="secondary" size="sm" className="w-full" asChild><Link href="/dashboard">Sign in</Link></Button>
                <Button size="sm" className="w-full" asChild><Link href="/review/new">Start reviewing</Link></Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
