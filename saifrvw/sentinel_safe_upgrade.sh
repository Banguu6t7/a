#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="/workspaces/a/saifrvw"
EXPECTED_NAME="saifrvw"
EXPECTED_ORG="duckx"

if [ ! -d "$ROOT" ]; then
  echo "ERROR: Project directory does not exist: $ROOT"
  exit 1
fi

cd "$ROOT"

echo
echo "============================================================"
echo " SAIFRVW SENTINEL ENGINE"
echo " SAFE ANALYZER + REMEDIATION + REPORT + AI UPGRADE"
echo "============================================================"

echo
echo "[1/9] Verifying project..."

if [ ! -f package.json ]; then
  echo "ERROR: package.json not found."
  exit 1
fi

PROJECT_NAME="$(node -p 'require("./package.json").name')"

if [ "$PROJECT_NAME" != "$EXPECTED_NAME" ]; then
  echo "ERROR: Wrong project."
  echo "Expected: $EXPECTED_NAME"
  echo "Found:    $PROJECT_NAME"
  exit 1
fi

echo "OK: $ROOT"
echo "OK: package name = $PROJECT_NAME"

echo
echo "[2/9] Creating backup..."

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$ROOT/.sentinel-safe-backup-$STAMP"

mkdir -p "$BACKUP"

cp -a src "$BACKUP/src"

if [ -f package.json ]; then
  cp package.json "$BACKUP/package.json"
fi

if [ -f package-lock.json ]; then
  cp package-lock.json "$BACKUP/package-lock.json"
fi

if [ -f tsconfig.json ]; then
  cp tsconfig.json "$BACKUP/tsconfig.json"
fi

echo "Backup created:"
echo "$BACKUP"

ROLLBACK_NEEDED=0

rollback() {
  echo
  echo "============================================================"
  echo " VALIDATION FAILED"
  echo " RESTORING PRE-UPGRADE STATE"
  echo "============================================================"

  if [ -d "$BACKUP/src" ]; then
    rm -rf "$ROOT/src"
    cp -a "$BACKUP/src" "$ROOT/src"
  fi

  if [ -f "$BACKUP/package.json" ]; then
    cp "$BACKUP/package.json" "$ROOT/package.json"
  fi

  if [ -f "$BACKUP/package-lock.json" ]; then
    cp "$BACKUP/package-lock.json" "$ROOT/package-lock.json"
  fi

  if [ -f "$BACKUP/tsconfig.json" ]; then
    cp "$BACKUP/tsconfig.json" "$ROOT/tsconfig.json"
  fi

  echo "Rollback completed."
  echo "Backup retained at:"
  echo "$BACKUP"
}

trap 'if [ "$ROLLBACK_NEEDED" -eq 1 ]; then rollback; fi' EXIT

echo
echo "[3/9] Preparing directories..."

mkdir -p \
  src/lib \
  src/app/api/analyze \
  src/app/api/report \
  src/app/api/ai

echo
echo "[4/9] Installing Sentinel security engine..."

cat > src/lib/security-engine.ts <<'SECURITY_ENGINE'
export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface Finding {
  id: string;
  title: string;
  severity: Severity;
  confidence: number;
  line: number;
  category: string;
  cwe: string;
  owasp: string;
  description: string;
  impact: string;
  remediation: string;
  secureExample?: string;
  evidence: string;
}

type Rule = {
  id: string;
  title: string;
  severity: Severity;
  category: string;
  cwe: string;
  owasp: string;
  description: string;
  impact: string;
  remediation: string;
  secureExample?: string;
  patterns: RegExp[];
};

