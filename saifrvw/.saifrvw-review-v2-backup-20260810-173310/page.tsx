 "use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Check,
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
  RefreshCw,
  Shield,
  ShieldAlert,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";

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
  ok: boolean;
  analysis?: Analysis;
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
  const query = "SELECT * FROM users WHERE username = '" + username + "'";
  console.log("password:", password);

  eval(userInput);

  fetch(req.query.url);

  return database.query(query);
}`;

const severityOrder = ["critical", "high", "medium", "low", "info"] as const;
type Severity = (typeof severityOrder)[number];

const severityMeta: Record<Severity, { label: string; tone: string; dot: string }> = {
  critical: { label: "Critical", tone: "text-red-300 border-red-500/30 bg-red-500/10", dot: "bg-red-400" },
  high: { label: "High", tone: "text-orange-300 border-orange-500/30 bg-orange-500/10", dot: "bg-orange-400" },
  medium: { label: "Medium", tone: "text-amber-300 border-amber-500/30 bg-amber-500/10", dot: "bg-amber-400" },
  low: { label: "Low", tone: "text-sky-300 border-sky-500/30 bg-sky-500/10", dot: "bg-sky-400" },
  info: { label: "Info", tone: "text-slate-300 border-slate-500/30 bg-slate-500/10", dot: "bg-slate-400" },
};

function normalizeSeverity(value: string): Severity {
  const normalized = value.toLowerCase();
  return severityOrder.includes(normalized as Severity)
    ? (normalized as Severity)
    : "info";
}

function riskTone(score: number) {
  if (score >= 80) return "text-red-300";
  if (score >= 60) return "text-orange-300";
  if (score >= 35) return "text-amber-300";
  return "text-emerald-300";
}

export default function ReviewPage() {
  const [code, setCode] = useState(demo);
  const [language, setLanguage] = useState("javascript");
  const [result, setResult] = useState<Analysis | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | Severity>("all");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLTextAreaElement>(null);

  const findings = result?.findings ?? [];

  const filteredFindings = useMemo(
    () =>
      findings.filter(
        (finding) =>
          filter === "all" || normalizeSeverity(finding.severity) === filter,
      ),
    [findings, filter],
  );

  const selectedFinding =
    findings.find((finding) => finding.id === selectedId) ??
    filteredFindings[0] ??
    null;

  const riskSummary = useMemo(() => {
    if (!result) return { total: 0, blocking: 0, confidence: 0 };

    const blocking = findings.filter((finding) => {
      const severity = normalizeSeverity(finding.severity);
      return severity === "critical" || severity === "high";
    }).length;

    const confidence =
      findings.length === 0
        ? 0
        : Math.round(
            findings.reduce(
              (sum, finding) => sum + Number(finding.confidence || 0),
              0,
            ) / findings.length,
          );

    return {
      total: findings.length,
      blocking,
      confidence,
    };
  }, [result, findings]);

  async function analyze() {
    setLoading(true);
    setError("");
    setAiAnswer("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const data = (await response.json()) as AnalyzeResponse;

      if (!response.ok || !data.ok || !data.analysis) {
        throw new Error(data.error || "Analysis failed.");
      }

      setResult(data.analysis);

      const first = data.analysis.findings[0] ?? null;
      setSelectedId(first?.id ?? null);
      setExpandedId(first?.id ?? null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Analysis failed.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  async function askAI(action: string) {
    if (!selectedFinding) return;

    setAiLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          finding: selectedFinding,
          code,
          language,
        }),
      });

      const data = (await response.json()) as AIResponse;

      if (!response.ok) {
        throw new Error(data.error || "AI guidance failed.");
      }

      setAiAnswer(
        data.answer ||
          data.response ||
          data.message ||
          "No guidance returned.",
      );
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "AI guidance failed.",
      );
    } finally {
      setAiLoading(false);
    }
  }

  function selectFinding(finding: Finding) {
    setSelectedId(finding.id);
    setExpandedId(finding.id);

    const lineIndex = Math.max(0, finding.line - 1);
    const lineHeight = 24;

    codeRef.current?.scrollTo({
      top: lineIndex * lineHeight,
      behavior: "smooth",
    });
  }

  async function copyFinding() {
    if (!selectedFinding) return;

    const text = [
      selectedFinding.title,
      `Severity: ${selectedFinding.severity}`,
      `Line: ${selectedFinding.line}`,
      `CWE: ${selectedFinding.cwe}`,
      `OWASP: ${selectedFinding.owasp}`,
      "",
      selectedFinding.description,
      "",
      `Evidence: ${selectedFinding.evidence}`,
      "",
      `Remediation: ${selectedFinding.remediation}`,
    ].join("\n");

    await navigator.clipboard.writeText(text);

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function downloadReport() {
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

  return (
    <main className="min-h-screen bg-[#07090d] text-white selection:bg-indigo-500/30">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(99,102,241,.13),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(14,165,233,.08),transparent_28%)]" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080a0f]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-400/20 bg-indigo-500/10">
              <Shield className="h-4 w-4 text-indigo-300" />
            </div>

            <div>
              <div className="text-sm font-semibold tracking-wide">
                SENTINEL
              </div>
              <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-slate-500">
                Review Workspace v2
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/docs"
              className="hidden px-3 py-2 text-xs text-slate-400 hover:text-white sm:block"
            >
              Docs
            </Link>

            <button
              type="button"
              onClick={downloadReport}
              disabled={!result}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300 transition hover:border-white/20 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>

            <button
              type="button"
              onClick={analyze}
              disabled={loading || !code.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Analyze
            </button>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-[1800px] p-4 lg:p-6">
        <section className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20">
            <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              Static security analysis
            </div>

            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Find. Understand. Remediate.
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              A synchronized security workspace connecting source lines,
              findings, risk analytics, remediation, and conversational AI.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 lg:min-w-[420px]">
            <Metric
              label="Risk"
              value={result ? String(result.riskScore) : "—"}
              tone={
                result ? riskTone(result.riskScore) : "text-slate-500"
              }
            />

            <Metric
              label="Grade"
              value={result?.securityGrade || "—"}
              tone="text-indigo-300"
            />

            <Metric
              label="Findings"
              value={result ? String(riskSummary.total) : "—"}
              tone="text-white"
            />
          </div>
        </section>

        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>{error}</div>
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(380px,.8fr)_minmax(320px,.62fr)]">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c0f15] shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.025] px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <FileCode2 className="h-4 w-4 text-indigo-300" />
                Source
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="rounded-md border border-white/10 bg-black/30 px-2 py-1.5 font-mono text-[10px] text-slate-300 outline-none"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="go">Go</option>
                </select>

                <span className="hidden rounded-md border border-white/10 px-2 py-1 font-mono text-[9px] text-slate-500 sm:block">
                  {result?.scannedLines ?? code.split("\n").length} lines
                </span>
              </div>
            </div>

            <div className="relative">
              <textarea
                ref={codeRef}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                spellCheck={false}
                className="min-h-[680px] w-full resize-none bg-[#090c11] p-5 font-mono text-[12px] leading-6 text-slate-200 outline-none placeholder:text-slate-700"
                placeholder="Paste source code to analyze..."
              />

              <div className="pointer-events-none absolute bottom-3 right-3 rounded-md border border-white/10 bg-black/50 px-2 py-1 font-mono text-[9px] text-slate-600">
                SENTINEL INPUT
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c0f15] shadow-2xl shadow-black/20">
            <div className="border-b border-white/10 bg-white/[0.025] p-3">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold">Findings</div>
                  <div className="font-mono text-[9px] text-slate-500">
                    {result
                      ? `${riskSummary.blocking} blocking • ${riskSummary.confidence}% avg confidence`
                      : "Awaiting analysis"}
                  </div>
                </div>

                <Filter className="h-4 w-4 text-slate-500" />
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {(["all", ...severityOrder] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    className={`shrink-0 rounded-md border px-2 py-1.5 font-mono text-[9px] uppercase transition ${
                      filter === value
                        ? "border-indigo-400/30 bg-indigo-500/15 text-indigo-200"
                        : "border-white/10 bg-white/[0.02] text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[680px] overflow-y-auto p-2">
              {!result && (
                <EmptyState
                  icon={<Target className="h-7 w-7" />}
                  title="No analysis yet"
                  text="Run Sentinel to build the synchronized finding map."
                />
              )}

              {result && findings.length === 0 && (
                <EmptyState
                  icon={<CheckCircle2 className="h-7 w-7 text-emerald-400" />}
                  title="No findings detected"
                  text="The analyzer returned a clean result for this input."
                />
              )}

              {result &&
                findings.length > 0 &&
                filteredFindings.length === 0 && (
                  <EmptyState
                    icon={<Filter className="h-7 w-7" />}
                    title="No matching findings"
                    text="Change the severity filter to inspect other results."
                  />
                )}

              <div className="space-y-2">
                {filteredFindings.map((finding) => {
                  const severity = normalizeSeverity(finding.severity);
                  const meta = severityMeta[severity];
                  const selected = selectedId === finding.id;
                  const expanded = expandedId === finding.id;

                  return (
                    <article
                      key={finding.id}
                      className={`overflow-hidden rounded-xl border transition ${
                        selected
                          ? "border-indigo-400/30 bg-indigo-500/[0.07]"
                          : "border-white/10 bg-white/[0.02] hover:border-white/15"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => selectFinding(finding)}
                        className="w-full p-3 text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-1 h-2 w-2 shrink-0 rounded-full ${meta.dot}`}
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="text-xs font-semibold leading-5 text-slate-100">
                                {finding.title}
                              </div>

                              <span
                                className={`shrink-0 rounded-md border px-1.5 py-0.5 font-mono text-[8px] uppercase ${meta.tone}`}
                              >
                                {meta.label}
                              </span>
                            </div>

                            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[9px] text-slate-500">
                              <span>L{finding.line}</span>
                              <span>{finding.cwe || "CWE—"}</span>
                              <span>{finding.owasp || "OWASP—"}</span>
                              <span>
                                {Number(finding.confidence || 0)}%
                              </span>
                            </div>
                          </div>

                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(event) => {
                              event.stopPropagation();
                              setExpandedId(
                                expanded ? null : finding.id,
                              );
                            }}
                            onKeyDown={(event) => {
                              if (
                                event.key === "Enter" ||
                                event.key === " "
                              ) {
                                event.preventDefault();
                                event.stopPropagation();
                                setExpandedId(
                                  expanded ? null : finding.id,
                                );
                              }
                            }}
                            className="rounded-md p-1 text-slate-500 hover:bg-white/5 hover:text-white"
                          >
                            {expanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </span>
                        </div>
                      </button>

                      {expanded && (
                        <div className="border-t border-white/10 p-3">
                          <FindingDetail finding={finding} />
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-white/10 bg-[#0c0f15] p-4 shadow-2xl shadow-black/20">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Bot className="h-4 w-4 text-violet-300" />
                    AI remediation
                  </div>

                  <div className="mt-1 font-mono text-[9px] text-slate-500">
                    Finding-focused guidance
                  </div>
                </div>

                {selectedFinding && (
                  <button
                    type="button"
                    onClick={copyFinding}
                    className="rounded-md border border-white/10 p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Clipboard className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>

              {!selectedFinding ? (
                <div className="rounded-xl border border-dashed border-white/10 p-5 text-center">
                  <MessageSquare className="mx-auto mb-2 h-5 w-5 text-slate-600" />
                  <p className="text-xs text-slate-500">
                    Select a finding to unlock AI guidance.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-3 rounded-xl border border-indigo-400/15 bg-indigo-500/[0.06] p-3">
                    <div className="font-mono text-[9px] uppercase tracking-wider text-indigo-300">
                      Selected
                    </div>

                    <div className="mt-1 text-sm font-semibold text-slate-100">
                      {selectedFinding.title}
                    </div>

                    <div className="mt-1 font-mono text-[9px] text-slate-500">
                      line {selectedFinding.line} • {selectedFinding.cwe}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <AIButton
                      label="Explain this finding"
                      onClick={() => askAI("explain")}
                    />

                    <AIButton
                      label="Build full remediation plan"
                      onClick={() => askAI("remediation")}
                    />

                    <AIButton
                      label="Show secure replacement"
                      onClick={() => askAI("secure_fix")}
                    />

                    <AIButton
                      label="Explain attack path"
                      onClick={() => askAI("attack_path")}
                    />
                  </div>

                  <div className="mt-3 min-h-[190px] rounded-xl border border-white/10 bg-black/20 p-3">
                    {aiLoading ? (
                      <div className="flex h-[180px] flex-col items-center justify-center gap-2 text-slate-500">
                        <Loader2 className="h-5 w-5 animate-spin text-indigo-300" />
                        <span className="font-mono text-[9px] uppercase tracking-wider">
                          Generating guidance
                        </span>
                      </div>
                    ) : aiAnswer ? (
                      <div className="whitespace-pre-wrap text-xs leading-6 text-slate-300">
                        {aiAnswer}
                      </div>
                    ) : (
                      <div className="flex h-[180px] flex-col items-center justify-center text-center">
                        <Sparkles className="mb-2 h-5 w-5 text-slate-600" />
                        <p className="text-xs text-slate-500">
                          Ask Sentinel to explain the issue or produce a
                          complete remediation path.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#0c0f15] p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold">
                <ShieldAlert className="h-4 w-4 text-amber-300" />
                Executive risk
              </div>

              <div className="grid grid-cols-2 gap-2">
                <RiskStat label="Critical" value={result?.counts.critical ?? 0} />
                <RiskStat label="High" value={result?.counts.high ?? 0} />
                <RiskStat label="Medium" value={result?.counts.medium ?? 0} />
                <RiskStat label="Low" value={result?.counts.low ?? 0} />
              </div>

              {result && (
                <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between font-mono text-[9px] text-slate-500">
                    <span>ENGINE</span>
                    <span className="text-slate-300">
                      {result.engine || "Sentinel"}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between font-mono text-[9px] text-slate-500">
                    <span>LANGUAGE</span>
                    <span className="text-slate-300">
                      {result.language || language}
                    </span>
                  </div>
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className={`mt-2 text-2xl font-semibold ${tone}`}>
        {value}
      </div>
    </div>
  );
}

function RiskStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="font-mono text-[9px] uppercase text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold text-slate-100">
        {value}
      </div>
    </div>
  );
}

function AIButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.025] px-3 py-3 text-left text-xs text-slate-300 transition hover:border-indigo-400/25 hover:bg-indigo-500/[0.06] hover:text-white"
    >
      <span>{label}</span>
      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
    </button>
  );
}

function EmptyState({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-slate-500">
        {icon}
      </div>

      <div className="text-sm font-semibold text-slate-300">
        {title}
      </div>

      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-600">
        {text}
      </p>
    </div>
  );
}

function FindingDetail({
  finding,
}: {
  finding: Finding;
}) {
  const secure = finding.secureExample?.trim();

  return (
    <div className="space-y-3">
      <DetailBlock
        label="Description"
        value={finding.description}
      />

      <DetailBlock
        label="Impact"
        value={finding.impact}
      />

      <DetailBlock
        label="Attack scenario"
        value={finding.attackScenario}
      />

      <DetailBlock
        label="Remediation"
        value={finding.remediation}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <CodeCard
          title="Vulnerable evidence"
          code={finding.evidence}
        />

        <CodeCard
          title={secure ? "Secure replacement" : "Remediation target"}
          code={secure || finding.remediation}
        />
      </div>
    </div>
  );
}

function DetailBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="mb-1 font-mono text-[9px] uppercase tracking-wider text-slate-600">
        {label}
      </div>

      <p className="text-xs leading-5 text-slate-400">
        {value || "Not provided by analyzer."}
      </p>
    </div>
  );
}

function CodeCard({
  title,
  code,
}: {
  title: string;
  code: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-black/25">
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2 font-mono text-[9px] uppercase text-slate-600">
        <Code2 className="h-3 w-3" />
        {title}
      </div>

      <pre className="max-h-44 overflow-auto p-3 font-mono text-[10px] leading-5 text-slate-400">
        {code}
      </pre>
    </div>
  );
}
