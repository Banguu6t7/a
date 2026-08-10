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
  Copy,
  Download,
  FileCode2,
  Loader2,
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

type Analysis = {
  findings: Finding[];
  riskScore: number;
  securityGrade: string;
  counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  scannedLines?: number;
  engine?: string;
  language?: string;
};

type AnalyzeResponse = {
  ok: boolean;
  analysis: Analysis;
  remediation?: unknown;
  error?: string;
};

const demo = `function login(username, password) {
  const query = "SELECT * FROM users WHERE username = '" + username + "'";
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
  const s = value.toLowerCase();

  if (s === "critical") return "critical";
  if (s === "high") return "high";
  if (s === "medium") return "medium";
  if (s === "low") return "low";

  return "info";
}

function severityClasses(severity: string) {
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
      return "border-white/10 bg-white/5 text-gray-400";
  }
}

function riskLabel(score: number) {
  if (score >= 80) return "Critical exposure";
  if (score >= 60) return "High exposure";
  if (score >= 35) return "Moderate exposure";
  if (score > 0) return "Low exposure";
  return "No findings";
}

function extractLine(code: string, line: number) {
  const lines = code.split("\n");
  return lines[Math.max(0, line - 1)] ?? "";
}

export default function ReviewPage() {
  const [code, setCode] = useState(demo);
  const [language, setLanguage] = useState("javascript");

  const [result, setResult] = useState<Analysis | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [severityFilter, setSeverityFilter] = useState<"all" | Severity>("all");
  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState("");

  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const findings = result?.findings ?? [];

  const selected = useMemo(
    () => findings.find((finding) => finding.id === selectedId) ?? null,
    [findings, selectedId]
  );

  const filteredFindings = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return findings.filter((finding) => {
      const matchesSeverity =
        severityFilter === "all" ||
        normalizeSeverity(finding.severity) === severityFilter;

      if (!needle) return matchesSeverity;

      const haystack = [
        finding.title,
        finding.category,
        finding.cwe,
        finding.owasp,
        finding.description,
      ]
        .join(" ")
        .toLowerCase();

      return matchesSeverity && haystack.includes(needle);
    });
  }, [findings, query, severityFilter]);

  const highlightedLines = useMemo(() => {
    if (!selected) return new Set<number>();

    return new Set(
      Array.from(
        { length: Math.max(1, selected.line + 2) },
        (_, index) => index + 1
      ).filter((line) => Math.abs(line - selected.line) <= 1)
    );
  }, [selected]);

  async function analyze() {
    setLoading(true);
    setError("");
    setAiAnswer("");

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

      if (!response.ok || !data.ok || !data.analysis) {
        throw new Error(data.error || "Analysis failed.");
      }

      setResult(data.analysis);

      const first = data.analysis.findings[0];
      setSelectedId(first?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  async function askAI(action: string) {
    if (!selected) return;

    setAiLoading(true);
    setAiAnswer("");
    setError("");

    try {
      /*
       * Keep the existing finding-aware API contract.
       * The payload intentionally follows the current review workflow:
       * finding + requested action + source code.
       */
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          finding: selected,
          code,
          language,
        }),
      });

      const data = (await response.json()) as {
        answer?: string;
        response?: string;
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "AI request failed.");
      }

      setAiAnswer(
        data.answer ||
          data.response ||
          data.message ||
          "The AI route returned no explanation."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI request failed.");
    } finally {
      setAiLoading(false);
    }
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
      "Impact:",
      selected.impact,
      "",
      "Remediation:",
      selected.remediation,
    ].join("\n");

    await navigator.clipboard.writeText(text);
    setCopied(true);

    window.setTimeout(() => setCopied(false), 1600);
  }

  function downloadReport() {
    if (!result) return;

    const report = {
      generatedAt: new Date().toISOString(),
      language,
      riskScore: result.riskScore,
      securityGrade: result.securityGrade,
      counts: result.counts,
      findings: result.findings,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "saifrvw-security-report.json";
    anchor.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#07080c] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,.07),transparent_30%)]" />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#08090d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-400" />
              <span className="font-semibold tracking-tight">SENTINEL</span>
              <span className="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2 py-0.5 font-mono text-[9px] text-indigo-300">
                REVIEW V2
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadReport}
              disabled={!result}
              className="hidden rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 sm:inline-flex"
            >
              <Download className="mr-2 h-3.5 w-3.5" />
              Export
            </button>

            <button
              onClick={analyze}
              disabled={loading || !code.trim()}
              className="inline-flex items-center rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <ShieldAlert className="mr-2 h-3.5 w-3.5" />
              )}
              {loading ? "Scanning…" : "Run security scan"}
            </button>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-[1800px] px-4 py-5 lg:px-6">
        <section className="mb-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.22em] text-indigo-400">
                <Sparkles className="h-3.5 w-3.5" />
                Security analysis workspace
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Review your code like an analyst.
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-gray-500">
                Detect vulnerabilities, inspect evidence, synchronize findings
                with source lines, and get focused remediation guidance.
              </p>
            </div>

            {result && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <div className="font-mono text-[9px] uppercase tracking-widest text-gray-500">
                  Engine
                </div>
                <div className="mt-1 text-xs text-gray-200">
                  {result.engine || "Sentinel"}{" "}
                  <span className="text-gray-600">•</span>{" "}
                  {result.language || language}
                </div>
              </div>
            )}
          </div>
        </section>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <div className="font-semibold">Operation failed</div>
              <div className="mt-1 text-red-300/70">{error}</div>
            </div>
          </div>
        )}

        {result && (
          <section className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-7">
            <RiskCard
              label="Risk score"
              value={String(result.riskScore)}
              accent={result.riskScore >= 60 ? "danger" : "normal"}
            />
            <RiskCard
              label="Grade"
              value={result.securityGrade}
              accent="normal"
            />
            <RiskCard label="Critical" value={String(result.counts.critical)} accent="danger" />
            <RiskCard label="High" value={String(result.counts.high)} accent="danger" />
            <RiskCard label="Medium" value={String(result.counts.medium)} accent="warn" />
            <RiskCard label="Low" value={String(result.counts.low)} accent="normal" />
            <RiskCard
              label="Lines scanned"
              value={String(result.scannedLines ?? code.split("\n").length)}
              accent="normal"
            />
          </section>
        )}

        <div className="grid gap-4 xl:grid-cols-[minmax(280px,330px)_minmax(420px,1fr)_minmax(300px,390px)]">
          <aside className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0f15]/90 shadow-2xl shadow-black/20">
            <div className="border-b border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Findings</div>
                  <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-gray-600">
                    {findings.length} detected
                  </div>
                </div>

                <AlertTriangle className="h-4 w-4 text-yellow-400" />
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                <Search className="h-3.5 w-3.5 text-gray-600" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Filter findings..."
                  className="w-full bg-transparent text-xs text-gray-200 outline-none placeholder:text-gray-600"
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {(["all", ...severityOrder] as const).map((severity) => (
                  <button
                    key={severity}
                    onClick={() => setSeverityFilter(severity)}
                    className={`rounded-md border px-2 py-1 font-mono text-[9px] uppercase transition ${
                      severityFilter === severity
                        ? "border-indigo-400/30 bg-indigo-400/10 text-indigo-300"
                        : "border-white/10 text-gray-600 hover:bg-white/5 hover:text-gray-300"
                    }`}
                  >
                    {severity}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[680px] overflow-y-auto p-2">
              {!result && (
                <EmptyFindings
                  icon={<Terminal className="h-7 w-7" />}
                  title="Awaiting analysis"
                  text="Run a scan to populate the finding navigator."
                />
              )}

              {result && findings.length === 0 && (
                <EmptyFindings
                  icon={<CheckCircle2 className="h-7 w-7 text-emerald-400" />}
                  title="No vulnerabilities found"
                  text="The current scan returned a clean result."
                />
              )}

              {result && findings.length > 0 && filteredFindings.length === 0 && (
                <EmptyFindings
                  icon={<Search className="h-7 w-7" />}
                  title="No matching findings"
                  text="Try another severity or search term."
                />
              )}

              {filteredFindings.map((finding) => {
                const active = finding.id === selectedId;

                return (
                  <button
                    key={finding.id}
                    onClick={() => setSelectedId(finding.id)}
                    className={`mb-2 w-full rounded-xl border p-3 text-left transition ${
                      active
                        ? "border-indigo-400/30 bg-indigo-400/[0.08]"
                        : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {active ? (
                        <ChevronDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" />
                      ) : (
                        <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-600" />
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-semibold text-gray-200">
                          {finding.title}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span
                            className={`rounded border px-1.5 py-0.5 font-mono text-[8px] uppercase ${severityClasses(
                              finding.severity
                            )}`}
                          >
                            {finding.severity}
                          </span>

                          <span className="font-mono text-[9px] text-gray-600">
                            L{finding.line}
                          </span>

                          {finding.cwe && (
                            <span className="font-mono text-[9px] text-gray-600">
                              {finding.cwe}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0f15]/90 shadow-2xl shadow-black/20">
            <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <FileCode2 className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-semibold">Source</span>
                {selected && (
                  <span className="font-mono text-[9px] text-gray-600">
                    synchronized → line {selected.line}
                  </span>
                )}
              </div>

              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 font-mono text-[10px] text-gray-300 outline-none"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="go">Go</option>
                <option value="php">PHP</option>
              </select>
            </div>

            <div className="overflow-auto bg-[#080a0f]">
              <div className="min-w-[700px] font-mono text-xs leading-6">
                {code.split("\n").map((line, index) => {
                  const lineNumber = index + 1;
                  const highlighted = highlightedLines.has(lineNumber);
                  const exact = selected?.line === lineNumber;

                  return (
                    <div
                      key={lineNumber}
                      className={`flex ${
                        highlighted
                          ? exact
                            ? "bg-red-500/10"
                            : "bg-yellow-500/[0.035]"
                          : ""
                      }`}
                    >
                      <div
                        className={`w-14 shrink-0 select-none border-r border-white/5 px-3 text-right ${
                          exact ? "text-red-300" : "text-gray-700"
                        }`}
                      >
                        {lineNumber}
                      </div>

                      <div
                        className={`whitespace-pre px-4 ${
                          exact ? "text-red-200" : "text-gray-400"
                        }`}
                      >
                        {line || " "}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-white/10 p-3">
              <textarea
                value={code}
                onChange={(event) => setCode(event.target.value)}
                spellCheck={false}
                className="h-44 w-full resize-y rounded-xl border border-white/5 bg-black/20 p-4 font-mono text-xs leading-6 text-gray-300 outline-none transition focus:border-indigo-400/30"
                placeholder="Paste source code to analyze..."
              />
            </div>
          </section>

          <aside className="space-y-4">
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0f15]/90">
              <div className="border-b border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Finding detail</div>

                  {selected && (
                    <button
                      onClick={copyFinding}
                      className="rounded-lg p-2 text-gray-500 transition hover:bg-white/5 hover:text-white"
                      title="Copy finding"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {copied && (
                  <div className="mt-2 font-mono text-[9px] text-emerald-400">
                    Finding copied.
                  </div>
                )}
              </div>

              <div className="p-4">
                {!selected && (
                  <EmptyFindings
                    icon={<Shield className="h-7 w-7" />}
                    title="Select a finding"
                    text="Choose an item from the navigator to inspect its evidence and remediation."
                  />
                )}

                {selected && (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded border px-2 py-1 font-mono text-[9px] uppercase ${severityClasses(
                          selected.severity
                        )}`}
                      >
                        {selected.severity}
                      </span>

                      <span className="font-mono text-[9px] text-gray-600">
                        confidence {selected.confidence}%
                      </span>
                    </div>

                    <h2 className="mt-3 text-lg font-semibold leading-tight">
                      {selected.title}
                    </h2>

                    <div className="mt-2 font-mono text-[9px] text-gray-600">
                      {selected.category} • {selected.cwe} • {selected.owasp}
                    </div>

                    <DetailBlock title="Evidence">
                      <code className="block rounded-lg border border-red-500/10 bg-red-500/5 p-3 font-mono text-[10px] leading-5 text-red-200">
                        {selected.evidence}
                      </code>
                    </DetailBlock>

                    <DetailBlock title="Description">
                      {selected.description}
                    </DetailBlock>

                    <DetailBlock title="Impact">
                      {selected.impact}
                    </DetailBlock>

                    <DetailBlock title="Attack scenario">
                      {selected.attackScenario}
                    </DetailBlock>

                    <DetailBlock title="Remediation">
                      {selected.remediation}
                    </DetailBlock>
                  </>
                )}
              </div>
            </section>

            {selected && (
              <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0f15]/90">
                <div className="border-b border-white/10 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Bot className="h-4 w-4 text-indigo-400" />
                    Finding-focused AI
                  </div>
                  <div className="mt-1 text-[10px] text-gray-600">
                    Ask the existing AI route about this exact finding.
                  </div>
                </div>

                <div className="grid gap-2 p-3">
                  {[
                    ["Explain risk", "Explain the security risk and realistic attacker impact."],
                    ["Fix this", "Give a secure remediation for this finding."],
                    ["Review fix", "Review the suggested secure fix and identify mistakes."],
                  ].map(([label, action]) => (
                    <button
                      key={label}
                      onClick={() => askAI(action)}
                      disabled={aiLoading}
                      className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left text-xs text-gray-300 transition hover:border-indigo-400/20 hover:bg-indigo-400/[0.05] disabled:opacity-50"
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {aiLoading && (
                  <div className="flex items-center gap-2 border-t border-white/10 px-4 py-3 text-xs text-gray-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Sentinel AI is analyzing the finding…
                  </div>
                )}

                {aiAnswer && (
                  <div className="border-t border-white/10 p-4">
                    <div className="mb-2 font-mono text-[9px] uppercase tracking-widest text-indigo-400">
                      AI guidance
                    </div>
                    <div className="whitespace-pre-wrap text-xs leading-6 text-gray-300">
                      {aiAnswer}
                    </div>
                  </div>
                )}
              </section>
            )}

            {selected && (
              <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0f15]/90">
                <div className="border-b border-white/10 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <FileCode2 className="h-4 w-4 text-emerald-400" />
                    Vulnerable → fixed
                  </div>
                </div>

                <div className="space-y-3 p-3">
                  <CodeCompare
                    label="Vulnerable"
                    value={
                      extractLine(code, selected.line) ||
                      selected.evidence ||
                      "No source line available."
                    }
                    danger
                  />

                  <CodeCompare
                    label="Recommended"
                    value={
                      selected.secureExample ||
                      selected.remediation ||
                      "No secure example supplied by the analyzer."
                    }
                  />
                </div>
              </section>
            )}

            {result && (
              <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="font-mono text-[9px] uppercase tracking-widest text-gray-600">
                  Executive assessment
                </div>
                <div className="mt-2 text-sm font-semibold">
                  {riskLabel(result.riskScore)}
                </div>
                <p className="mt-2 text-xs leading-5 text-gray-500">
                  {result.findings.length === 0
                    ? "No findings were returned by the current analysis."
                    : `${result.findings.length} finding${
                        result.findings.length === 1 ? "" : "s"
                      } require review. Prioritize critical and high severity issues first.`}
                </p>
              </section>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

function RiskCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "danger" | "warn" | "normal";
}) {
  const valueClass =
    accent === "danger"
      ? "text-red-300"
      : accent === "warn"
        ? "text-yellow-300"
        : "text-gray-100";

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
      <div className="font-mono text-[8px] uppercase tracking-widest text-gray-600">
        {label}
      </div>
      <div className={`mt-2 text-lg font-bold ${valueClass}`}>{value}</div>
    </div>
  );
}

function EmptyFindings({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center px-5 text-center">
      <div className="text-gray-600">{icon}</div>
      <div className="mt-3 text-xs font-semibold text-gray-400">{title}</div>
      <div className="mt-1 max-w-xs text-[10px] leading-5 text-gray-600">
        {text}
      </div>
    </div>
  );
}

function DetailBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <div className="mb-2 font-mono text-[9px] uppercase tracking-widest text-gray-600">
        {title}
      </div>
      <div className="text-xs leading-5 text-gray-400">{children}</div>
    </div>
  );
}

function CodeCompare({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div>
      <div
        className={`mb-1 font-mono text-[9px] uppercase tracking-widest ${
          danger ? "text-red-400" : "text-emerald-400"
        }`}
      >
        {label}
      </div>

      <pre
        className={`overflow-x-auto rounded-lg border p-3 font-mono text-[10px] leading-5 ${
          danger
            ? "border-red-500/10 bg-red-500/5 text-red-200"
            : "border-emerald-500/10 bg-emerald-500/5 text-emerald-200"
        }`}
      >
        {value}
      </pre>
    </div>
  );
}
