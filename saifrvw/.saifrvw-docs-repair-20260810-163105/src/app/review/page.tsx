"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Copy,
  Download,
  FileCode2,
  Loader2,
  Shield,
  ShieldAlert,
  Sparkles,
  Terminal,
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

export default function ReviewPage() {
  const [code, setCode] = useState(demo);
  const [language, setLanguage] = useState("javascript");

  const [result, setResult] = useState<Analysis | null>(null);
  const [selected, setSelected] = useState<Finding | null>(null);

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState("");
  const [error, setError] = useState("");

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

      const data = (await response.json()) as Partial<AnalyzeResponse>;

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed.");
      }

      if (
        !data.analysis ||
        !Array.isArray(data.analysis.findings)
      ) {
        throw new Error("Analyzer returned an invalid response.");
      }

      setResult(data.analysis);
      setSelected(data.analysis.findings[0] ?? null);
    } catch (err) {
      setResult(null);
      setSelected(null);

      setError(
        err instanceof Error
          ? err.message
          : "Analysis failed."
      );
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
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message:
            `${action}\n\n` +
            `Finding: ${selected.title}\n` +
            `Description: ${selected.description}\n` +
            `Evidence: ${selected.evidence}\n` +
            `Remediation: ${selected.remediation}`,
          code,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI request failed.");
      }

      setAiAnswer(
        typeof data.answer === "string"
          ? data.answer
          : "The AI assistant returned no answer."
      );
    } catch (err) {
      setAiAnswer(
        err instanceof Error
          ? err.message
          : "AI assistant unavailable."
      );
    } finally {
      setAiLoading(false);
    }
  }

  const report = useMemo(() => {
    if (!result) return "";

    return JSON.stringify(
      {
        product: "SAIFRVW",
        engine: result.engine || "SENTINEL ENGINE",
        generatedAt: new Date().toISOString(),
        language: result.language || language,
        riskScore: result.riskScore,
        securityGrade: result.securityGrade,
        counts: result.counts,
        scannedLines: result.scannedLines,
        findings: result.findings,
      },
      null,
      2
    );
  }, [result, language]);

  function downloadReport() {
    if (!report) return;

    const blob = new Blob([report], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "saifrvw-security-report.json";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  }

  async function copyFinding() {
    if (!selected) return;

    await navigator.clipboard.writeText(
      `${selected.title}\n\n${selected.description}\n\nRemediation:\n${selected.remediation}`
    );
  }

  return (
    <main className="min-h-screen bg-[#08080d] text-white">
      <header className="border-b border-white/10 bg-[#0b0b11]/90">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            SAIFRVW
          </Link>

          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-400" />
            <span className="font-bold">SENTINEL</span>
            <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] text-indigo-300">
              v5.1
            </span>
          </div>

          <Link
            href="/pricing"
            className="text-sm text-gray-400 hover:text-white"
          >
            Pricing
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-5 py-7">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-indigo-400">
              <Sparkles className="h-4 w-4" />
              Deep Static Analysis
            </div>

            <h1 className="text-3xl font-bold">
              Security Code Analyzer
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Detect vulnerabilities. Understand the risk. Fix them faster.
            </p>
          </div>

          <div className="flex gap-2">
            {result && (
              <button
                onClick={downloadReport}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
              >
                <Download className="h-4 w-4" />
                Report
              </button>
            )}

            <button
              onClick={analyze}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-5 py-2 text-sm font-semibold hover:bg-indigo-600 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldAlert className="h-4 w-4" />
              )}

              {loading ? "Scanning..." : "Run Deep Scan"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {result && (
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
            <Metric
              label="Risk Score"
              value={`${result.riskScore}/100`}
            />

            <Metric
              label="Grade"
              value={result.securityGrade}
            />

            <Metric
              label="Critical"
              value={String(result.counts.critical)}
            />

            <Metric
              label="High"
              value={String(result.counts.high)}
            />

            <Metric
              label="Findings"
              value={String(result.findings.length)}
            />
          </div>
        )}

        <div className="grid gap-5 xl:grid-cols-[1.1fr_1fr_0.8fr]">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#101017]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <FileCode2 className="h-4 w-4 text-indigo-400" />
                Source
              </div>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-gray-300 outline-none"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="php">PHP</option>
                <option value="go">Go</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="min-h-[560px] w-full resize-none bg-[#0b0b10] p-5 font-mono text-sm leading-6 text-gray-200 outline-none"
            />
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#101017]">
            <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold">
              Findings
            </div>

            <div className="max-h-[620px] overflow-y-auto p-3">
              {!result && (
                <div className="flex min-h-[520px] flex-col items-center justify-center text-center text-gray-500">
                  <Terminal className="mb-4 h-8 w-8" />
                  <p className="text-sm">
                    Run a scan to see security findings.
                  </p>
                </div>
              )}

              {result && result.findings.length === 0 && (
                <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
                  <CheckCircle2 className="mb-4 h-10 w-10 text-emerald-400" />
                  <p className="font-semibold">
                    No matching vulnerabilities detected.
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Sentinel found no issues covered by its current rules.
                  </p>
                </div>
              )}

              {result?.findings.map((finding) => (
                <button
                  key={`${finding.id}-${finding.line}`}
                  onClick={() => setSelected(finding)}
                  className={`mb-2 w-full rounded-xl border p-4 text-left transition ${
                    selected?.id === finding.id &&
                    selected?.line === finding.line
                      ? "border-indigo-500/50 bg-indigo-500/10"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500">
                        {finding.id} · Line {finding.line}
                      </div>

                      <div className="mt-1 font-semibold">
                        {finding.title}
                      </div>
                    </div>

                    <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase">
                      {finding.severity}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
                    {finding.description}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#101017]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Bot className="h-4 w-4 text-indigo-400" />
                Sentinel Assistant
              </div>

              {selected && (
                <button
                  onClick={copyFinding}
                  className="rounded-lg p-2 text-gray-500 hover:bg-white/5 hover:text-white"
                  title="Copy finding"
                >
                  <Copy className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="p-4">
              {!selected && (
                <div className="py-16 text-center text-sm text-gray-500">
                  Select a finding to inspect and remediate it.
                </div>
              )}

              {selected && (
                <>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs uppercase tracking-wider text-gray-500">
                      Selected finding
                    </div>

                    <h2 className="mt-2 text-lg font-semibold">
                      {selected.title}
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-gray-400">
                      {selected.description}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <Info label="Severity" value={selected.severity} />
                      <Info label="Confidence" value={`${selected.confidence}%`} />
                      <Info label="CWE" value={selected.cwe} />
                      <Info label="OWASP" value={selected.owasp} />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2">
                    <button
                      onClick={() => askAI("Explain this vulnerability")}
                      disabled={aiLoading}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm hover:bg-white/10 disabled:opacity-50"
                    >
                      Explain this vulnerability
                    </button>

                    <button
                      onClick={() => askAI("Show me how to fix this vulnerability")}
                      disabled={aiLoading}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm hover:bg-white/10 disabled:opacity-50"
                    >
                      Show me how to fix it
                    </button>

                    <button
                      onClick={() => askAI("Explain the attack scenario")}
                      disabled={aiLoading}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm hover:bg-white/10 disabled:opacity-50"
                    >
                      Explain attack scenario
                    </button>
                  </div>

                  {aiLoading && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-sm text-indigo-300">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sentinel is analyzing...
                    </div>
                  )}

                  {aiAnswer && !aiLoading && (
                    <div className="mt-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-300">
                        Assistant
                      </div>

                      <p className="whitespace-pre-wrap text-sm leading-6 text-gray-300">
                        {aiAnswer}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-xs uppercase tracking-wider text-gray-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold">
        {value}
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <div className="text-[10px] uppercase text-gray-500">
        {label}
      </div>
      <div className="mt-1 truncate text-gray-300">
        {value}
      </div>
    </div>
  );
}
