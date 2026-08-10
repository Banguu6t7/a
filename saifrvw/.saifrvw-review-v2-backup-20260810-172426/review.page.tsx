"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clipboard,
  Code2,
  Download,
  FileCode2,
  Filter,
  Loader2,
  MessageSquare,
  Play,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  Terminal,
  XCircle,
} from "lucide-react";

type Severity = "critical" | "high" | "medium" | "low" | "info";

type Finding = {
  id: string;
  title: string;
  severity: string;
  confidence: number;
  line: number;
  column?: number;
  category: string;
  cwe: string;
  owasp: string;
  evidence: string;
  description: string;
  impact: string;
  attackScenario: string;
  remediation: string;
  secureExample?: string;
};

type Counts = {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
};

type Analysis = {
  findings: Finding[];
  riskScore: number;
  securityGrade: string;
  counts: Counts;
  scannedLines?: number;
  engine?: string;
  language?: string;
};

type AnalyzeResponse = {
  ok?: boolean;
  analysis?: Analysis;
  remediation?: unknown;
  error?: string;
};

type AIResponse = {
  ok?: boolean;
  answer?: string;
  response?: string;
  message?: string;
  error?: string;
};

const demo = `function login(username, password) {
  const query =
    "SELECT * FROM users WHERE username = '" + username + "'";

  console.log("password:", password);

  eval(userInput);

  fetch(req.query.url);

  return database.query(query);
}`;

const severityOrder: Severity[] = [
  "critical",
  "high",
  "medium",
  "low",
  "info",
];

function normalizeSeverity(value: string): Severity {
  const normalized = value.toLowerCase();

  if (normalized === "critical") return "critical";
  if (normalized === "high") return "high";
  if (normalized === "medium") return "medium";
  if (normalized === "low") return "low";

  return "info";
}

function severityClass(severity: string): string {
  switch (normalizeSeverity(severity)) {
    case "critical":
      return "border-red-500/30 bg-red-500/10 text-red-300";
    case "high":
      return "border-orange-500/30 bg-orange-500/10 text-orange-300";
    case "medium":
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
    case "low":
      return "border-blue-500/30 bg-blue-500/10 text-blue-300";
    default:
      return "border-slate-500/30 bg-slate-500/10 text-slate-300";
  }
}

function riskTone(score: number): string {
  if (score >= 80) return "text-red-400";
  if (score >= 60) return "text-orange-400";
  if (score >= 35) return "text-yellow-400";
  return "text-emerald-400";
}

function Metric({
  label,
  value,
  tone = "text-white",
}: {
  label: string;
  value: string | number;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>
      <div className={`mt-2 text-2xl font-bold ${tone}`}>{value}</div>
    </div>
  );
}