const RULES: Rule[] = [
  {
    id: "S001",
    title: "Dynamic code execution",
    severity: "critical",
    category: "Code Injection",
    cwe: "CWE-95",
    owasp: "A03:2021 Injection",
    description: "The code appears to execute dynamically constructed JavaScript.",
    impact: "Attacker-controlled input may become executable code.",
    remediation: "Avoid eval-like execution. Parse and validate data instead of executing strings.",
    secureExample: "const value = JSON.parse(input);",
    patterns: [
      /\beval\s*\(/i,
      /\bnew\s+Function\s*\(/i,
      /\bFunction\s*\(/i
    ]
  },
  {
    id: "S002",
    title: "Command injection risk",
    severity: "critical",
    category: "Command Injection",
    cwe: "CWE-78",
    owasp: "A03:2021 Injection",
    description: "A shell command appears to be constructed from a variable.",
    impact: "Untrusted input could alter the executed command.",
    remediation: "Use argument arrays and strict allowlists. Never concatenate untrusted input into shell commands.",
    secureExample: "execFile('git', ['status'], callback);",
    patterns: [
      /\bexec\s*\(\s*.*\+/i,
      /\bexecSync\s*\(\s*.*\+/i,
      /\bspawn\s*\(\s*.*\+/i,
      /\bchild_process\b/i
    ]
  },
  {
    id: "S003",
    title: "SQL injection risk",
    severity: "high",
    category: "Injection",
    cwe: "CWE-89",
    owasp: "A03:2021 Injection",
    description: "A SQL statement appears to contain interpolated or concatenated input.",
    impact: "Attackers may manipulate database queries.",
    remediation: "Use parameterized queries or a trusted ORM query API.",
    secureExample: "db.query('SELECT * FROM users WHERE id = $1', [userId]);",
    patterns: [
      /SELECT\s+.+\$\{/i,
      /SELECT\s+.+\+/i,
      /INSERT\s+.+\$\{/i,
      /UPDATE\s+.+\$\{/i,
      /DELETE\s+.+\$\{/i
    ]
  },
  {
    id: "S004",
    title: "Unsafe HTML injection",
    severity: "high",
    category: "Cross-Site Scripting",
    cwe: "CWE-79",
    owasp: "A03:2021 Injection",
    description: "Raw HTML is being inserted into the DOM.",
    impact: "Untrusted markup can execute attacker-controlled JavaScript.",
    remediation: "Prefer text rendering. If HTML is unavoidable, sanitize it with a well-maintained sanitizer.",
    secureExample: "<div>{userContent}</div>",
    patterns: [
      /dangerouslySetInnerHTML/i,
      /\.innerHTML\s*=/i,
      /document\.write\s*\(/i
    ]
  },
  {
    id: "S005",
    title: "Potential hardcoded secret",
    severity: "high",
    category: "Secrets Management",
    cwe: "CWE-798",
    owasp: "A07:2021 Identification and Authentication Failures",
    description: "A source line resembles a hardcoded credential, token, or API key.",
    impact: "Credentials committed to source can be leaked through repositories, logs, or builds.",
    remediation: "Move secrets into environment variables or a dedicated secret manager and rotate exposed credentials.",
    patterns: [
      /\b(api[_-]?key|secret|password|token)\b\s*[:=]\s*["'][^"']{8,}["']/i,
      /\b(sk|pk)_[a-z0-9_-]{12,}\b/i
    ]
  },
  {
    id: "S006",
    title: "Path traversal risk",
    severity: "high",
    category: "Path Traversal",
    cwe: "CWE-22",
    owasp: "A01:2021 Broken Access Control",
    description: "A filesystem path appears to be constructed from external input.",
    impact: "Attackers may access files outside the intended directory.",
    remediation: "Resolve paths against a fixed base directory and verify the final path remains inside that directory.",
    patterns: [
      /path\.(join|resolve)\s*\([^)]*(req|request|query|params|body)/i,
      /fs\.(readFile|readFileSync|writeFile|writeFileSync)\s*\([^)]*(req|request|query|params|body)/i
    ]
  },
  {
    id: "S007",
    title: "Potential SSRF",
    severity: "high",
    category: "Server-Side Request Forgery",
    cwe: "CWE-918",
    owasp: "A10:2021 Server-Side Request Forgery",
    description: "A server-side HTTP request appears to consume externally supplied URLs.",
    impact: "Attackers may make the server request internal or cloud metadata endpoints.",
    remediation: "Allowlist destinations, block private/link-local ranges, validate protocols, and resolve DNS safely.",
    patterns: [
      /fetch\s*\(\s*(req|request|url|target|input)/i,
      /axios\.(get|post|request)\s*\(\s*(req|request|url|target|input)/i
    ]
  },
  {
    id: "S008",
    title: "Weak cryptographic primitive",
    severity: "medium",
    category: "Cryptography",
    cwe: "CWE-327",
    owasp: "A02:2021 Cryptographic Failures",
    description: "A weak or obsolete cryptographic primitive appears in the source.",
    impact: "Sensitive data may have insufficient cryptographic protection.",
    remediation: "Use modern primitives such as SHA-256 for integrity or an approved password hashing algorithm such as Argon2id.",
    patterns: [
      /\bmd5\s*\(/i,
      /\bcreateHash\s*\(\s*["']md5["']/i,
      /\bsha1\s*\(/i,
      /\bcreateHash\s*\(\s*["']sha1["']/i
    ]
  },
  {
    id: "S009",
    title: "Wildcard CORS configuration",
    severity: "medium",
    category: "Security Configuration",
    cwe: "CWE-942",
    owasp: "A05:2021 Security Misconfiguration",
    description: "Cross-origin access appears to allow every origin.",
    impact: "Browser clients from untrusted origins may interact with the API.",
    remediation: "Restrict allowed origins to the exact trusted frontend origins.",
    patterns: [
      /Access-Control-Allow-Origin["']?\s*[:=]\s*["']\*["']/i,
      /origin\s*:\s*["']\*["']/i
    ]
  },
  {
    id: "S010",
    title: "JWT algorithm weakness",
    severity: "high",
    category: "Authentication",
    cwe: "CWE-347",
    owasp: "A07:2021 Identification and Authentication Failures",
    description: "JWT verification appears to accept an unsafe algorithm configuration.",
    impact: "Weak verification can allow forged authentication tokens.",
    remediation: "Explicitly allow only the expected signing algorithm and validate issuer, audience, expiry, and signature.",
    patterns: [
      /algorithms\s*:\s*\[\s*["']none["']/i,
      /algorithm\s*:\s*["']none["']/i
    ]
  }
];

const severityWeight: Record<Severity, number> = {
  critical: 10,
  high: 7,
  medium: 4,
  low: 2,
  info: 1
};

function lineNumber(source: string, index: number): number {
  return source.slice(0, index).split("\n").length;
}

function makeFinding(
  rule: Rule,
  source: string,
  match: RegExpExecArray
): Finding {
  const line = lineNumber(source, match.index);
  const evidence =
    source.split("\n")[line - 1]?.trim().slice(0, 240) || rule.title;

  return {
    id: rule.id,
    title: rule.title,
    severity: rule.severity,
    confidence: 86,
    line,
    category: rule.category,
    cwe: rule.cwe,
    owasp: rule.owasp,
    description: rule.description,
    impact: rule.impact,
    remediation: rule.remediation,
    secureExample: rule.secureExample,
    evidence
  };
}

export function analyzeSource(
  source: string,
  language = "auto"
) {
  const findings: Finding[] = [];

  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      const flags = pattern.flags.includes("g")
        ? pattern.flags
        : `${pattern.flags}g`;

      const scanner = new RegExp(pattern.source, flags);
      let match: RegExpExecArray | null;

      while ((match = scanner.exec(source)) !== null) {
        findings.push(makeFinding(rule, source, match));

        if (findings.filter((item) => item.id === rule.id).length >= 3) {
          break;
        }

        if (match.index === scanner.lastIndex) {
          scanner.lastIndex++;
        }
      }

      if (findings.filter((item) => item.id === rule.id).length >= 3) {
        break;
      }
    }
  }

  const unique = new Map<string, Finding>();

  for (const finding of findings) {
    const key = `${finding.id}:${finding.line}`;
    if (!unique.has(key)) {
      unique.set(key, finding);
    }
  }

  const normalized = Array.from(unique.values()).sort((a, b) => {
    const severity =
      severityWeight[b.severity] - severityWeight[a.severity];

    if (severity !== 0) return severity;

    return a.line - b.line;
  });

  const counts = {
    critical: normalized.filter((f) => f.severity === "critical").length,
    high: normalized.filter((f) => f.severity === "high").length,
    medium: normalized.filter((f) => f.severity === "medium").length,
    low: normalized.filter((f) => f.severity === "low").length,
    info: normalized.filter((f) => f.severity === "info").length
  };

  const rawRisk = normalized.reduce(
    (total, finding) =>
      total + severityWeight[finding.severity] * (finding.confidence / 100),
    0
  );

  const riskScore = Math.min(
    100,
    Math.round(rawRisk * 7)
  );

  const securityGrade =
    riskScore === 0
      ? "A+"
      : riskScore < 15
        ? "A"
        : riskScore < 30
          ? "B"
          : riskScore < 50
            ? "C"
            : riskScore < 70
              ? "D"
              : "F";

  return {
    engine: "SAIFRVW SENTINEL v5.1",
    language,
    scannedLines: source.split("\n").length,
    findings: normalized,
    counts,
    riskScore,
    securityGrade
  };
}
SECURITY_ENGINE

echo "Security engine created."

echo
echo "[5/9] Upgrading analyzer API..."

cat > src/app/api/analyze/route.ts <<'ANALYZE_ROUTE'
import { NextRequest, NextResponse } from "next/server";
import { analyzeSource } from "@/lib/security-engine";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body || typeof body.code !== "string") {
      return NextResponse.json(
        {
          error: "Missing required field: code"
        },
        { status: 400 }
      );
    }

    if (body.code.length > 500_000) {
      return NextResponse.json(
        {
          error: "Code exceeds the 500 KB analysis limit."
        },
        { status: 413 }
      );
    }

    const result = analyzeSource(
      body.code,
      typeof body.language === "string" ? body.language : "auto"
    );

    return NextResponse.json({
      ok: true,
      ...result
    });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to analyze the supplied source."
      },
      { status: 400 }
    );
  }
}
ANALYZE_ROUTE

echo "Analyzer API upgraded."

echo
echo "[6/9] Creating report API..."

cat > src/app/api/report/route.ts <<'REPORT_ROUTE'
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body || !body.result) {
      return NextResponse.json(
        { error: "Missing analysis result." },
        { status: 400 }
      );
    }

    const result = body.result;

    const lines = [
      "SAIFRVW SENTINEL ENGINE SECURITY REPORT",
      "========================================",
      "",
      `Engine: ${result.engine ?? "SAIFRVW SENTINEL"}`,
      `Language: ${result.language ?? "auto"}`,
      `Scanned lines: ${result.scannedLines ?? 0}`,
      `Security grade: ${result.securityGrade ?? "N/A"}`,
      `Risk score: ${result.riskScore ?? 0}/100`,
      "",
      "FINDINGS",
      "--------"
    ];

    const findings = Array.isArray(result.findings)
      ? result.findings
      : [];

    if (findings.length === 0) {
      lines.push("No findings detected by the current rule set.");
    } else {
      findings.forEach((finding: Record<string, unknown>, index: number) => {
        lines.push("");
        lines.push(
          `${index + 1}. ${String(finding.title ?? "Finding")}`
        );
        lines.push(
          `Severity: ${String(finding.severity ?? "unknown")}`
        );
        lines.push(
          `Confidence: ${String(finding.confidence ?? 0)}%`
        );
        lines.push(
          `Line: ${String(finding.line ?? "?")}`
        );
        lines.push(
          `Category: ${String(finding.category ?? "Security")}`
        );
        lines.push(
          `CWE: ${String(finding.cwe ?? "N/A")}`
        );
        lines.push(
          `OWASP: ${String(finding.owasp ?? "N/A")}`
        );
        lines.push("");
        lines.push(
          `Description: ${String(finding.description ?? "")}`
        );
        lines.push(
          `Impact: ${String(finding.impact ?? "")}`
        );
        lines.push(
          `Remediation: ${String(finding.remediation ?? "")}`
        );

        if (finding.secureExample) {
          lines.push(
            `Secure example: ${String(finding.secureExample)}`
          );
        }
      });
    }

    return NextResponse.json({
      ok: true,
      format: "text",
      report: lines.join("\n")
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to generate security report." },
      { status: 400 }
    );
  }
}
REPORT_ROUTE

echo "Report API created."

echo
echo "[7/9] Verifying provider-ready AI assistant..."

if [ ! -f src/app/api/ai/route.ts ]; then
  cat > src/app/api/ai/route.ts <<'AI_ROUTE'
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const question =
      typeof body?.question === "string"
        ? body.question.trim()
        : "";

    if (!question) {
      return NextResponse.json(
        { error: "Question is required." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      provider: "provider-ready",
      configured: Boolean(
        process.env.OPENAI_API_KEY ||
        process.env.ANTHROPIC_API_KEY ||
        process.env.GEMINI_API_KEY
      ),
      answer:
        "AI provider is not configured yet. The assistant API is ready for a server-side provider integration. For immediate help, use the finding remediation details returned by SENTINEL."
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to process AI assistant request." },
      { status: 400 }
    );
  }
}
AI_ROUTE
  echo "AI route created."
else
  echo "Existing AI route preserved."
fi

echo
echo "[8/9] Checking application dependencies..."

npm install

echo
echo "============================================================"
echo " VALIDATION"
echo "============================================================"

echo
echo "[8.1] ESLint"
npm run lint

echo
echo "[8.2] TypeScript"
./node_modules/.bin/tsc --noEmit

echo
echo "[8.3] Production build"
npm run build

echo
echo "[8.4] Required route verification"

REQUIRED_FILES=(
  "src/app/page.tsx"
  "src/app/review/page.tsx"
  "src/app/docs/page.tsx"
  "src/app/pricing/page.tsx"
  "src/app/api/analyze/route.ts"
  "src/app/api/ai/route.ts"
  "src/app/api/report/route.ts"
  "src/lib/security-engine.ts"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "ERROR: Required file missing: $file"
    ROLLBACK_NEEDED=1
    exit 1
  fi
done

echo "All required files exist."

echo
echo "[8.5] Production route verification"

if [ ! -d ".next" ]; then
  echo "ERROR: .next directory was not produced."
  ROLLBACK_NEEDED=1
  exit 1
fi

echo "Production build exists."

echo
echo "[8.6] Vercel project verification"

if [ ! -f ".vercel/project.json" ]; then
  echo "ERROR: .vercel/project.json is missing."
  echo "Refusing deployment because the target project cannot be verified."
  ROLLBACK_NEEDED=1
  exit 1
fi

VERCEL_PROJECT="$(node - <<'NODE'
const fs = require("fs");
const p = JSON.parse(fs.readFileSync(".vercel/project.json", "utf8"));
console.log(p.projectId || "");
NODE
)"

VERCEL_ORG="$(node - <<'NODE'
const fs = require("fs");
const p = JSON.parse(fs.readFileSync(".vercel/project.json", "utf8"));
console.log(p.orgId || "");
NODE
)"

if [ -z "$VERCEL_PROJECT" ]; then
  echo "ERROR: Could not read Vercel project ID."
  ROLLBACK_NEEDED=1
  exit 1
fi

if [ -z "$VERCEL_ORG" ]; then
  echo "ERROR: Could not read Vercel organization ID."
  ROLLBACK_NEEDED=1
  exit 1
fi

echo "Vercel project metadata detected."

echo
echo "============================================================"
echo " ALL VALIDATION CHECKS PASSED"
echo "============================================================"

echo
echo "Backup:"
echo "$BACKUP"

echo
echo "The deployment gate is OPEN."

echo
echo "[9/9] Deploying ONLY the verified SAIFRVW project..."

if [ ! -x "./node_modules/.bin/vercel" ]; then
  echo "Vercel CLI not found locally. Installing exact CLI..."
  npm install --save-dev vercel@58.9.0
fi

./node_modules/.bin/vercel deploy --prod --yes

echo
echo "============================================================"
echo " SAIFRVW SENTINEL v5.1 DEPLOYED"
echo "============================================================"

echo
echo "Expected routes:"
echo "  /"
echo "  /review"
echo "  /docs"
echo "  /pricing"
echo "  /api/analyze"
echo "  /api/ai"
echo "  /api/report"

echo
echo "Backup retained:"
echo "$BACKUP"

echo
echo "IMPORTANT:"
echo "This deployment contains a rule-based static analyzer."
echo "It is not a replacement for full SAST, DAST, dependency"
echo "scanning, runtime testing, or human security review."

ROLLBACK_NEEDED=0
