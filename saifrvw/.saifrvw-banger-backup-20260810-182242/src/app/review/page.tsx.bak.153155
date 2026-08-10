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

type Result = {
  findings: Finding[];
  risk: {
    score: number;
    grade: string;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  summary: {
    totalFindings: number;
    status: string;
  };
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
  const [result, setResult] = useState<Result | null>(null);
  const [selected, setSelected] = useState<Finding | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState("");

  async function analyze() {
    setLoading(true);
    setAiAnswer("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, language }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed.");
      }

      setResult(data);
      setSelected(data.findings?.[0] || null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Analysis failed.");
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI request failed.");
      }

      setAiAnswer(data.answer);
    } catch (error) {
      setAiAnswer(
        error instanceof Error ? error.message : "AI assistant unavailable."
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
        engine: "SENTINEL ENGINE v4",
        generatedAt: new Date().toISOString(),
        risk: result.risk,
        summary: result.summary,
        findings: result.findings,
      },
      null,
      2
    );
  }, [result]);

  function downloadReport() {
    const blob = new Blob([report], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "saifrvw-security-report.json";
    a.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#08080d] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0b12]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5">
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
              v4
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

        {result && (
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
            <Metric
              label="Risk Score"
              value={`${result.risk.score}/100`}
            />
            <Metric label="Grade" value={result.risk.grade} />
            <Metric
              label="Critical"
              value={String(result.risk.critical)}
            />
            <Metric label="High" value={String(result.risk.high)} />
            <Metric
              label="Findings"
              value={String(result.summary.totalFindings)}
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
                className="rounded-md border border-white/10 bg-[#181821] px-2 py-1.5 text-xs"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="php">PHP</option>
                <option value="go">Go</option>
              </select>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="min-h-[650px] w-full resize-none bg-[#09090e] p-5 font-mono text-[13px] leading-6 text-gray-300 outline-none"
            />
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#101017]">
            <div className="border-b border-white/10 px-4 py-3">
              <h2 className="text-sm font-semibold">Security Findings</h2>
            </div>

            <div className="max-h-[690px] overflow-y-auto p-3">
              {!result && (
                <div className="flex min-h-[550px] flex-col items-center justify-center px-8 text-center">
                  <Terminal className="mb-4 h-10 w-10 text-gray-600" />
                  <p className="font-semibold">No scan yet</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Run a deep scan to inspect the source.
                  </p>
                </div>
              )}

              {result && result.findings.length === 0 && (
                <div className="flex min-h-[550px] flex-col items-center justify-center text-center">
                  <CheckCircle2 className="mb-4 h-12 w-12 text-emerald-400" />
                  <p className="font-semibold">No known issues detected</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Static analysis found no matching security rules.
                  </p>
                </div>
              )}

              {result?.findings.map((finding) => (
                <button
                  key={finding.id}
                  onClick={() => {
                    setSelected(finding);
                    setAiAnswer("");
                  }}
                  className={`mb-2 w-full rounded-xl border p-4 text-left transition ${
                    selected?.id === finding.id
                      ? "border-indigo-500/50 bg-indigo-500/10"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold">
                      {finding.title}
                    </span>

                    <Severity severity={finding.severity} />
                  </div>

                  <div className="mt-2 flex gap-3 text-[11px] text-gray-500">
                    <span>{finding.id}</span>
                    <span>Line {finding.line}</span>
                    <span>{finding.confidence}% confidence</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#101017]">
            <div className="border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-indigo-400" />
                <h2 className="text-sm font-semibold">
                  AI Security Assistant
                </h2>
              </div>
            </div>

            {!selected ? (
              <div className="flex min-h-[550px] items-center justify-center p-8 text-center text-sm text-gray-600">
                Select a finding to activate AI assistance.
              </div>
            ) : (
              <div className="p-4">
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <Severity severity={selected.severity} />

                  <h3 className="mt-3 font-semibold">
                    {selected.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-400">
                    {selected.description}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <Info label="CWE" value={selected.cwe} />
                    <Info label="OWASP" value={selected.owasp} />
                    <Info label="Line" value={String(selected.line)} />
                    <Info
                      label="Confidence"
                      value={`${selected.confidence}%`}
                    />
                  </div>
                </div>

                <div className="mt-4 grid gap-2">
                  <AIButton
                    onClick={() => askAI("explain")}
                    icon={<Bot />}
                    text="Explain vulnerability"
                  />

                  <AIButton
                    onClick={() => askAI("fix")}
                    icon={<Sparkles />}
                    text="Generate remediation"
                  />

                  <AIButton
                    onClick={() => askAI("secure")}
                    icon={<Shield />}
                    text="Show secure replacement"
                  />

                  <AIButton
                    onClick={() => askAI("prioritize")}
                    icon={<ShieldAlert />}
                    text="Should I fix this first?"
                  />
                </div>

                {aiLoading && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-sm text-indigo-300">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Security assistant thinking...
                  </div>
                )}

                {aiAnswer && !aiLoading && (
                  <div className="mt-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-indigo-300">
                        SENTINEL AI
                      </span>

                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(aiAnswer)
                        }
                        className="text-gray-500 hover:text-white"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <p className="whitespace-pre-wrap text-sm leading-6 text-gray-300">
                      {aiAnswer}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#101017] p-4">
      <div className="text-[10px] uppercase tracking-widest text-gray-600">
        {label}
      </div>
      <div className="mt-1 text-xl font-bold">{value}</div>
    </div>
  );
}

function Severity({ severity }: { severity: string }) {
  const cls =
    severity === "critical"
      ? "bg-red-500/10 text-red-400"
      : severity === "high"
        ? "bg-orange-500/10 text-orange-400"
        : severity === "medium"
          ? "bg-yellow-500/10 text-yellow-400"
          : "bg-blue-500/10 text-blue-400";

  return (
    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${cls}`}>
      {severity}
    </span>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-black/20 p-2">
      <div className="text-[9px] uppercase text-gray-600">{label}</div>
      <div className="mt-1 truncate text-gray-300">{value}</div>
    </div>
  );
}

function AIButton({
  onClick,
  icon,
  text,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm transition hover:border-indigo-500/30 hover:bg-indigo-500/5"
    >
      <span className="h-4 w-4 text-indigo-400">{icon}</span>
      {text}
    </button>
  );
}
