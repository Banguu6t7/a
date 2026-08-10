#!/usr/bin/env bash
set -Eeuo pipefail

# ============================================================
# SAIFRVW — SENTINEL ENGINE
# PROFESSIONAL REPAIR + VALIDATION + PRODUCTION DEPLOY
#
# CANONICAL PROJECT:
#   /workspaces/a/saifrvw
#
# VERCEL TARGET:
#   duckx/saifrvw
#
# HARD SAFETY:
#   NEVER touches saifrvuwe
#   NEVER touches Vercel project "a"
#
# BEHAVIOR:
#   1. Verify project
#   2. Verify Vercel target
#   3. Backup suspicious files
#   4. Recover empty page.tsx from Git when possible
#   5. Create a functional SAIFRVW UI if page is missing/empty
#   6. Create analyzer API if missing
#   7. Install dependencies
#   8. Lint/type/build
#   9. Deploy only to duckx/saifrvw
# ============================================================

set +H

ROOT="/workspaces/a"
APP="$ROOT/saifrvw"
TARGET="saifrvw"
TEAM="duckx"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
RESET='\033[0m'

log()  { echo -e "${CYAN}▶${RESET} $*"; }
ok()   { echo -e "${GREEN}✓${RESET} $*"; }
warn() { echo -e "${YELLOW}⚠${RESET} $*"; }
die()  { echo -e "${RED}✗${RESET} $*"; exit 1; }

trap 'echo -e "\n${RED}✗ SAIFRVW repair stopped at line $LINENO${RESET}"' ERR

echo
echo "============================================================"
echo "       SAIFRVW — SENTINEL ENGINE DEPLOYMENT"
echo "============================================================"
echo " Target: $TEAM/$TARGET"
echo " Path:   $APP"
echo "============================================================"
echo

# ------------------------------------------------------------
# 1. HARD PROJECT SAFETY
# ------------------------------------------------------------

[[ "$APP" == "/workspaces/a/saifrvw" ]] \
  || die "Unsafe application path."

[[ -d "$APP" ]] \
  || die "SAIFRVW directory does not exist: $APP"

[[ -f "$APP/package.json" ]] \
  || die "package.json missing."

[[ -f "$APP/next.config.mjs" ]] \
  || die "next.config.mjs missing."

cd "$APP"

ok "Correct SAIFRVW application detected."

# ------------------------------------------------------------
# 2. NEVER TOUCH THE OTHER PROJECTS
# ------------------------------------------------------------

if [[ -d "$ROOT/saifrvuwe" ]]; then
    warn "saifrvuwe exists — leaving it completely untouched."
fi

ok "Project isolation active: saifrvw only."

# ------------------------------------------------------------
# 3. BACKUP CURRENT WORK
# ------------------------------------------------------------

STAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP="$ROOT/.saifrvw-backups/$STAMP"

mkdir -p "$BACKUP"

log "Creating safety backup..."

for f in \
    "src/app/page.tsx" \
    "src/app/globals.css" \
    "src/app/layout.tsx" \
    "src/app/api/analyze/route.ts" \
    "package.json" \
    "next.config.mjs"
do
    if [[ -f "$f" ]]; then
        mkdir -p "$BACKUP/$(dirname "$f")"
        cp -a "$f" "$BACKUP/$f"
    fi
done

ok "Backup created: $BACKUP"

# ------------------------------------------------------------
# 4. INSPECT PAGE
# ------------------------------------------------------------

PAGE="src/app/page.tsx"

PAGE_LINES=0

if [[ -f "$PAGE" ]]; then
    PAGE_LINES="$(wc -l < "$PAGE" | tr -d ' ')"
fi

echo
echo "Page lines: $PAGE_LINES"

# Detect empty/default starter page.
PAGE_NEEDS_REPAIR=0

if [[ ! -f "$PAGE" ]]; then
    PAGE_NEEDS_REPAIR=1
elif [[ "$PAGE_LINES" -lt 8 ]]; then
    PAGE_NEEDS_REPAIR=1
elif grep -Eqi \
    "Get started by editing|Create Next App|Learn Next\.js|nextjs\.org" \
    "$PAGE"; then
    PAGE_NEEDS_REPAIR=1
fi

# ------------------------------------------------------------
# 5. TRY GIT RECOVERY FIRST
# ------------------------------------------------------------