function FindingCard({
  finding,
  selected,
  expanded,
  onSelect,
  onToggle,
}: {
  finding: Finding;
  selected: boolean;
  expanded: boolean;
  onSelect: () => void;
  onToggle: () => void;
}) {
  return (
    <div
      className={`rounded-xl border transition ${
        selected
          ? "border-indigo-400/40 bg-indigo-500/[0.08]"
          : "border-white/10 bg-white/[0.025] hover:border-white/20"
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        <button
          type="button"
          onClick={onToggle}
          className="mt-0.5 rounded-md p-1 text-slate-500 hover:bg-white/10 hover:text-white"
          aria-label={expanded ? "Collapse finding" : "Expand finding"}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        <button
          type="button"
          onClick={onSelect}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${severityClass(
                finding.severity,
              )}`}
            >
              {finding.severity}
            </span>

            <span className="font-mono text-[10px] text-slate-600">
              L{finding.line}
              {finding.column ? `:${finding.column}` : ""}
            </span>
          </div>

          <h3 className="mt-2 font-semibold text-slate-100">
            {finding.title}
          </h3>

          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
            {finding.description}
          </p>
        </button>
      </div>

      {expanded && (
        <div className="border-t border-white/10 px-4 pb-4 pt-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="Category" value={finding.category} />
            <Info label="CWE" value={finding.cwe} />
            <Info label="OWASP" value={finding.owasp} />
            <Info
              label="Confidence"
              value={`${Math.round(finding.confidence)}%`}
            />
          </div>

          <div className="mt-4">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
              Evidence
            </div>
            <pre className="overflow-x-auto rounded-lg border border-white/10 bg-black/30 p-3 font-mono text-xs leading-5 text-slate-300">
              {finding.evidence}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <div className="text-[9px] uppercase tracking-wider text-slate-600">
        {label}
      </div>
      <div className="mt-1 truncate text-xs text-slate-300">{value}</div>
    </div>
  );
}

export default function ReviewPage() {
  const [code, setCode] = useState(demo);
  const [language, setLanguage] = useState("javascript");

  const [result, setResult] = useState<Analysis | null>(null);
  const [selected, setSelected] = useState<Finding | null>(null);

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState("");
  const [error, setError] = useState("");

  const [severityFilter, setSeverityFilter] =
    useState<Severity | "all">("all");

  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filteredFindings = useMemo(() => {
    if (!result) return [];

    if (severityFilter === "all") {
      return result.findings;
    }

    return result.findings.filter(
      (finding) => normalizeSeverity(finding.severity) === severityFilter,
    );
  }, [result, severityFilter]);

  async function analyze() {
    setLoading(true);
    setError("");
    setAiAnswer("");
    setSelected(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
        }),
      });

      const data = (await response.json()) as AnalyzeResponse;

      if (!response.ok || !data.analysis) {
        throw new Error(data.error || "Analysis failed.");
      }

      setResult(data.analysis);

      if (data.analysis.findings.length > 0) {
        setSelected(data.analysis.findings[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  async function askAI(action: string) {
    if (!selected) return;

    setAiLoading(true);
    setAiAnswer("");

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          finding: selected,
          action,
          code,
          language,
        }),
      });

      const data = (await response.json()) as AIResponse;

      if (!response.ok) {
        throw new Error(data.error || "AI request failed.");
      }

      setAiAnswer(
        data.answer ||
          data.response ||
          data.message ||
          "The AI returned no explanation.",
      );
    } catch (err) {
      setAiAnswer(
        err instanceof Error ? err.message : "AI guidance failed.",
      );
    } finally {
      setAiLoading(false);
    }
  }

  function toggleFinding(id: string) {
    setExpanded((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function selectFinding(finding: Finding) {
    setSelected(finding);

    const lineIndex = Math.max(finding.line - 1, 0);
    const lines = code.split("\n");
    const start = Math.max(0, lineIndex - 3);
    const end = Math.min(lines.length, lineIndex + 4);

    const focused = lines.slice(start, end);

    if (focused.length > 0) {
      setCode(
        lines
          .map((line, index) =>
            index >= start && index < end ? line : line,
          )
          .join("\n"),
      );
    }
  }

  function downloadReport() {
    if (!result) return;

    const payload = {
      generatedAt: new Date().toISOString(),
      language,
      analysis: result,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "saifrvw-security-report.json";
    anchor.click();

    URL.revokeObjectURL(url);
  }

  async function copyFinding() {
    if (!selected) return;

    const text = [
      selected.title,
      `Severity: ${selected.severity}`,
      `CWE: ${selected.cwe}`,
      `OWASP: ${selected.owasp}`,
      `Line: ${selected.line}`,
      "",
      selected.description,
      "",
      `Evidence: ${selected.evidence}`,
      "",
      `Remediation: ${selected.remediation}`,
    ].join("\n");

    await navigator.clipboard.writeText(text);
  }

  const counts = result?.counts ?? {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };

  return (
    <main className="min-h-screen bg-[#07080d] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.06),transparent_35%)]" />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#08090e]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1700px] items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg p-2 text-slate-500 hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-400" />
              <span className="font-semibold tracking-tight">SAIFRVW</span>
              <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2 py-0.5 font-mono text-[9px] text-indigo-300">
                SENTINEL
              </span>
            </div>

            <div className="hidden h-5 w-px bg-white/10 sm:block" />

            <span className="hidden font-mono text-[10px] text-slate-600 sm:block">
              REVIEW / V2
            </span>
          </div>

          <div className="flex items-center gap-2">
            {result && (
              <button
                type="button"
                onClick={downloadReport}
                className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.07] sm:flex"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
            )}

            <Link
              href="/docs"
              className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-white"
            >
              Docs
            </Link>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-[1700px] px-4 py-5 sm:px-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
              Static Security Workspace
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Find the risk. Fix the code.
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Analyze source code, inspect findings, compare remediation,
              and use finding-aware AI guidance without changing the analysis
              backend.
            </p>
          </div>

          <button
            type="button"
            onClick={analyze}
            disabled={loading || !code.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {loading ? "Analyzing..." : "Run security analysis"}
          </button>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.07] p-4 text-sm text-red-300">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <div className="font-semibold">Analysis failed</div>
              <div className="mt-1 text-red-300/70">{error}</div>
            </div>
          </div>
        )}

        {result && (
          <section className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <Metric
              label="Risk score"
              value={result.riskScore}
              tone={riskTone(result.riskScore)}
            />

            <Metric
              label="Grade"
              value={result.securityGrade}
              tone={riskTone(result.riskScore)}
            />

            <Metric
              label="Critical"
              value={counts.critical}
              tone="text-red-400"
            />

            <Metric
              label="High"
              value={counts.high}
              tone="text-orange-400"
            />

            <Metric
              label="Medium"
              value={counts.medium}
              tone="text-yellow-400"
            />

            <Metric
              label="Findings"
              value={result.findings.length}
              tone="text-indigo-400"
            />
          </section>
        )}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)_340px]">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c0e14]/90 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <FileCode2 className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-semibold">Source</span>
                <span className="font-mono text-[9px] text-slate-600">
                  {language}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 font-mono text-[10px] text-slate-400 outline-none"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="php">PHP</option>
                  <option value="go">Go</option>
                </select>

                <button
                  type="button"
                  onClick={() => setCode("")}
                  className="rounded-lg p-2 text-slate-600 hover:bg-white/5 hover:text-slate-300"
                  aria-label="Clear code"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                value={code}
                onChange={(event) => setCode(event.target.value)}
                spellCheck={false}
                className="min-h-[620px] w-full resize-none bg-[#080a0f] p-5 font-mono text-[12px] leading-6 text-slate-300 outline-none"
                placeholder="Paste source code here..."
              />

              <div className="pointer-events-none absolute bottom-3 right-4 rounded-md border border-white/10 bg-black/50 px-2 py-1 font-mono text-[9px] text-slate-600">
                {code.split("\n").length} lines
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c0e14]/90">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-semibold">Findings</span>
              </div>

              {result && (
                <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-black/20 p-1">
                  <Filter className="mx-1 h-3 w-3 text-slate-600" />

                  <select
                    value={severityFilter}
                    onChange={(event) =>
                      setSeverityFilter(
                        event.target.value as Severity | "all",
                      )
                    }
                    className="bg-transparent px-1 py-1 font-mono text-[9px] uppercase text-slate-400 outline-none"
                  >
                    <option value="all">All</option>
                    {severityOrder.map((severity) => (
                      <option key={severity} value={severity}>
                        {severity}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="max-h-[620px] overflow-y-auto p-3">
              {!result && !loading && (
                <div className="flex min-h-[540px] flex-col items-center justify-center px-8 text-center">
                  <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <Search className="h-6 w-6 text-slate-600" />
                  </div>

                  <div className="text-sm font-semibold text-slate-300">
                    No analysis yet
                  </div>

                  <p className="mt-2 max-w-xs text-xs leading-5 text-slate-600">
                    Run the security analysis to populate findings,
                    severity, evidence, and remediation details.
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex min-h-[540px] flex-col items-center justify-center text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                  <p className="mt-4 text-sm font-semibold">
                    Inspecting source...
                  </p>
                  <p className="mt-2 text-xs text-slate-600">
                    Running the existing Sentinel analysis engine.
                  </p>
                </div>
              )}

              {result && filteredFindings.length === 0 && (
                <div className="flex min-h-[540px] flex-col items-center justify-center text-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                  <p className="mt-4 font-semibold">No matching findings</p>
                  <p className="mt-2 text-xs text-slate-600">
                    Try another severity filter or scan different code.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {filteredFindings.map((finding) => (
                  <FindingCard
                    key={finding.id}
                    finding={finding}
                    selected={selected?.id === finding.id}
                    expanded={expanded.has(finding.id)}
                    onSelect={() => selectFinding(finding)}
                    onToggle={() => toggleFinding(finding.id)}
                  />
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c0e14]/90">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <ShieldAlert className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-semibold">
                  Finding intelligence
                </span>
              </div>

              {!selected ? (
                <div className="p-6 text-center">
                  <AlertTriangle className="mx-auto h-7 w-7 text-slate-700" />
                  <p className="mt-3 text-xs text-slate-500">
                    Select a finding to inspect its security context.
                  </p>
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md border px-2 py-1 text-[9px] font-bold uppercase ${severityClass(
                        selected.severity,
                      )}`}
                    >
                      {selected.severity}
                    </span>

                    <span className="font-mono text-[9px] text-slate-600">
                      L{selected.line}
                    </span>
                  </div>

                  <h2 className="mt-3 text-lg font-bold leading-tight">
                    {selected.title}
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {selected.description}
                  </p>

                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                        Impact
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        {selected.impact}
                      </p>
                    </div>

                    <div>
                      <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                        Attack scenario
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        {selected.attackScenario}
                      </p>
                    </div>

                    <div>
                      <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                        Remediation
                      </div>
                      <p className="mt-1 text-xs leading-5 text-emerald-300/80">
                        {selected.remediation}
                      </p>
                    </div>
                  </div>

                  {selected.secureExample && (
                    <div className="mt-4">
                      <div className="mb-2 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
                        <Code2 className="h-3 w-3" />
                        Fixed code
                      </div>

                      <pre className="max-h-48 overflow-auto rounded-xl border border-emerald-500/10 bg-emerald-500/[0.04] p-3 font-mono text-[10px] leading-5 text-emerald-200/80">
                        {selected.secureExample}
                      </pre>
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => askAI("explain")}
                      disabled={aiLoading}
                      className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] text-slate-300 hover:bg-white/[0.07] disabled:opacity-50"
                    >
                      <Bot className="h-3.5 w-3.5" />
                      Explain
                    </button>

                    <button
                      type="button"
                      onClick={() => askAI("fix")}
                      disabled={aiLoading}
                      className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] text-slate-300 hover:bg-white/[0.07] disabled:opacity-50"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Fix
                    </button>

                    <button
                      type="button"
                      onClick={() => askAI("attack")}
                      disabled={aiLoading}
                      className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] text-slate-300 hover:bg-white/[0.07] disabled:opacity-50"
                    >
                      <ShieldAlert className="h-3.5 w-3.5" />
                      Threat
                    </button>

                    <button
                      type="button"
                      onClick={copyFinding}
                      className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] text-slate-300 hover:bg-white/[0.07]"
                    >
                      <Clipboard className="h-3.5 w-3.5" />
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c0e14]/90">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <MessageSquare className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-semibold">AI guidance</span>
              </div>

              <div className="min-h-40 p-4">
                {aiLoading && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                    Generating finding-aware guidance...
                  </div>
                )}

                {!aiLoading && !aiAnswer && (
                  <p className="text-xs leading-5 text-slate-600">
                    Select a finding and choose Explain, Fix, or Threat.
                    The existing AI route remains untouched.
                  </p>
                )}

                {!aiLoading && aiAnswer && (
                  <div className="whitespace-pre-wrap text-xs leading-6 text-slate-400">
                    {aiAnswer}
                  </div>
                )}
              </div>
            </section>

            {result && (
              <section className="rounded-2xl border border-white/10 bg-[#0c0e14]/90 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-semibold">
                    Scan metadata
                  </span>
                </div>

                <div className="mt-3 space-y-2 font-mono text-[9px] text-slate-600">
                  <div className="flex justify-between gap-3">
                    <span>ENGINE</span>
                    <span className="text-slate-400">
                      {result.engine || "Sentinel"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span>LANGUAGE</span>
                    <span className="text-slate-400">
                      {result.language || language}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span>LINES</span>
                    <span className="text-slate-400">
                      {result.scannedLines ?? code.split("\n").length}
                    </span>
                  </div>
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
