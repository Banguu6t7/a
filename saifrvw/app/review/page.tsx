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
