"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,255,155,0.03),transparent_50%)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="green" className="mb-6"><Sparkles className="w-3 h-3" /> AI CODE INTELLIGENCE</Badge>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F2F5F2] mb-6">
            Ship cleaner <span className="text-[#7CFF9B]">code.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-lg sm:text-xl text-[#8B958D] mb-8 max-w-2xl mx-auto leading-relaxed">
            SAIFRVW reviews your code for bugs, security risks, performance issues, and maintainability problems before they reach production.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" asChild><Link href="/review/new">Review your code <ArrowRight className="w-4 h-4" /></Link></Button>
            <Button variant="secondary" size="lg" asChild><Link href="#how-it-works"><Play className="w-4 h-4" /> See how it works</Link></Button>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }} className="mt-6 text-xs text-[#56615A]">No account required for demo. Start reviewing in seconds.</motion.p>
        </div>
      </div>
    </section>
  );
}
