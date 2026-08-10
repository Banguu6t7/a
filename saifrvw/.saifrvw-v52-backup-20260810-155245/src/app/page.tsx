"use client";

import Link from "next/link";
import { ArrowRight, Shield, Zap, Brain, FileCode, CheckCircle2, BarChart3, Lock, Globe } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="sticky top-0 z-50 border-b border-[#1e1e2e] bg-[#13131f]/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6366f1]/10">
                <Shield className="h-5 w-5 text-[#6366f1]" />
              </div>
              <Link href="/" className="text-xl font-bold tracking-tight hover:text-[#6366f1] transition-colors">SAIFRVW</Link>
              <span className="hidden sm:inline-flex rounded-full bg-[#6366f1]/10 px-2.5 py-0.5 text-xs font-medium text-[#6366f1] border border-[#6366f1]/20">SENTINEL v3.1</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <Link href="/" className="rounded-lg px-3 py-2 text-sm font-medium text-[#6366f1] bg-[#6366f1]/10 border border-[#6366f1]/20">Home</Link>
              <Link href="/review" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">Review</Link>
              <Link href="/docs" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">Docs</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative py-20 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#6366f1]/5 to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#6366f1]/10 px-4 py-1.5 text-sm text-[#6366f1] mb-8 border border-[#6366f1]/20">
            <Zap className="h-4 w-4" /> SENTINEL ENGINE v3.1
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">Static Analysis for the <span className="text-[#6366f1]">Modern Era</span></h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">SAIFRVW analyzes your code across 20+ languages. Find vulnerabilities before they ship.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/review" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6366f1] px-6 py-3 font-semibold text-white hover:bg-[#4f46e5] active:scale-95 transition-all">Start Analysis <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/docs" className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#1e1e2e] bg-transparent px-6 py-3 font-semibold text-gray-300 hover:bg-white/5 hover:text-white active:scale-95 transition-all">Documentation</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="rounded-xl border border-[#1e1e2e] bg-[#13131f] p-6 flex items-center gap-4"><div className="rounded-lg bg-[#6366f1]/10 p-3 text-[#6366f1]"><Lock className="h-5 w-5" /></div><div><div className="text-2xl font-bold">24</div><div className="text-sm text-gray-500">Security Rules</div></div></div>
          <div className="rounded-xl border border-[#1e1e2e] bg-[#13131f] p-6 flex items-center gap-4"><div className="rounded-lg bg-[#6366f1]/10 p-3 text-[#6366f1]"><CheckCircle2 className="h-5 w-5" /></div><div><div className="text-2xl font-bold">7</div><div className="text-sm text-gray-500">Bug Detectors</div></div></div>
          <div className="rounded-xl border border-[#1e1e2e] bg-[#13131f] p-6 flex items-center gap-4"><div className="rounded-lg bg-[#6366f1]/10 p-3 text-[#6366f1]"><BarChart3 className="h-5 w-5" /></div><div><div className="text-2xl font-bold">4</div><div className="text-sm text-gray-500">Perf Checks</div></div></div>
          <div className="rounded-xl border border-[#1e1e2e] bg-[#13131f] p-6 flex items-center gap-4"><div className="rounded-lg bg-[#6366f1]/10 p-3 text-[#6366f1]"><Globe className="h-5 w-5" /></div><div><div className="text-2xl font-bold">20+</div><div className="text-sm text-gray-500">Languages</div></div></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-[#1e1e2e] bg-[#13131f] p-6 hover:border-[#6366f1]/30 transition-all"><div className="mb-4"><Shield className="h-8 w-8 text-[#FF4444]" /></div><div className="flex items-center gap-2 mb-2"><h3 className="text-lg font-semibold">Security First</h3><span className="inline-flex rounded-full border border-[#6366f1]/20 bg-[#6366f1]/10 px-2.5 py-0.5 text-xs font-medium text-[#6366f1]">24 Rules</span></div><p className="text-gray-400 text-sm leading-relaxed">Detect SQL injection, XSS, command injection, hardcoded secrets, and more.</p></div>
          <div className="rounded-xl border border-[#1e1e2e] bg-[#13131f] p-6 hover:border-[#6366f1]/30 transition-all"><div className="mb-4"><Brain className="h-8 w-8 text-[#FFD166]" /></div><div className="flex items-center gap-2 mb-2"><h3 className="text-lg font-semibold">Data-Flow Aware</h3><span className="inline-flex rounded-full border border-[#6366f1]/20 bg-[#6366f1]/10 px-2.5 py-0.5 text-xs font-medium text-[#6366f1]">Smart</span></div><p className="text-gray-400 text-sm leading-relaxed">Track taint from sources to sinks with sanitizer detection.</p></div>
          <div className="rounded-xl border border-[#1e1e2e] bg-[#13131f] p-6 hover:border-[#6366f1]/30 transition-all"><div className="mb-4"><FileCode className="h-8 w-8 text-[#7CFF9B]" /></div><div className="flex items-center gap-2 mb-2"><h3 className="text-lg font-semibold">20+ Languages</h3><span className="inline-flex rounded-full border border-[#6366f1]/20 bg-[#6366f1]/10 px-2.5 py-0.5 text-xs font-medium text-[#6366f1]">Universal</span></div><p className="text-gray-400 text-sm leading-relaxed">JavaScript, TypeScript, Python, Java, Go, Rust, C/C++, C#, PHP, Ruby, and more.</p></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="rounded-xl border border-[#1e1e2e] bg-[#13131f] p-6">
          <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div><div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#6366f1]/10 text-[#6366f1] text-lg font-bold mb-4 border border-[#6366f1]/20">1</div><h3 className="text-lg font-semibold mb-2">Paste Your Code</h3><p className="text-gray-400 text-sm">Drop in a snippet or upload multiple files. We auto-detect the language.</p></div>
            <div><div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#6366f1]/10 text-[#6366f1] text-lg font-bold mb-4 border border-[#6366f1]/20">2</div><h3 className="text-lg font-semibold mb-2">AI-Powered Analysis</h3><p className="text-gray-400 text-sm">Our engine runs 35+ rules across security, bugs, performance, and maintainability.</p></div>
            <div><div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#6366f1]/10 text-[#6366f1] text-lg font-bold mb-4 border border-[#6366f1]/20">3</div><h3 className="text-lg font-semibold mb-2">Actionable Results</h3><p className="text-gray-400 text-sm">Get severity-ranked findings with explanations, impact analysis, and suggested fixes.</p></div>
          </div>
        </div>
      </div>

      <div className="text-center py-12">
        <h2 className="text-3xl font-bold mb-4">Ready to secure your codebase?</h2>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto">Start analyzing in seconds. No signup required.</p>
        <Link href="/review" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6366f1] px-8 py-4 font-semibold text-white hover:bg-[#4f46e5] active:scale-95 transition-all text-lg">Launch Analyzer <ArrowRight className="h-5 w-5" /></Link>
      </div>

      <footer className="border-t border-[#1e1e2e] bg-[#13131f] mt-16"><div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-between"><div className="flex items-center gap-2"><Shield className="h-4 w-4 text-[#6366f1]" /><span className="text-sm font-medium">SAIFRVW SENTINEL ENGINE v3.1</span></div><span className="text-xs text-gray-500">Production-grade static analysis</span></div></footer>
    </main>
  );
}
