#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="/workspaces/a/saifrvw"
cd "$ROOT"

echo "============================================================"
echo " SAIFRVW — RECOVERY + RUNTIME FIX"
echo "============================================================"

# ── STEP 1: RESTORE WORKING DEPENDENCIES ─────────────────────
echo
echo "[1/6] Restoring dependency versions..."

# Revert package.json to known working versions
node -e '
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

// Restore working versions
pkg.dependencies.next = "14.2.35";
pkg.devDependencies["eslint-config-next"] = "14.2.35";

// Remove vercel from devDependencies (keep it global or install separately if needed)
delete pkg.devDependencies.vercel;

// Ensure lucide-react is in dependencies
if (!pkg.dependencies["lucide-react"]) {
  pkg.dependencies["lucide-react"] = "^0.400.0";
}

fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
console.log("✓ package.json restored");
'

# Clean install
rm -rf node_modules package-lock.json
npm install

echo "✓ Dependencies restored"

# ── STEP 2: VERIFY SOURCE FILES ──────────────────────────────
echo
echo "[2/6] Verifying source files..."

REQUIRED=(
  "src/lib/security-engine.ts"
  "src/lib/report-engine.ts"
  "src/lib/ai-assistant.ts"
  "src/app/api/analyze/route.ts"
  "src/app/api/ai/route.ts"
  "src/app/api/report/route.ts"
  "src/components/SecurityReport.tsx"
  "src/components/AICompanion.tsx"
  "src/app/review/page.tsx"
  "src/app/docs/page.tsx"
  "src/app/pricing/page.tsx"
)

for f in "${REQUIRED[@]}"; do
  if [ ! -f "$f" ]; then
    echo "MISSING: $f"
    exit 1
  fi
done
echo "✓ All required files present"

# ── STEP 3: FIX RUNTIME CRASH — DEFENSIVE REVIEW PAGE ────────
echo
echo "[3/6] Fixing runtime crash in review page..."

cat > src/app/review/page.tsx <<'REVIEW_EOF'
"use client";

import { useState } from "react";
import AICompanion from "@/components/AICompanion";
import SecurityReport from "@/components/SecurityReport";

const sample = `const express = require("express");
const app = express();

app.get("/user", async (req, res) => {
  const id = req.query.id;
  const result = await db.query("SELECT * FROM users WHERE id = " + id);
  res.json(result);
});`;

