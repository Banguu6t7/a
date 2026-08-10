"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileCode2,
  GitBranch,
  Loader2,
  Package,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Search,
} from "lucide-react";

type DependencyFinding = {
  name?: string;
  package?: string;
  severity?: string;
  title?: string;
  message?: string;
  description?: string;
  evidence?: string;
  recommendation?: string;
  remediation?: string;
  file?: string;
  line?: number;
};

type DependencyResponse = {
  ok?: boolean;
  error?: string;
  findings?: DependencyFinding[];
  dependencies?: DependencyFinding[];
  results?: DependencyFinding[];
  summary?: {
    total?: number;
    critical?: number;
    high?: number;
    medium?: number;
    low?: number;
  };
};

function severityRank(value: string | undefined) {
  switch ((value || "").toLowerCase()) {
    case "critical":
      return 4;
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
      return 1;
    default:
      return 0;
  }
}

function severityClass(value: string | undefined) {
  switch ((value || "").toLowerCase()) {
    case "critical":
      return "border-red-400/30 bg-red-400/10 text-red-200";
    case "high":
      return "border-orange-400/30 bg-orange-400/10 text-orange-200";
    case "medium":
      return "border-yellow-400/30 bg-yellow-400/10 text-yellow-200";
    case "low":
      return "border-blue-400/30 bg-blue-400/10 text-blue-200";
    default:
      return "border-white/10 bg-white/5 text-white/70";
  }
}

