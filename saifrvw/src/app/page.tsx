import Link from "next/link";

const cards = [
  {
    title: "Code Review",
    description: "Find bugs, security issues and risky patterns.",
    href: "/review",
    icon: "⚡",
  },
  {
    title: "Dependency Radar",
    description: "Inspect the project's dependency tree.",
    href: "/dependencies",
    icon: "📦",
  },
  {
    title: "Secret Scanner",
    description: "Hunt down credentials before they escape.",
    href: "/secrets",
    icon: "🔐",
  },
  {
    title: "Security Docs",
    description: "Understand findings and remediation.",
    href: "/docs",
    icon: "📚",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-8 shadow-2xl sm:p-12">
          <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/60">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              SENTINEL ONLINE
            </div>

            <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-cyan-300/70">
              SAIFRVW SENTINEL
            </p>

            <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">
              Your code called.
              <br />
              <span className="text-white/40">It has problems.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/55 sm:text-lg">
              A fast security workspace for reviewing code, hunting secrets,
              inspecting dependencies and turning scary findings into fixes.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/review"
                className="rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:scale-[1.02] hover:bg-white/90"
              >
                Start Review →
              </Link>

              <Link
                href="/secrets"
                className="rounded-xl border border-white/10 bg-white/[0.05] px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Hunt Secrets 🔐
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-2xl font-bold">24/7</p>
                <p className="mt-1 text-xs text-white/40">Security mindset</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-2xl font-bold">5.1</p>
                <p className="mt-1 text-xs text-white/40">Sentinel engine</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-2xl font-bold">0 drama</p>
                <p className="mt-1 text-xs text-white/40">Just findings & fixes</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition duration-200 hover:-translate-y-1 hover:bg-white/[0.06]"
            >
              <div className="text-3xl">{card.icon}</div>
              <h2 className="mt-5 font-semibold">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/45">
                {card.description}
              </p>
              <p className="mt-5 text-sm text-white/50 transition group-hover:text-white">
                Open workspace →
              </p>
            </Link>
          ))}
        </section>

        <p className="mt-8 text-center text-xs text-white/25">
          Built for developers who would rather find the bug before production does.
        </p>
      </div>
    </main>
  );
}