export default function ReviewPage() {
  const [code, setCode] = useState(sample);
  const [language, setLanguage] = useState("javascript");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      // Validate the response shape before setting state
      if (!data || typeof data !== "object") {
        throw new Error("Invalid response from analyzer");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      console.error("Analysis error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#08080d] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400">
            SENTINEL ENGINE v4
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">
            Deep Security Review
          </h1>
          <p className="mt-3 max-w-3xl text-slate-400">
            Detect security-sensitive patterns, map findings to CWE and OWASP,
            prioritize risk, and generate actionable remediation guidance.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          {/* Input Panel */}
          <section className="rounded-2xl border border-white/10 bg-[#11111a] p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="php">PHP</option>
                <option value="go">Go</option>
                <option value="ruby">Ruby</option>
                <option value="auto">Auto</option>
              </select>

              <button
                onClick={analyze}
                disabled={loading}
                className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-black hover:bg-indigo-400 disabled:opacity-50"
              >
                {loading ? "Analyzing..." : "Run Deep Analysis"}
              </button>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="min-h-[520px] w-full resize-y rounded-xl border border-white/10 bg-[#08080d] p-4 font-mono text-sm leading-6 text-slate-200 outline-none focus:border-indigo-500/50"
            />
          </section>

          {/* Results Panel */}
          <div className="space-y-6">
            {!result && !error && !loading && (
              <section className="rounded-2xl border border-white/10 bg-[#11111a] p-6">
                <p className="text-sm leading-7 text-slate-400">
                  Paste source code and run the analyzer. SAIFRVW will return
                  severity, confidence, line location, category, CWE, OWASP
                  mapping, evidence, impact and remediation guidance.
                </p>
              </section>
            )}

            {loading && (
              <section className="rounded-2xl border border-white/10 bg-[#11111a] p-6 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                <p className="mt-4 text-sm text-slate-400">Analyzing...</p>
              </section>
            )}

            {error && (
              <section className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
                <p className="text-sm font-bold text-red-300">Analysis Error</p>
                <p className="mt-2 text-sm text-red-200">{error}</p>
              </section>
            )}

            {result && !error && (
              <>
                <SecurityReport result={result} />

                {/* Findings List */}
                <section className="rounded-2xl border border-white/10 bg-[#11111a] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                        Findings
                      </p>
                      <h2 className="mt-1 text-xl font-black">
                        {Array.isArray(result.findings) ? result.findings.length : 0} security signal(s)
                      </h2>
                    </div>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">
                      {result.scannedLines || 0} lines
                    </span>
                  </div>

                  <div className="mt-5 space-y-4">
                    {Array.isArray(result.findings) && result.findings.map((finding: any, i: number) => (
                      <article
                        key={`${finding?.id || i}-${finding?.line || i}`}
                        className="rounded-xl border border-white/10 bg-black/20 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-bold">{finding?.title || "Unknown finding"}</h3>
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-bold uppercase ${
                            finding?.severity === "critical" ? "border-red-500/20 bg-red-500/10 text-red-300" :
                            finding?.severity === "high" ? "border-orange-500/20 bg-orange-500/10 text-orange-300" :
                            finding?.severity === "medium" ? "border-amber-500/20 bg-amber-500/10 text-amber-300" :
                            "border-blue-500/20 bg-blue-500/10 text-blue-300"
                          }`}>
                            {finding?.severity || "info"}
                          </span>
                        </div>

                        <div className="mt-2 text-xs text-slate-500">
                          Line {finding?.line || "?"} · {finding?.category || "General"} · {finding?.cwe || "N/A"}
                          {finding?.confidence ? ` · ${finding.confidence}% confidence` : ""}
                        </div>

                        {finding?.description && (
                          <p className="mt-3 text-sm leading-6 text-slate-300">
                            {finding.description}
                          </p>
                        )}

                        {finding?.impact && (
                          <div className="mt-3 rounded-lg bg-red-500/5 p-3">
                            <p className="text-xs font-bold uppercase tracking-widest text-red-300">Impact</p>
                            <p className="mt-1 text-sm leading-6 text-slate-400">{finding.impact}</p>
                          </div>
                        )}

                        {finding?.remediation && (
                          <div className="mt-3 rounded-lg bg-emerald-500/5 p-3">
                            <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Remediation</p>
                            <p className="mt-1 text-sm leading-6 text-slate-300">{finding.remediation}</p>
                          </div>
                        )}

                        {finding?.secureExample && (
                          <pre className="mt-3 overflow-x-auto rounded-lg bg-black/40 p-3 text-xs text-emerald-300">
                            {finding.secureExample}
                          </pre>
                        )}
                      </article>
                    ))}

                    {(!Array.isArray(result.findings) || result.findings.length === 0) && (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                        <p className="font-bold text-emerald-300">
                          No matching security findings detected.
                        </p>
                        <p className="mt-2 text-sm text-slate-400">
                          This is not proof that the application is secure.
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                <AICompanion findings={Array.isArray(result.findings) ? result.findings : []} />
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
REVIEW_EOF

echo "✓ Review page fixed with defensive rendering"

# ── STEP 4: FIX SECURITY REPORT COMPONENT ────────────────────
echo
echo "[4/6] Fixing SecurityReport component..."

cat > src/components/SecurityReport.tsx <<'REPORT_UI_EOF'
"use client";

interface SecurityReportProps {
  result: any;
}

export default function SecurityReport({ result }: SecurityReportProps) {
  if (!result) return null;

  // Defensive access to all properties
  const counts = result?.counts || {};
  const riskScore = typeof result?.riskScore === "number" ? result.riskScore : 0;
  const securityGrade = result?.securityGrade || "N/A";
  const scannedLines = result?.scannedLines || 0;

  function download() {
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `saifrvw-security-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#11111a] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            Security Report
          </p>
          <h2 className="mt-1 text-xl font-bold text-white">
            {securityGrade} Grade
          </h2>
        </div>
        <button
          onClick={download}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/5"
        >
          Export JSON
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Critical", counts.critical || 0],
          ["High", counts.high || 0],
          ["Medium", counts.medium || 0],
          ["Low", counts.low || 0],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-white/10 bg-black/20 p-4"
          >
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-black text-white">{value as number}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl bg-black/20 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Risk score</span>
          <strong className="text-white">{riskScore}/100</strong>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-indigo-500"
            style={{ width: `${Math.min(100, riskScore)}%` }}
          />
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-500">
        {scannedLines} lines scanned
      </div>
    </section>
  );
}
REPORT_UI_EOF

echo "✓ SecurityReport component fixed"

# ── STEP 5: VALIDATION ───────────────────────────────────────
echo
echo "[5/6] Running validation..."

echo "--- TypeScript ---"
./node_modules/.bin/tsc --noEmit || { echo "TypeScript FAILED"; exit 1; }
echo "✓ TypeScript PASSED"

echo
echo "--- ESLint ---"
npm run lint || { echo "ESLint FAILED"; exit 1; }
echo "✓ ESLint PASSED"

echo
echo "--- Production Build ---"
rm -rf .next
npm run build || { echo "Build FAILED"; exit 1; }
echo "✓ Build PASSED"

# ── STEP 6: RESULTS ──────────────────────────────────────────
echo
echo "============================================================"
echo " SAIFRVW — RECOVERY COMPLETE"
echo "============================================================"
echo
echo "Dependencies:"
echo "  Next.js: $(node -p 'require(\"next/package.json\").version')"
echo "  ESLint: $(node -p 'require(\"eslint/package.json\").version')"
echo "  TypeScript: $(node -p 'require(\"typescript/package.json\").version')"
echo
echo "Validation:"
echo "  ✓ TypeScript"
echo "  ✓ ESLint"
echo "  ✓ Production build"
echo
echo "Runtime fixes:"
echo "  ✓ Defensive property access in review page"
echo "  ✓ Error boundary for API failures"
echo "  ✓ Null-safe finding rendering"
echo "  ✓ Loading states"
echo
echo "DEPLOY: ./node_modules/.bin/vercel deploy --prod --yes"
echo "============================================================"
