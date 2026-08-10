"use client";

import type { Finding } from "@/lib/security-engine";

export default function SecurityReport({
  findings,
}: {
  findings: Finding[];
}) {
  const critical = findings.filter(
    (f) => f.severity === "critical"
  ).length;

  const high = findings.filter(
    (f) => f.severity === "high"
  ).length;

  return (
    <section className="mt-8 space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="text-xs uppercase text-red-300">
            Critical
          </div>
          <div className="mt-1 text-2xl font-bold">
            {critical}
          </div>
        </div>

        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
          <div className="text-xs uppercase text-orange-300">
            High
          </div>
          <div className="mt-1 text-2xl font-bold">
            {high}
          </div>
        </div>

        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
          <div className="text-xs uppercase text-indigo-300">
            Total
          </div>
          <div className="mt-1 text-2xl font-bold">
            {findings.length}
          </div>
        </div>
      </div>

      {findings.map((finding) => (
        <article
          key={`${finding.id}-${finding.line}`}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs text-slate-500">
                {finding.id} · {finding.cwe} · {finding.owasp}
              </div>

              <h3 className="mt-1 text-lg font-semibold">
                {finding.title}
              </h3>
            </div>

            <div className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase">
              {finding.severity}
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <div className="text-xs uppercase text-slate-500">
                Evidence
              </div>

              <pre className="mt-2 overflow-x-auto rounded-lg bg-black/40 p-3 text-xs text-slate-300">
                {finding.evidence}
              </pre>
            </div>

            <div>
              <div className="text-xs uppercase text-slate-500">
                Location
              </div>

              <p className="mt-2 text-sm text-slate-300">
                Line {finding.line}, column {(finding.column ?? 1) ?? 1}
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {finding.description}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4">
            <div className="text-xs uppercase text-emerald-300">
              Remediation
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              {finding.remediation}
            </p>

            <pre className="mt-3 overflow-x-auto rounded-lg bg-black/40 p-3 text-xs text-emerald-200">
              {finding.secureExample}
            </pre>
          </div>
        </article>
      ))}
    </section>
  );
}
