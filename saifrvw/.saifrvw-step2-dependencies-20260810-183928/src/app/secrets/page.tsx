"use client";

import { useMemo, useState } from "react";

type Finding = {
  type: string;
  severity: "critical" | "high" | "medium";
  line: number;
  column: number;
  masked: string;
  description: string;
  remediation: string;
};

type ScanResponse = {
  ok: boolean;
  error?: string;
  findings?: Finding[];
  summary?: {
    total: number;
    critical: number;
    high: number;
    medium: number;
  };
};

const DEMO = `const AWS_ACCESS_KEY_ID = "AKIAEXAMPLE12345678";
const API_KEY = "test_example_secret_123456";
const token = "eyJhbGciOiJIUzI1NiJ9.demo.signature";`;

export default function SecretsPage() {
  const [code, setCode] = useState("");
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const summary = useMemo(
    () => ({
      total: findings.length,
      critical: findings.filter((x) => x.severity === "critical").length,
      high: findings.filter((x) => x.severity === "high").length,
      medium: findings.filter((x) => x.severity === "medium").length,
    }),
    [findings],
  );

  async function scan() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/scan/secrets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = (await response.json()) as ScanResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Secret scan failed.");
      }

      setFindings(data.findings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Secret scan failed.");
    } finally {
      setLoading(false);
    }
  }

  function loadDemo() {
    setCode(DEMO);
    setFindings([]);
    setError("");
  }

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-cyan-400">
            SAIFRVW SENTINEL
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            Secret Scanner
          </h1>

          <p className="mt-3 max-w-2xl text-white/60">
            Detect likely hard-coded credentials, tokens, private keys and API
            secrets before they reach production.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Source</h2>

              <button
                type="button"
                onClick={loadDemo}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/10"
              >
                Load safe demo
              </button>
            </div>

            <textarea
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Paste source code here..."
              spellCheck={false}
              className="min-h-[420px] w-full resize-y rounded-xl border border-white/10 bg-black/50 p-4 font-mono text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-400/50"
            />

            <button
              type="button"
              onClick={scan}
              disabled={loading || !code.trim()}
              className="mt-4 w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Scanning..." : "Scan for secrets"}
            </button>

            {error ? (
              <p className="mt-3 text-sm text-red-400">{error}</p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="grid grid-cols-4 gap-2">
              <Stat label="Total" value={summary.total} />
              <Stat label="Critical" value={summary.critical} />
              <Stat label="High" value={summary.high} />
              <Stat label="Medium" value={summary.medium} />
            </div>

            <div className="mt-5 space-y-3">
              {findings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-white/40">
                  No findings yet. Run a scan to inspect the source.
                </div>
              ) : (
                findings.map((finding, index) => (
                  <article
                    key={`${finding.type}-${finding.line}-${index}`}
                    className="rounded-xl border border-white/10 bg-black/30 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold">{finding.type}</h3>

                      <span className="rounded-full border border-white/10 px-2 py-1 text-xs uppercase text-white/60">
                        {finding.severity}
                      </span>
                    </div>

                    <p className="mt-2 font-mono text-xs text-cyan-300">
                      Line {finding.line}, column {finding.column}
                    </p>

                    <p className="mt-3 text-sm text-white/60">
                      {finding.description}
                    </p>

                    <p className="mt-3 font-mono text-xs text-white/50">
                      {finding.masked}
                    </p>

                    <p className="mt-3 text-sm text-white/70">
                      <span className="font-semibold text-white">
                        Remediation:
                      </span>{" "}
                      {finding.remediation}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-center">
      <div className="text-xl font-bold">{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-white/40">
        {label}
      </div>
    </div>
  );
}
