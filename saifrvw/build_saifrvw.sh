#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║        SAIFRVW — ULTIMATE BUILD PASS        ║"
echo "║        AI CODE REVIEW PLATFORM              ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

write_file() {
  local file="$1"
  mkdir -p "$(dirname "$file")"
  cat > "$file"
  echo "  ✓ $file"
}

# ─────────────────────────────────────────────
# Dependencies
# ─────────────────────────────────────────────

echo "→ Installing runtime dependencies..."

npm install zod

echo "✓ Dependencies ready"
echo ""

# ─────────────────────────────────────────────
# Next.js config
# ─────────────────────────────────────────────

write_file next.config.ts <<'EOF'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
EOF

# ─────────────────────────────────────────────
# Shared UI
# ─────────────────────────────────────────────

write_file components/ui/panel.tsx <<'EOF'
import { cn } from "@/lib/utils";

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.07] bg-[#0A0D0B] shadow-[0_20px_80px_rgba(0,0,0,0.25)]",
        className
      )}
    >
      {children}
    </div>
  );
}
EOF

write_file components/ui/stat-card.tsx <<'EOF'
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  change,
  positive = true,
  icon,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0A0D0B] p-5">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm text-[#8B958D]">{label}</span>
        {icon && (
          <div className="rounded-lg border border-white/[0.07] bg-[#0F1411] p-2 text-[#7CFF9B]">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end justify-between gap-3">
        <span className="text-3xl font-semibold tracking-tight text-[#F2F5F2]">
          {value}
        </span>

        {change && (
          <span
            className={`flex items-center gap-1 text-xs ${
              positive ? "text-[#7CFF9B]" : "text-[#FF8C42]"
            }`}
          >
            {positive ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
EOF

write_file components/ui/app-shell.tsx <<'EOF'
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Code2,
  CreditCard,
  FileSearch,
  LayoutDashboard,
  Menu,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/review", label: "New review", icon: FileSearch },
  { href: "/docs", label: "Documentation", icon: BookOpen },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050706] text-[#F2F5F2]">
      <div className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/[0.07] bg-[#070A08] lg:block">
        <Sidebar pathname={pathname} />
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />
          <div className="relative h-full w-72 border-r border-white/[0.07] bg-[#070A08]">
            <div className="absolute right-4 top-4">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-[#8B958D] hover:bg-white/5"
              >
                <X size={20} />
              </button>
            </div>
            <Sidebar pathname={pathname} />
          </div>
        </div>
      )}

      <main className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.07] bg-[#050706]/85 px-4 backdrop-blur-xl sm:px-6">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-[#8B958D] hover:bg-white/5 lg:hidden"
          >
            <Menu size={21} />
          </button>

          <div className="hidden items-center gap-2 text-xs text-[#56615A] sm:flex">
            <ShieldCheck size={14} className="text-[#7CFF9B]" />
            Static analysis enabled
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-xs font-medium text-[#F2F5F2]">
                Developer
              </div>
              <div className="text-[11px] text-[#56615A]">
                Free workspace
              </div>
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#7CFF9B]/20 bg-[#7CFF9B]/10 text-xs font-semibold text-[#7CFF9B]">
              S
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <div className="flex h-full flex-col px-4 py-5">
      <Link href="/" className="mb-10 flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#7CFF9B]/20 bg-[#7CFF9B]/10">
          <Code2 size={18} className="text-[#7CFF9B]" />
        </div>
        <div>
          <div className="text-sm font-bold tracking-wide">SAIFRVW</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#56615A]">
            Code Intelligence
          </div>
        </div>
      </Link>

      <div className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#56615A]">
        Workspace
      </div>

      <nav className="space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                active
                  ? "bg-[#7CFF9B]/10 text-[#7CFF9B]"
                  : "text-[#8B958D] hover:bg-white/[0.04] hover:text-[#F2F5F2]"
              )}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-[#7CFF9B]/10 bg-[#7CFF9B]/[0.03] p-4">
        <div className="mb-2 flex items-center gap-2">
          <BarChart3 size={15} className="text-[#7CFF9B]" />
          <span className="text-xs font-semibold">Review capacity</span>
        </div>
        <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div className="h-full w-[34%] rounded-full bg-[#7CFF9B]" />
        </div>
        <div className="text-[11px] text-[#56615A]">17 / 50 reviews used</div>
      </div>
    </div>
  );
}
EOF

# ─────────────────────────────────────────────
# Dashboard
# ─────────────────────────────────────────────

write_file app/dashboard/page.tsx <<'EOF'
import Link from "next/link";
import {
  ArrowRight,
  Bug,
  Clock3,
  FileSearch,
  Shield,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/ui/app-shell";
import { Panel } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";

const reviews = [
  {
    name: "Authentication service",
    repo: "saifrvw/auth-service",
    score: 91,
    issues: 3,
    time: "12 min ago",
  },
  {
    name: "Payment webhook",
    repo: "saifrvw/payments",
    score: 76,
    issues: 8,
    time: "2 hours ago",
  },
  {
    name: "API middleware",
    repo: "saifrvw/backend",
    score: 88,
    issues: 4,
    time: "Yesterday",
  },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-[#7CFF9B]">
            Workspace
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Good to see you.
          </h1>
          <p className="mt-2 text-sm text-[#8B958D]">
            Here&apos;s what SAIFRVW found across your recent code reviews.
          </p>
        </div>

        <Link
          href="/review"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7CFF9B] px-5 py-3 text-sm font-semibold text-[#061008] transition hover:brightness-105"
        >
          <FileSearch size={16} />
          New review
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Code quality"
          value="87"
          change="6.4%"
          icon={<Shield size={16} />}
        />
        <StatCard
          label="Reviews"
          value="17"
          change="12.5%"
          icon={<FileSearch size={16} />}
        />
        <StatCard
          label="Issues found"
          value="42"
          change="18.2%"
          positive={false}
          icon={<Bug size={16} />}
        />
        <StatCard
          label="Avg. review"
          value="38s"
          change="21.1%"
          icon={<Clock3 size={16} />}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Panel className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
            <div>
              <h2 className="font-semibold">Recent reviews</h2>
              <p className="mt-1 text-xs text-[#56615A]">
                Your latest analysis runs
              </p>
            </div>
            <Link
              href="/review"
              className="text-xs text-[#7CFF9B] hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-white/[0.05]">
            {reviews.map((review) => (
              <div
                key={review.name}
                className="flex flex-col gap-4 px-5 py-5 transition hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-medium">{review.name}</div>
                  <div className="mt-1 font-mono text-xs text-[#56615A]">
                    {review.repo}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div
                      className={`text-lg font-semibold ${
                        review.score >= 85
                          ? "text-[#7CFF9B]"
                          : "text-[#FFD93D]"
                      }`}
                    >
                      {review.score}
                    </div>
                    <div className="text-[10px] uppercase text-[#56615A]">
                      score
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium">{review.issues}</div>
                    <div className="text-[10px] uppercase text-[#56615A]">
                      issues
                    </div>
                  </div>

                  <div className="hidden text-right text-xs text-[#56615A] md:block">
                    {review.time}
                  </div>

                  <ArrowRight size={16} className="text-[#56615A]" />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[#7CFF9B]/10 p-2.5">
              <Zap size={18} className="text-[#7CFF9B]" />
            </div>
            <div>
              <h2 className="font-semibold">Quality snapshot</h2>
              <p className="text-xs text-[#56615A]">Current workspace</p>
            </div>
          </div>

          <div className="space-y-5">
            {[
              ["Security", 94],
              ["Reliability", 89],
              ["Performance", 82],
              ["Maintainability", 86],
            ].map(([label, score]) => (
              <div key={label as string}>
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-[#8B958D]">{label as string}</span>
                  <span className="font-medium">{score as number}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-[#7CFF9B]"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/review"
            className="mt-8 flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] py-3 text-sm text-[#8B958D] transition hover:border-[#7CFF9B]/30 hover:text-[#7CFF9B]"
          >
            Analyze new code
            <ArrowRight size={15} />
          </Link>
        </Panel>
      </div>
    </AppShell>
  );
}
EOF

# ─────────────────────────────────────────────
# Review engine API
# ─────────────────────────────────────────────

write_file app/api/analyze/route.ts <<'EOF'
import { NextResponse } from "next/server";
import { runStaticAnalysis } from "@/lib/analysis/static";
import { calculateScores, generateSummary } from "@/lib/analysis/engine";
import { generateId } from "@/lib/utils";

function detectLanguage(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();

  const map: Record<string, string> = {
    js: "javascript",
    jsx: "jsx",
    ts: "typescript",
    tsx: "tsx",
    py: "python",
    go: "go",
    rs: "rust",
    java: "java",
    rb: "ruby",
    php: "php",
    c: "c",
    cpp: "cpp",
    cs: "csharp",
    sql: "sql",
  };

  return map[ext || ""] || "text";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body?.code || typeof body.code !== "string") {
      return NextResponse.json(
        { error: "Code is required." },
        { status: 400 }
      );
    }

    if (body.code.length > 1024 * 1024) {
      return NextResponse.json(
        { error: "Code exceeds the 1 MB limit." },
        { status: 413 }
      );
    }

    const filename =
      typeof body.filename === "string" ? body.filename : "snippet.ts";

    const file = {
      id: generateId(),
      path: filename,
      language: detectLanguage(filename),
      content: body.code,
      size: Buffer.byteLength(body.code, "utf8"),
      lines: body.code.split("\n").length,
    };

    const findings = runStaticAnalysis([file]);
    const scores = calculateScores(findings);
    const summary = generateSummary(findings);

    return NextResponse.json({
      id: generateId(),
      status: "complete",
      files: [file],
      findings,
      scores,
      summary,
      language: file.language,
      createdAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to analyze the submitted code." },
      { status: 500 }
    );
  }
}
EOF

# ─────────────────────────────────────────────
# Review page
# ─────────────────────────────────────────────

write_file app/review/page.tsx <<'EOF'
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  FileCode2,
  Loader2,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { AppShell } from "@/components/ui/app-shell";
import { Panel } from "@/components/ui/panel";

const starterCode = `import { db } from "./db";

export async function createUser(req: Request) {
  const { username, email } = await req.json();

  const query =
    "INSERT INTO users (username, email) VALUES ('" +
    username +
    "', '" +
    email +
    "')";

  const result = await db.query(query);

  console.log("User created:", result);

  return new Response(JSON.stringify({ success: true }));
}`;

export default function ReviewPage() {
  const [code, setCode] = useState(starterCode);
  const [filename, setFilename] = useState("create-user.ts");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function analyze() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, filename }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed.");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[#7CFF9B]">
          <Sparkles size={14} />
          Code intelligence
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Review your code
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8B958D]">
          Paste a file below and SAIFRVW will statically inspect it for
          security vulnerabilities, bugs, performance problems, and quality
          issues.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        <Panel className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-white/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <FileCode2 size={17} className="text-[#7CFF9B]" />
              <input
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="w-48 bg-transparent font-mono text-sm outline-none"
              />
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#56615A]">
              <ShieldCheck size={14} className="text-[#7CFF9B]" />
              Code is never executed
            </div>
          </div>

          <div className="relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="min-h-[540px] w-full resize-y bg-[#070A08] p-5 font-mono text-[13px] leading-6 text-[#D9E0DA] outline-none"
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-white/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-[#8B958D] hover:text-[#F2F5F2]">
              <Upload size={15} />
              Upload file
              <input type="file" className="hidden" />
            </label>

            <button
              onClick={analyze}
              disabled={loading || !code.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7CFF9B] px-5 py-3 text-sm font-semibold text-[#061008] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze code
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </Panel>

        <div className="space-y-6">
          {!result && !error && (
            <>
              <Panel className="p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl bg-[#7CFF9B]/10 p-2.5">
                    <Code2 size={18} className="text-[#7CFF9B]" />
                  </div>
                  <div>
                    <h2 className="font-semibold">What we inspect</h2>
                    <p className="text-xs text-[#56615A]">
                      Static analysis pipeline
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    "Security vulnerabilities",
                    "Bug-prone patterns",
                    "Performance issues",
                    "Maintainability",
                    "Code quality markers",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.015] p-3 text-sm text-[#8B958D]"
                    >
                      <CheckCircle2
                        size={15}
                        className="text-[#7CFF9B]"
                      />
                      {item}
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel className="p-6">
                <div className="flex gap-3">
                  <ShieldCheck
                    size={18}
                    className="mt-0.5 shrink-0 text-[#7CFF9B]"
                  />
                  <div>
                    <h3 className="text-sm font-semibold">
                      Security by default
                    </h3>
                    <p className="mt-2 text-xs leading-5 text-[#56615A]">
                      SAIFRVW analyzes source as data. It does not execute the
                      submitted program.
                    </p>
                  </div>
                </div>
              </Panel>
            </>
          )}

          {error && (
            <Panel className="border-[#FF4444]/20 p-6">
              <div className="text-sm font-semibold text-[#FF4444]">
                Analysis failed
              </div>
              <p className="mt-2 text-xs text-[#8B958D]">{error}</p>
            </Panel>
          )}

          {result && (
            <>
              <Panel className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-[#56615A]">
                      Overall score
                    </div>
                    <div className="mt-1 text-5xl font-semibold text-[#7CFF9B]">
                      {result.scores.overall}
                    </div>
                  </div>

                  <div className="rounded-full border border-[#7CFF9B]/20 bg-[#7CFF9B]/10 px-3 py-1 text-xs text-[#7CFF9B]">
                    Analysis complete
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(result.scores)
                    .filter(([key]) => key !== "overall")
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="rounded-xl border border-white/[0.06] p-3"
                      >
                        <div className="text-[10px] uppercase tracking-wider text-[#56615A]">
                          {key}
                        </div>
                        <div className="mt-1 text-lg font-semibold">
                          {String(value)}
                        </div>
                      </div>
                    ))}
                </div>
              </Panel>

              <Panel className="overflow-hidden">
                <div className="border-b border-white/[0.07] px-5 py-4">
                  <h2 className="font-semibold">Findings</h2>
                </div>

                {result.findings.length === 0 ? (
                  <div className="p-6 text-sm text-[#8B958D]">
                    No findings detected.
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.05]">
                    {result.findings.map((finding: any) => (
                      <div key={finding.id} className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-medium">
                              {finding.title}
                            </div>
                            <p className="mt-1 text-xs leading-5 text-[#8B958D]">
                              {finding.description}
                            </p>
                          </div>
                          <span className="rounded-full bg-[#FF4444]/10 px-2 py-1 text-[10px] uppercase text-[#FF6B6B]">
                            {finding.severity}
                          </span>
                        </div>

                        <div className="mt-4 rounded-lg bg-[#050706] p-3 font-mono text-[11px] text-[#7CFF9B]">
                          {finding.recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>

              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.07] py-3 text-sm text-[#8B958D] hover:text-[#F2F5F2]"
              >
                Back to dashboard
                <ArrowRight size={15} />
              </Link>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
EOF

# ─────────────────────────────────────────────
# Pricing
# ─────────────────────────────────────────────

write_file app/pricing/page.tsx <<'EOF'
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { AppShell } from "@/components/ui/app-shell";
import { Panel } from "@/components/ui/panel";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For experimenting with SAIFRVW.",
    features: ["50 reviews / month", "Static analysis", "Basic scoring", "Public docs"],
  },
  {
    name: "Pro",
    price: "$19",
    description: "For serious individual developers.",
    features: [
      "Unlimited local reviews",
      "AI-assisted analysis",
      "Repository reviews",
      "Advanced security rules",
      "Review history",
    ],
    featured: true,
  },
  {
    name: "Team",
    price: "$49",
    description: "For teams shipping production software.",
    features: [
      "Everything in Pro",
      "Team workspaces",
      "Shared review history",
      "Custom rules",
      "Priority processing",
    ],
  },
];

export default function PricingPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl py-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#7CFF9B]">
            <Sparkles size={14} />
            Simple pricing
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">
            Ship better code without the noise.
          </h1>
          <p className="mt-4 text-sm leading-6 text-[#8B958D]">
            Start free. Upgrade when your codebase needs deeper intelligence.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <Panel
              key={plan.name}
              className={`relative p-6 ${
                plan.featured
                  ? "border-[#7CFF9B]/30 shadow-[0_0_50px_rgba(124,255,155,0.05)]"
                  : ""
              }`}
            >
              {plan.featured && (
                <div className="absolute right-5 top-5 rounded-full bg-[#7CFF9B]/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#7CFF9B]">
                  Popular
                </div>
              )}

              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <p className="mt-2 text-xs leading-5 text-[#56615A]">
                {plan.description}
              </p>

              <div className="mt-6">
                <span className="text-4xl font-semibold">{plan.price}</span>
                {plan.price !== "$0" && (
                  <span className="text-xs text-[#56615A]"> / month</span>
                )}
              </div>

              <Link
                href="/review"
                className={`mt-6 flex items-center justify-center rounded-xl py-3 text-sm font-semibold ${
                  plan.featured
                    ? "bg-[#7CFF9B] text-[#061008]"
                    : "border border-white/[0.08] text-[#F2F5F2]"
                }`}
              >
                Start reviewing
              </Link>

              <div className="mt-7 space-y-3">
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-xs text-[#8B958D]"
                  >
                    <Check size={14} className="text-[#7CFF9B]" />
                    {feature}
                  </div>
                ))}
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
EOF

# ─────────────────────────────────────────────
# Docs
# ─────────────────────────────────────────────

write_file app/docs/page.tsx <<'EOF'
import { BookOpen, Code2, ShieldCheck, Terminal } from "lucide-react";
import { AppShell } from "@/components/ui/app-shell";
import { Panel } from "@/components/ui/panel";

export default function DocsPage() {
  return (
    <AppShell>
      <div className="max-w-4xl">
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#7CFF9B]">
            <BookOpen size={14} />
            Documentation
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">
            Build with SAIFRVW.
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#8B958D]">
            Everything you need to understand the review pipeline and integrate
            code analysis into your workflow.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            [Code2, "Code review", "Submit source and inspect findings."],
            [ShieldCheck, "Security", "Static security checks by default."],
            [Terminal, "API", "Automate analysis from your CI pipeline."],
          ].map(([Icon, title, description]) => (
            <Panel key={title as string} className="p-5">
              <Icon size={19} className="text-[#7CFF9B]" />
              <h2 className="mt-4 text-sm font-semibold">{title as string}</h2>
              <p className="mt-2 text-xs leading-5 text-[#56615A]">
                {description as string}
              </p>
            </Panel>
          ))}
        </div>

        <Panel className="mt-6 overflow-hidden">
          <div className="border-b border-white/[0.07] px-6 py-5">
            <h2 className="font-semibold">Analyze code with the API</h2>
            <p className="mt-1 text-xs text-[#56615A]">
              Send source code to the analysis endpoint.
            </p>
          </div>

          <pre className="overflow-x-auto bg-[#070A08] p-6 font-mono text-xs leading-6 text-[#8B958D]">
{`curl -X POST http://localhost:3000/api/analyze \\
  -H "Content-Type: application/json" \\
  -d '{
    "filename": "example.ts",
    "code": "const query = userInput;"
  }'`}
          </pre>
        </Panel>
      </div>
    </AppShell>
  );
}
EOF

# ─────────────────────────────────────────────
# Settings
# ─────────────────────────────────────────────

write_file app/settings/page.tsx <<'EOF'
"use client";

import { useState } from "react";
import { KeyRound, Save, ShieldCheck, UserRound } from "lucide-react";
import { AppShell } from "@/components/ui/app-shell";
import { Panel } from "@/components/ui/panel";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <AppShell>
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-2 text-sm text-[#8B958D]">
            Configure your SAIFRVW workspace.
          </p>
        </div>

        <Panel className="divide-y divide-white/[0.07]">
          <section className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <UserRound size={18} className="text-[#7CFF9B]" />
              <div>
                <h2 className="font-semibold">Profile</h2>
                <p className="text-xs text-[#56615A]">Workspace identity</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs text-[#8B958D]">
                Display name
                <input
                  defaultValue="Developer"
                  className="mt-2 w-full rounded-xl border border-white/[0.08] bg-[#070A08] px-3 py-3 text-sm text-[#F2F5F2] outline-none focus:border-[#7CFF9B]/30"
                />
              </label>

              <label className="text-xs text-[#8B958D]">
                Workspace
                <input
                  defaultValue="saifrvw"
                  className="mt-2 w-full rounded-xl border border-white/[0.08] bg-[#070A08] px-3 py-3 text-sm text-[#F2F5F2] outline-none focus:border-[#7CFF9B]/30"
                />
              </label>
            </div>
          </section>

          <section className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <KeyRound size={18} className="text-[#7CFF9B]" />
              <div>
                <h2 className="font-semibold">AI provider</h2>
                <p className="text-xs text-[#56615A]">
                  Configure an OpenAI-compatible provider later.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-[#070A08] p-4 text-xs leading-5 text-[#56615A]">
              API credentials should be configured as server-side environment
              variables. Never expose provider keys in client-side code.
            </div>
          </section>

          <section className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-[#56615A]">
              <ShieldCheck size={14} className="text-[#7CFF9B]" />
              Your settings stay server-side.
            </div>

            <button
              onClick={() => {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7CFF9B] px-5 py-3 text-sm font-semibold text-[#061008]"
            >
              <Save size={15} />
              {saved ? "Saved" : "Save settings"}
            </button>
          </section>
        </Panel>
      </div>
    </AppShell>
  );
}
EOF

# ─────────────────────────────────────────────
# Root page fallback
# ─────────────────────────────────────────────

write_file app/page.tsx <<'EOF'
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
EOF

# ─────────────────────────────────────────────
# Validation
# ─────────────────────────────────────────────

echo ""
echo "══════════════════════════════════════════════"
echo "→ Checking TypeScript..."
echo "══════════════════════════════════════════════"

npm run typecheck

echo ""
echo "══════════════════════════════════════════════"
echo "→ Creating production build..."
echo "══════════════════════════════════════════════"

rm -rf .next
npm run build

echo ""
echo "══════════════════════════════════════════════"
echo "✓ SAIFRVW BUILD COMPLETE"
echo "══════════════════════════════════════════════"
echo ""
echo "Available routes:"
echo "  /"
echo "  /dashboard"
echo "  /review"
echo "  /pricing"
echo "  /docs"
echo "  /settings"
echo "  POST /api/analyze"
echo ""
echo "Start development server:"
echo "  npm run dev"
echo ""