if [[ "$PAGE_NEEDS_REPAIR" == "1" ]]; then

    log "Current page looks missing/empty/default."

    RECOVERED=0

    for COMMIT in $(git log --all --format='%H' -- src/app/page.tsx | head -30); do

        if git cat-file -e "$COMMIT:src/app/page.tsx" 2>/dev/null; then

            CONTENT="$(git show "$COMMIT:src/app/page.tsx" 2>/dev/null || true)"

            LINES="$(printf '%s\n' "$CONTENT" | wc -l | tr -d ' ')"

            if [[ "$LINES" -ge 20 ]] &&
               ! printf '%s\n' "$CONTENT" |
               grep -Eqi "Get started by editing|Create Next App"; then

                log "Found substantive page.tsx in Git history."

                printf '%s\n' "$CONTENT" > "$PAGE"

                ok "Recovered page.tsx from commit:"
                git rev-parse --short "$COMMIT"

                RECOVERED=1
                PAGE_NEEDS_REPAIR=0
                break
            fi
        fi
    done

    if [[ "$RECOVERED" == "0" ]]; then
        warn "No usable historical page found."
        warn "Creating a clean functional SAIFRVW interface."
    fi
fi

# ------------------------------------------------------------
# 6. CREATE PROFESSIONAL SAIFRVW PAGE IF NEEDED
# ------------------------------------------------------------

if [[ "$PAGE_NEEDS_REPAIR" == "1" ]]; then

    log "Creating SAIFRVW Sentinel interface..."

    mkdir -p src/app

    cat > src/app/page.tsx <<'EOF'
"use client";

import { useState } from "react";

type Finding = {
  rule: string;
  severity: "critical" | "high" | "medium" | "low";
  line?: number;
  message: string;
  recommendation: string;
};

type AnalysisResult = {
  score: number;
  findings: Finding[];
  summary: {
    files: number;
    findings: number;
  };
};

const severityClass: Record<string, string> = {
  critical: "border-red-500/30 bg-red-500/10 text-red-300",
  high: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  medium: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  low: "border-blue-500/30 bg-blue-500/10 text-blue-300",
};

