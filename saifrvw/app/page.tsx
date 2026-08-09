import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050706] text-[#F2F5F2]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7CFF9B]/10 text-[#7CFF9B]">
            <ShieldCheck size={18} />
          </div>
          <span className="font-bold tracking-wide">SAIFRVW</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/docs"
            className="hidden px-3 py-2 text-sm text-[#8B958D] hover:text-white sm:block"
          >
            Docs
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-white/[0.08] px-4 py-2 text-sm"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-5xl px-5 pb-24 pt-20 text-center sm:pt-32">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#7CFF9B]/15 bg-[#7CFF9B]/5 px-3 py-1.5 text-xs text-[#7CFF9B]">
          <Sparkles size={13} />
          AI CODE INTELLIGENCE
        </div>

        <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">
          Ship cleaner code.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#8B958D] sm:text-lg">
          SAIFRVW finds security vulnerabilities, bugs, performance problems,
          and maintainability issues before they reach production.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/review"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7CFF9B] px-6 py-3.5 text-sm font-semibold text-[#061008]"
          >
            Start a review
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl border border-white/[0.08] px-6 py-3.5 text-sm text-[#8B958D] hover:text-white"
          >
            Open dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
