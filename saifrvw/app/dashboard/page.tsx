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
