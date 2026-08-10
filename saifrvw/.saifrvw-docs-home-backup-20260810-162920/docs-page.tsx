import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ShieldCheck,
  Code2,
  Zap,
  Terminal,
} from "lucide-react";

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-[#1e1e2e] bg-[#13131f]/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to SAIFRVW
          </Link>

          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            <span className="font-semibold">SAIFRVW Docs</span>
          </div>

          <Link
            href="/review"
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold hover:bg-indigo-600"
          >
            Open Analyzer
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-4 py-14">
        <div className="mb-14">
          <div className="mb-4 flex items-center gap-2 text-sm text-indigo-400">
            <ShieldCheck className="h-4 w-4" />
            SENTINEL ENGINE v3.1
          </div>

          <h1 className="text-5xl font-bold tracking-tight">
            SAIFRVW Documentation
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-400">
            Learn how SAIFRVW analyzes source code and identifies security,
            reliability, and quality issues before they reach production.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <DocCard
            icon={<ShieldCheck />}
            title="Security Analysis"
            text="Detect dangerous patterns, injection risks, insecure operations, and other security weaknesses."
          />

          <DocCard
            icon={<Code2 />}
            title="Multi-language"
            text="Designed for modern development workflows across JavaScript, TypeScript, Python, Java, PHP, Go, and more."
          />

          <DocCard
            icon={<Zap />}
            title="Fast Scanning"
            text="Analyze source code quickly through the SENTINEL analysis engine and receive structured findings."
          />

          <DocCard
            icon={<Terminal />}
            title="API"
            text="SAIFRVW exposes an analysis endpoint that can be integrated into applications and developer workflows."
          />
        </div>

        <section className="mt-10 rounded-2xl border border-[#252538] bg-[#11111b] p-7">
          <h2 className="text-2xl font-bold">Quick Start</h2>

          <p className="mt-3 leading-7 text-gray-400">
            Open the Analyzer, select the source language, paste your code,
            and select Analyze Code. Results are displayed as structured
            findings with severity and line information.
          </p>

          <div className="mt-6 rounded-xl border border-[#252538] bg-[#09090f] p-5 font-mono text-sm text-gray-300">
            <div className="text-gray-500">
              # Example workflow
            </div>
            <div className="mt-2">
              Open SAIFRVW → Analyzer → Paste code → Analyze
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-7">
          <h2 className="text-xl font-bold">SENTINEL Engine</h2>
          <p className="mt-3 leading-7 text-gray-400">
            The engine is designed to provide actionable static-analysis
            feedback without requiring code execution. Always validate
            findings against the surrounding application context before
            making production changes.
          </p>
        </section>
      </div>
    
        <div className="mt-8 text-center text-xs text-slate-500">
          <a
            href="mailto:saifantazeem936@gmail.com"
            className="transition hover:text-indigo-300"
          >
            saifantazeem936@gmail.com
          </a>
        </div>
      </main>
  );
}

function DocCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-[#252538] bg-[#11111b] p-6 transition hover:border-indigo-500/30">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
        {icon}
      </div>

      <h2 className="text-lg font-semibold">{title}</h2>

      <p className="mt-2 leading-7 text-gray-400">{text}</p>
    </div>
  );
}