export default function DependenciesPage() {
  const [source, setSource] = useState("");
  const [result, setResult] = useState<DependencyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("all");

  const findings = useMemo(() => {
    if (!result) return [];

    const raw =
      result.findings ??
      result.dependencies ??
      result.results ??
      [];

    return Array.isArray(raw) ? raw : [];
  }, [result]);

  const filteredFindings = useMemo(() => {
    const q = query.trim().toLowerCase();

    return findings
      .filter((finding) => {
        if (
          severity !== "all" &&
          (finding.severity || "").toLowerCase() !== severity
        ) {
          return false;
        }

        if (!q) return true;

        return [
          finding.name,
          finding.package,
          finding.title,
          finding.message,
          finding.description,
          finding.file,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(q)
          );
      })
      .sort(
        (a, b) =>
          severityRank(b.severity) -
          severityRank(a.severity)
      );
  }, [findings, query, severity]);

  async function scanDependencies() {
    setLoading(true);
    setError("");
    setResult(null);
    setExpanded(null);

    try {
      const response = await fetch("/api/scan/dependencies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source,
        }),
      });

      const data = (await response.json()) as DependencyResponse;

      if (!response.ok || data.ok === false) {
        throw new Error(
          data.error || "Dependency scan failed."
        );
      }

      setResult(data);
    } catch (scanError) {
      setError(
        scanError instanceof Error
          ? scanError.message
          : "Dependency scan failed."
      );
    } finally {
      setLoading(false);
    }
  }

  const criticalCount =
    result?.summary?.critical ??
    findings.filter(
      (item) => item.severity?.toLowerCase() === "critical"
    ).length;

  const highCount =
    result?.summary?.high ??
    findings.filter(
      (item) => item.severity?.toLowerCase() === "high"
    ).length;

  const mediumCount =
    result?.summary?.medium ??
    findings.filter(
      (item) => item.severity?.toLowerCase() === "medium"
    ).length;

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60">
            <GitBranch className="h-3.5 w-3.5" />
            SENTINEL DEPENDENCY INTELLIGENCE
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Dependency Scanner
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
            Inspect package manifests and dependency data for
            security-relevant findings without modifying your
            existing analysis engine.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                <Package className="h-5 w-5 text-white/70" />
              </div>

              <div>
                <h2 className="font-medium">
                  Dependency Input
                </h2>
                <p className="text-xs text-white/40">
                  Paste package.json or dependency information.
                </p>
              </div>
            </div>

            <textarea
              value={source}
              onChange={(event) =>
                setSource(event.target.value)
              }
              placeholder={`{
  "dependencies": {
    "next": "14.2.35",
    "react": "^18.3.1"
  }
}`}
              className="min-h-[330px] w-full resize-y rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-sm leading-6 text-white outline-none transition placeholder:text-white/20 focus:border-white/25"
              spellCheck={false}
            />

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={scanDependencies}
                disabled={loading || !source.trim()}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {loading ? "Scanning..." : "Scan Dependencies"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSource("");
                  setResult(null);
                  setError("");
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-red-400/15 bg-red-400/5 p-4">
                <p className="text-xs text-white/40">
                  Critical
                </p>
                <p className="mt-2 text-2xl font-semibold text-red-200">
                  {criticalCount}
                </p>
              </div>

              <div className="rounded-2xl border border-orange-400/15 bg-orange-400/5 p-4">
                <p className="text-xs text-white/40">
                  High
                </p>
                <p className="mt-2 text-2xl font-semibold text-orange-200">
                  {highCount}
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-400/15 bg-yellow-400/5 p-4">
                <p className="text-xs text-white/40">
                  Medium
                </p>
                <p className="mt-2 text-2xl font-semibold text-yellow-200">
                  {mediumCount}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />

                <div>
                  <h2 className="font-medium">
                    Scanner Status
                  </h2>
                  <p className="text-xs text-white/40">
                    {result
                      ? "Analysis completed"
                      : "Waiting for dependency input"}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-white/40">
                    Findings
                  </span>
                  <span className="font-medium">
                    {findings.length}
                  </span>
                </div>

                <div className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-white/40">
                    Scanner
                  </span>
                  <span className="text-emerald-300">
                    Ready
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-white/40">
                    API
                  </span>
                  <span className="font-mono text-xs text-white/60">
                    /api/scan/dependencies
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {result && (
          <section className="mt-8">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Findings
                </h2>
                <p className="text-sm text-white/40">
                  {filteredFindings.length} matching result
                  {filteredFindings.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                    value={query}
                    onChange={(event) =>
                      setQuery(event.target.value)
                    }
                    placeholder="Search findings..."
                    className="rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-white/25 focus:border-white/20"
                  />
                </div>

                <select
                  value={severity}
                  onChange={(event) =>
                    setSeverity(event.target.value)
                  }
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 outline-none"
                >
                  <option value="all">All severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {filteredFindings.length === 0 ? (
              <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-8 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-300" />
                <h3 className="mt-3 font-medium">
                  No matching dependency findings
                </h3>
                <p className="mt-1 text-sm text-white/40">
                  The current scanner returned no results matching
                  your filters.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFindings.map((finding, index) => {
                  const isOpen = expanded === index;

                  return (
                    <article
                      key={`${finding.package || finding.name || "finding"}-${index}`}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded(isOpen ? null : index)
                        }
                        className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-white/[0.025]"
                      >
                        <div className="shrink-0">
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4 text-white/40" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-white/40" />
                          )}
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                          <FileCode2 className="h-4 w-4 text-white/50" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate font-medium">
                              {finding.name ||
                                finding.package ||
                                finding.title ||
                                "Dependency finding"}
                            </h3>

                            {finding.severity && (
                              <span
                                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${severityClass(
                                  finding.severity
                                )}`}
                              >
                                {finding.severity}
                              </span>
                            )}
                          </div>

                          <p className="mt-1 truncate text-xs text-white/40">
                            {finding.message ||
                              finding.description ||
                              finding.title ||
                              "Dependency analysis result"}
                          </p>
                        </div>

                        <AlertTriangle className="h-4 w-4 shrink-0 text-white/20" />
                      </button>

                      {isOpen && (
                        <div className="border-t border-white/10 bg-black/20 p-5">
                          <div className="grid gap-5 md:grid-cols-2">
                            <div>
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/30">
                                Description
                              </p>
                              <p className="text-sm leading-6 text-white/65">
                                {finding.description ||
                                  finding.message ||
                                  "No description supplied."}
                              </p>
                            </div>

                            <div>
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/30">
                                Location
                              </p>
                              <p className="font-mono text-sm text-white/60">
                                {finding.file || "Dependency manifest"}
                                {finding.line
                                  ? `:${finding.line}`
                                  : ""}
                              </p>
                            </div>

                            <div>
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/30">
                                Evidence
                              </p>
                              <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-xs leading-5 text-white/50">
                                {finding.evidence ||
                                  "No evidence supplied."}
                              </pre>
                            </div>

                            <div>
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/30">
                                Remediation
                              </p>
                              <p className="text-sm leading-6 text-white/65">
                                {finding.remediation ||
                                  finding.recommendation ||
                                  "Review the affected dependency and update or replace it as appropriate."}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