export default function Home() {
  const [code, setCode] = useState(
`// Paste code here for SAIFRVW analysis

const user = "admin";
const query = "SELECT * FROM users WHERE name = '" + user + "'";

console.log(query);`
  );

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
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
    <main className="min-h-screen bg-[#07090d] text-white">
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <div className="text-xl font-bold tracking-tight">
              SAIFRVW
            </div>
            <div className="text-xs tracking-[0.25em] text-white/40">
              SENTINEL ENGINE
            </div>
          </div>

          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs text-emerald-300">
            ● ENGINE ONLINE
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Static Security Analysis
          </p>

          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Find vulnerabilities
            <span className="block text-white/40">
              before attackers do.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/50">
            SAIFRVW Sentinel Engine analyzes source code for common security
            weaknesses and produces actionable findings.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <div className="font-semibold">Source Analysis</div>
                <div className="text-xs text-white/40">
                  Paste source code and run Sentinel
                </div>
              </div>

              <button
                onClick={analyze}
                disabled={loading || !code.trim()}
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "Analyzing..." : "Analyze Code"}
              </button>
            </div>

            <textarea
              value={code}
              onChange={(event) => setCode(event.target.value)}
              spellCheck={false}
              className="min-h-[460px] w-full resize-y bg-[#05070a] p-6 font-mono text-sm leading-7 text-white/80 outline-none"
            />

            {error && (
              <div className="border-t border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                {error}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-6">
              <div className="text-sm font-semibold">Security Report</div>
              <div className="text-xs text-white/40">
                Sentinel findings
              </div>
            </div>

            {!result ? (
              <div className="flex min-h-[420px] items-center justify-center text-center">
                <div>
                  <div className="text-5xl font-bold text-white/10">
                    0
                  </div>
                  <p className="mt-3 text-sm text-white/40">
                    Run an analysis to generate findings.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6 rounded-xl border border-white/10 bg-black/20 p-5">
                  <div className="text-xs uppercase tracking-widest text-white/40">
                    Security Score
                  </div>
                  <div className="mt-2 text-5xl font-bold">
                    {result.score}
                    <span className="text-lg text-white/30">/100</span>
                  </div>
                  <div className="mt-2 text-xs text-white/40">
                    {result.summary.findings} finding(s) detected
                  </div>
                </div>

                <div className="space-y-3">
                  {result.findings.length === 0 && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                      No supported vulnerabilities detected.
                    </div>
                  )}

                  {result.findings.map((finding, index) => (
                    <article
                      key={`${finding.rule}-${index}`}
                      className={`rounded-xl border p-4 ${severityClass[finding.severity]}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-semibold">
                          {finding.rule}
                        </span>

                        <span className="text-xs uppercase tracking-widest">
                          {finding.severity}
                        </span>
                      </div>

                      <p className="mt-3 text-sm">
                        {finding.message}
                      </p>

                      <p className="mt-2 text-xs opacity-70">
                        {finding.recommendation}
                      </p>

                      {finding.line && (
                        <div className="mt-3 text-xs opacity-50">
                          Line {finding.line}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-white/30">
        SAIFRVW Sentinel Engine • Static Application Security Analysis
      </footer>
    </main>
  );
}
EOF

    ok "SAIFRVW interface created."
fi

# ------------------------------------------------------------
# 7. CREATE ANALYZER API IF MISSING
# ------------------------------------------------------------

API="src/app/api/analyze/route.ts"

if [[ ! -f "$API" ]]; then

    log "Analyzer API missing — creating Sentinel engine endpoint..."

    mkdir -p "$(dirname "$API")"

    cat > "$API" <<'EOF'
import { NextResponse } from "next/server";

type Finding = {
  rule: string;
  severity: "critical" | "high" | "medium" | "low";
  line?: number;
  message: string;
  recommendation: string;
};

function lineNumber(source: string, index: number) {
  return source.slice(0, index).split("\n").length;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = typeof body.code === "string" ? body.code : "";

    if (!code.trim()) {
      return NextResponse.json(
        { error: "No source code supplied." },
        { status: 400 }
      );
    }

    const findings: Finding[] = [];

    const rules = [
      {
        id: "SEC-001",
        severity: "critical" as const,
        pattern: /(SELECT\s+.+\s+FROM\s+.+\s+WHERE\s+.+['"`]\s*\+|INSERT\s+INTO.+['"`]\s*\+)/i,
        message: "Potential SQL injection through string-built database queries.",
        recommendation:
          "Use parameterized queries or prepared statements instead of concatenating untrusted input.",
      },
      {
        id: "SEC-002",
        severity: "high" as const,
        pattern: /(eval\s*\(|new\s+Function\s*\()/i,
        message: "Dynamic code execution detected.",
        recommendation:
          "Avoid eval/new Function and use explicit parsing or safe execution paths.",
      },
      {
        id: "SEC-003",
        severity: "high" as const,
        pattern: /(innerHTML\s*=|dangerouslySetInnerHTML)/i,
        message: "Raw HTML injection sink detected.",
        recommendation:
          "Sanitize untrusted HTML or avoid rendering raw HTML.",
      },
      {
        id: "SEC-004",
        severity: "medium" as const,
        pattern: /(console\.log\s*\(|console\.error\s*\()/i,
        message: "Debug logging detected.",
        recommendation:
          "Remove sensitive/debug logging from production paths.",
      },
      {
        id: "SEC-005",
        severity: "medium" as const,
        pattern: /(password|passwd|secret|api[_-]?key)\s*[:=]\s*["'][^"']+["']/i,
        message: "Possible hard-coded secret detected.",
        recommendation:
          "Move secrets into environment variables or a dedicated secret manager.",
      },
      {
        id: "SEC-006",
        severity: "medium" as const,
        pattern: /(http:\/\/(?!localhost|127\.0\.0\.1))/i,
        message: "Non-TLS HTTP endpoint detected.",
        recommendation:
          "Prefer HTTPS for external network communication.",
      },
    ];

    for (const rule of rules) {
      const match = rule.pattern.exec(code);

      if (match && match.index !== undefined) {
        findings.push({
          rule: rule.id,
          severity: rule.severity,
          line: lineNumber(code, match.index),
          message: rule.message,
          recommendation: rule.recommendation,
        });
      }
    }

    const weights = {
      critical: 30,
      high: 20,
      medium: 10,
      low: 5,
    };

    const deductions = findings.reduce(
      (sum, finding) => sum + weights[finding.severity],
      0
    );

    const score = Math.max(0, 100 - deductions);

    return NextResponse.json({
      score,
      findings,
      summary: {
        files: 1,
        findings: findings.length,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid analysis request." },
      { status: 400 }
    );
  }
}
EOF

    ok "Sentinel analyzer API created."
else
    ok "Existing analyzer API preserved."
fi

# ------------------------------------------------------------
# 8. VERIFY LAYOUT
# ------------------------------------------------------------

if [[ -f src/app/layout.tsx ]]; then
    ok "Existing layout preserved."
else
    die "src/app/layout.tsx is missing. Refusing unsafe reconstruction."
fi

# ------------------------------------------------------------
# 9. INSTALL DEPENDENCIES
# ------------------------------------------------------------

log "Installing dependencies..."

npm install

# Ensure local Vercel CLI exists.
if [[ ! -x "node_modules/.bin/vercel" ]]; then
    log "Installing local Vercel CLI..."
    npm install --save-dev vercel@58.9.0
fi

ok "Dependencies ready."

# ------------------------------------------------------------
# 10. ENSURE DEPLOY SCRIPT
# ------------------------------------------------------------

npm pkg set \
  'scripts.deploy=npm run build && ./node_modules/.bin/vercel deploy --prod --yes'

ok "Permanent deploy command configured."

# ------------------------------------------------------------
# 11. VALIDATION
# ------------------------------------------------------------

log "Running lint..."

if npm run lint; then
    ok "Lint passed."
else
    die "Lint failed. Deployment blocked."
fi

log "Running production build..."

if npm run build; then
    ok "Production build passed."
else
    die "Production build failed. Deployment blocked."
fi

# ------------------------------------------------------------
# 12. VERIFY LOCAL VERCEL PROJECT
# ------------------------------------------------------------

[[ -f ".vercel/project.json" ]] \
  || die ".vercel/project.json missing."

PROJECT_ID="$(
    node -e '
      const p=require("./.vercel/project.json");
      process.stdout.write(p.projectId || "");
    '
)"

ORG_ID="$(
    node -e '
      const p=require("./.vercel/project.json");
      process.stdout.write(p.orgId || "");
    '
)"

[[ -n "$PROJECT_ID" ]] || die "Could not read Vercel projectId."
[[ -n "$ORG_ID" ]] || die "Could not read Vercel orgId."

log "Vercel project ID: $PROJECT_ID"
log "Vercel organization: $ORG_ID"

# ------------------------------------------------------------
# 13. DEPLOY ONLY FROM SAIFRVW DIRECTORY
# ------------------------------------------------------------

log "Deploying ONLY duckx/saifrvw..."

DEPLOY_OUTPUT="$(
    ./node_modules/.bin/vercel deploy \
        --prod \
        --yes \
        2>&1
)"

printf '%s\n' "$DEPLOY_OUTPUT"

# ------------------------------------------------------------
# 14. HARD TARGET CHECK
# ------------------------------------------------------------

if printf '%s\n' "$DEPLOY_OUTPUT" |
   grep -Eqi 'saifrvuwe|project.?a[^a-z]|/a/'; then

    echo
    echo "============================================================"
    echo " SECURITY STOP"
    echo "============================================================"
    echo "Deployment output referenced a forbidden project."
    echo "SAIFRVW deployment was not accepted."
    echo "============================================================"

    exit 1
fi

if ! printf '%s\n' "$DEPLOY_OUTPUT" |
   grep -Fq 'saifrvw.vercel.app'; then

    warn "Main SAIFRVW alias was not detected in output."
fi

# ------------------------------------------------------------
# 15. FINAL STATUS
# ------------------------------------------------------------

echo
echo "============================================================"
echo "       SAIFRVW DEPLOYMENT COMPLETE"
echo "============================================================"
echo
echo " Project:   duckx/saifrvw"
echo " App:       $APP"
echo " Domain:    https://saifrvw.vercel.app"
echo
echo " Other Vercel projects were NOT targeted:"
echo "   ✗ saifrvuwe"
echo "   ✗ a"
echo
echo " Backup:"
echo "   $BACKUP"
echo
echo " Future deployment:"
echo
echo "   cd /workspaces/a/saifrvw"
echo "   npm run deploy"
echo
echo "============================================================"
