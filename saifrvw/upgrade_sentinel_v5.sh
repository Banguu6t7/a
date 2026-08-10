#!/usr/bin/env bash
set -Eeuo pipefail

# ============================================================
# SAIFRVW — SENTINEL ENGINE v5
# FAIL-CLOSED ULTIMATE SECURITY PLATFORM UPGRADE
#
# TARGET:
#   /workspaces/a/saifrvw
#
# VERCEL:
#   duckx/saifrvw
#
# FEATURES:
#   - Timestamped backup
#   - Automatic rollback on validation failure
#   - Deep rule-based security analyzer
#   - CWE + OWASP mappings
#   - Confidence scoring
#   - Risk scoring
#   - Remediation engine
#   - Secure before/after examples
#   - Security report API
#   - Provider-ready AI assistant
#   - Free / Pro pricing UI
#   - Lint + TypeScript + production build
#   - API smoke tests
#   - Fail-closed production deployment
#
# IMPORTANT:
#   No deployment occurs unless EVERY validation succeeds.
# ============================================================

set +H

ROOT="/workspaces/a/saifrvw"
EXPECTED_PROJECT="saifrvw"
EXPECTED_ORG="duckx"

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$ROOT/.sentinel-v5-backup-$STAMP"

log() {
  printf '\n\033[1;36m[SENTINEL]\033[0m %s\n' "$1"
}

ok() {
  printf '\033[1;32m✓\033[0m %s\n' "$1"
}

warn() {
  printf '\033[1;33m!\033[0m %s\n' "$1"
}

die() {
  printf '\n\033[1;31m✗ FATAL:\033[0m %s\n' "$1" >&2
  printf '\nRollback directory: %s\n' "$BACKUP" >&2
  exit 1
}

rollback() {
  warn "Validation failed. Restoring modified files..."

  if [ -d "$BACKUP/files" ]; then
    cp -a "$BACKUP/files/." "$ROOT/"
  fi

  ok "Rollback completed."
}

trap 'rollback' ERR

# ============================================================
# 1. HARD PROJECT SAFETY
# ============================================================

log "Checking project location..."

[ "$PWD" = "$ROOT" ] || die "Run this from $ROOT"

[ -f "$ROOT/package.json" ] || die "package.json missing"
[ -f "$ROOT/next.config.mjs" ] || die "Not a valid Next.js project"
[ -d "$ROOT/src/app" ] || die "src/app missing"

PROJECT_NAME="$(node -p 'require("./package.json").name')"

[ "$PROJECT_NAME" = "$EXPECTED_PROJECT" ] || \
  die "Unexpected project name: $PROJECT_NAME"

ok "Correct SAIFRVW project confirmed."

# ============================================================
# 2. BACKUP
# ============================================================

log "Creating timestamped backup..."

mkdir -p "$BACKUP/files"

cp -a \
  src \
  package.json \
  package-lock.json \
  tsconfig.json \
  next.config.mjs \
  .eslintrc.json \
  "$BACKUP/files/" 2>/dev/null || true

if [ -d .vercel ]; then
  cp -a .vercel "$BACKUP/files/"
fi

ok "Backup created: $BACKUP"

# ============================================================
# 3. DIRECTORIES
# ============================================================

log "Preparing engine directories..."

mkdir -p \
  src/lib \
  src/components \
  src/app/api/analyze \
  src/app/api/ai \
  src/app/api/report \
  src/app/review \
  src/app/pricing \
  src/app/docs

# ============================================================
# 4. SECURITY ENGINE
# ============================================================

log "Installing Sentinel security engine..."

cat > src/lib/security-engine.ts <<'EOF'
export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface Finding {
  id: string;
  title: string;
  severity: Severity;
  confidence: number;
  category: string;
  cwe: string;
  owasp: string;
  line: number;
  column: number;
  evidence: string;
  description: string;
  impact: string;
  remediation: string;
  secureExample: string;
  references: string[];
}

interface Rule {
  id: string;
  title: string;
  severity: Severity;
  category: string;
  cwe: string;
  owasp: string;
  confidence: number;
  pattern: RegExp;
  description: string;
  impact: string;
  remediation: string;
  secureExample: string;
}

const RULES: Rule[] = [
  {
    id: "S001",
    title: "Possible SQL Injection",
    severity: "critical",
    category: "Injection",
    cwe: "CWE-89",
    owasp: "A03:2021",
    confidence: 94,
    pattern: /(SELECT|INSERT|UPDATE|DELETE)[\s\S]{0,180}(\+|`|\$\{|\.\s*req\.|\.query)/i,
    description:
      "SQL syntax appears to be constructed from dynamic input instead of using a parameterized query.",
    impact:
      "An attacker may manipulate database queries, read unauthorized data, modify records, or potentially execute destructive operations.",
    remediation:
      "Use parameterized queries or a trusted ORM query API. Never concatenate untrusted input into SQL.",
    secureExample:
      'db.query("SELECT * FROM users WHERE id = ?", [userId]);',
  },
  {
    id: "S002",
    title: "Command Injection Risk",
    severity: "critical",
    category: "Command Injection",
    cwe: "CWE-78",
    owasp: "A03:2021",
    confidence: 93,
    pattern: /(exec|execSync|spawn|spawnSync)\s*\([^)]*(req\.|query|params|body|input|user)/i,
    description:
      "A process execution API appears to receive request-controlled data.",
    impact:
      "Successful exploitation could allow arbitrary operating-system commands to execute with the application's privileges.",
    remediation:
      "Avoid shell execution with user input. Prefer fixed argument arrays, strict allowlists, and dedicated libraries.",
    secureExample:
      'spawn("git", ["status"], { shell: false });',
  },
  {
    id: "S003",
    title: "Potential Cross-Site Scripting",
    severity: "high",
    category: "XSS",
    cwe: "CWE-79",
    owasp: "A03:2021",
    confidence: 91,
    pattern: /dangerouslySetInnerHTML\s*=\s*\{\s*\{/,
    description:
      "Raw HTML is being injected into a React component.",
    impact:
      "Untrusted HTML can execute attacker-controlled JavaScript in a victim's browser.",
    remediation:
      "Prefer normal React rendering. If HTML is unavoidable, sanitize it with a trusted HTML sanitizer and constrain allowed elements.",
    secureExample:
      "{content}",
  },
  {
    id: "S004",
    title: "Hardcoded Secret Candidate",
    severity: "high",
    category: "Secrets",
    cwe: "CWE-798",
    owasp: "A07:2021",
    confidence: 86,
    pattern: /(api[_-]?key|secret|password|token)\s*[:=]\s*["'][A-Za-z0-9_\-\/+=]{12,}["']/i,
    description:
      "A credential-like value appears to be embedded directly in source code.",
    impact:
      "Committed credentials can be extracted from source history and reused against production systems.",
    remediation:
      "Move secrets to environment variables or a dedicated secret manager. Rotate any exposed credential immediately.",
    secureExample:
      "const apiKey = process.env.API_KEY;",
  },
  {
    id: "S005",
    title: "Weak Cryptographic Hash",
    severity: "high",
    category: "Cryptography",
    cwe: "CWE-328",
    owasp: "A02:2021",
    confidence: 90,
    pattern: /createHash\s*\(\s*["'](md5|sha1)["']\s*\)/i,
    description:
      "A legacy cryptographic hash is used.",
    impact:
      "MD5 and SHA-1 are unsuitable for security-sensitive hashing and can permit practical collision attacks.",
    remediation:
      "Use SHA-256+ for integrity use cases, or a password-specific KDF such as Argon2id, scrypt, or bcrypt for passwords.",
    secureExample:
      'createHash("sha256")',
  },
  {
    id: "S006",
    title: "Insecure Randomness",
    severity: "medium",
    category: "Cryptography",
    cwe: "CWE-338",
    owasp: "A02:2021",
    confidence: 87,
    pattern: /Math\.random\s*\(\)/,
    description:
      "Math.random() appears in source code.",
    impact:
      "Predictable values can become exploitable when used for tokens, identifiers, reset links, or security decisions.",
    remediation:
      "Use a cryptographically secure random source such as crypto.randomBytes or crypto.getRandomValues.",
    secureExample:
      "crypto.randomUUID()",
  },
  {
    id: "S007",
    title: "Disabled TLS Certificate Validation",
    severity: "high",
    category: "Transport Security",
    cwe: "CWE-295",
    owasp: "A02:2021",
    confidence: 97,
    pattern: /rejectUnauthorized\s*:\s*false/i,
    description:
      "TLS certificate verification is explicitly disabled.",
    impact:
      "Man-in-the-middle attacks can intercept or modify encrypted traffic.",
    remediation:
      "Remove the override and rely on normal certificate verification.",
    secureExample:
      "https.request({ hostname, port: 443 })",
  },
  {
    id: "S008",
    title: "Permissive CORS Configuration",
    severity: "medium",
    category: "Access Control",
    cwe: "CWE-942",
    owasp: "A05:2021",
    confidence: 88,
    pattern: /Access-Control-Allow-Origin["']?\s*[:=]\s*["']\*["']/i,
    description:
      "CORS appears to allow every origin.",
    impact:
      "Sensitive APIs may become accessible from untrusted websites.",
    remediation:
      "Allow only explicitly trusted origins and avoid wildcard CORS for credentialed APIs.",
    secureExample:
      'res.setHeader("Access-Control-Allow-Origin", "https://example.com");',
  },
  {
    id: "S009",
    title: "Path Traversal Risk",
    severity: "high",
    category: "File Access",
    cwe: "CWE-22",
    owasp: "A01:2021",
    confidence: 89,
    pattern: /(readFile|writeFile|unlink|stat|open)\s*\([^)]*(req\.|query|params|body)/i,
    description:
      "A filesystem operation appears to use request-controlled input.",
    impact:
      "Attackers may access or overwrite files outside the intended directory.",
    remediation:
      "Resolve against a fixed base directory and verify the resulting path remains inside that directory.",
    secureExample:
      "const safe = path.resolve(BASE, userPath);",
  },
  {
    id: "S010",
    title: "Potential SSRF",
    severity: "high",
    category: "SSRF",
    cwe: "CWE-918",
    owasp: "A10:2021",
    confidence: 84,
    pattern: /(fetch|axios\.get|axios\.request|https\.get)\s*\([^)]*(req\.|query|params|body)/i,
    description:
      "A server-side HTTP request appears to consume user-controlled input.",
    impact:
      "Attackers may force the server to access internal services or cloud metadata endpoints.",
    remediation:
      "Use an allowlist of approved hosts and protocols. Block private, loopback, link-local, and metadata IP ranges.",
    secureExample:
      "assertAllowedHost(new URL(target).hostname);",
  },
  {
    id: "S011",
    title: "JWT Algorithm Confusion Candidate",
    severity: "high",
    category: "Authentication",
    cwe: "CWE-347",
    owasp: "A07:2021",
    confidence: 80,
    pattern: /jwt\.verify\s*\([^)]*algorithms\s*:\s*\[\s*["']none["']/i,
    description:
      "JWT verification appears to permit the insecure none algorithm.",
    impact:
      "Attackers may forge authentication tokens if verification is misconfigured.",
    remediation:
      "Explicitly allow only the expected signing algorithms and validate issuer, audience, and expiration.",
    secureExample:
      'jwt.verify(token, secret, { algorithms: ["RS256"] });',
  },
  {
    id: "S012",
    title: "Debug Logging of Sensitive Data",
    severity: "medium",
    category: "Data Exposure",
    cwe: "CWE-532",
    owasp: "A09:2021",
    confidence: 79,
    pattern: /console\.(log|debug|info)\s*\([^)]*(password|token|secret|authorization|cookie)/i,
    description:
      "Logging appears to include authentication or secret material.",
    impact:
      "Secrets may leak through application logs, monitoring systems, or support tooling.",
    remediation:
      "Redact sensitive fields before logging and use structured logging with explicit field allowlists.",
    secureExample:
      'logger.info({ userId }, "authentication event");',
  },
  {
    id: "S013",
    title: "Prototype Pollution Candidate",
    severity: "high",
    category: "Input Handling",
    cwe: "CWE-1321",
    owasp: "A03:2021",
    confidence: 77,
    pattern: /(__proto__|constructor\s*\.\s*prototype|Object\.assign\s*\([^)]*req\.)/i,
    description:
      "An object merge or prototype-related operation appears to consume untrusted data.",
    impact:
      "Prototype pollution can alter application behavior and sometimes lead to authorization bypass or code execution.",
    remediation:
      "Use schema validation, reject prototype keys, and prefer safe object construction.",
    secureExample:
      "const safe = { name: input.name };",
  },
  {
    id: "S014",
    title: "Missing Input Validation Candidate",
    severity: "medium",
    category: "Validation",
    cwe: "CWE-20",
    owasp: "A03:2021",
    confidence: 67,
    pattern: /req\.(body|query|params)\[[^\]]+\]\s*(?:;|\)|,)/i,
    description:
      "Request data appears to be consumed directly without visible schema validation.",
    impact:
      "Unexpected types and malformed values can reach sensitive application logic.",
    remediation:
      "Validate request payloads with an explicit schema before business logic executes.",
    secureExample:
      "const parsed = schema.parse(req.body);",
  },
  {
    id: "S015",
    title: "Dynamic Code Execution",
    severity: "critical",
    category: "Code Injection",
    cwe: "CWE-95",
    owasp: "A03:2021",
    confidence: 96,
    pattern: /\beval\s*\(|\bnew Function\s*\(/i,
    description:
      "Dynamic JavaScript execution is present.",
    impact:
      "If attacker-controlled content reaches this code path, arbitrary JavaScript can execute.",
    remediation:
      "Remove dynamic execution and replace it with explicit parsing, lookup tables, or safe interpreters.",
    secureExample:
      "const operation = OPERATIONS[input];",
  },
];

function lineAndColumn(source: string, index: number) {
  const before = source.slice(0, index);
  const line = before.split("\n").length;
  const lastBreak = before.lastIndexOf("\n");
  const column = index - lastBreak;
  return { line, column };
}

function severityWeight(severity: Severity) {
  return {
    critical: 100,
    high: 75,
    medium: 45,
    low: 20,
    info: 5,
  }[severity];
}

function languageFromFilename(filename?: string) {
  const ext = (filename || "").split(".").pop()?.toLowerCase();

  const map: Record<string, string> = {
    ts: "TypeScript",
    tsx: "TSX",
    js: "JavaScript",
    jsx: "JSX",
    py: "Python",
    java: "Java",
    go: "Go",
    rs: "Rust",
    php: "PHP",
    rb: "Ruby",
    cs: "C#",
    c: "C",
    cpp: "C++",
    sh: "Shell",
  };

  return map[ext || ""] || "Source Code";
}

export function analyzeSource(
  source: string,
  filename = "untitled.ts"
) {
  const findings: Finding[] = [];

  for (const rule of RULES) {
    const match = rule.pattern.exec(source);

    if (!match || match.index < 0) continue;

    const { line, column } = lineAndColumn(source, match.index);

    const rawLine =
      source.split("\n")[line - 1]?.trim().slice(0, 220) || "";

    findings.push({
      id: rule.id,
      title: rule.title,
      severity: rule.severity,
      confidence: rule.confidence,
      category: rule.category,
      cwe: rule.cwe,
      owasp: rule.owasp,
      line,
      column,
      evidence: rawLine,
      description: rule.description,
      impact: rule.impact,
      remediation: rule.remediation,
      secureExample: rule.secureExample,
      references: [
        `https://cwe.mitre.org/data/definitions/${rule.cwe.replace(
          "CWE-",
          ""
        )}.html`,
        `https://owasp.org/Top10/`,
      ],
    });
  }

  findings.sort(
    (a, b) =>
      severityWeight(b.severity) - severityWeight(a.severity) ||
      b.confidence - a.confidence
  );

  const counts = {
    critical: findings.filter((f) => f.severity === "critical").length,
    high: findings.filter((f) => f.severity === "high").length,
    medium: findings.filter((f) => f.severity === "medium").length,
    low: findings.filter((f) => f.severity === "low").length,
    info: findings.filter((f) => f.severity === "info").length,
  };

  const riskScore = Math.min(
    100,
    Math.round(
      findings.reduce(
        (sum, f) => sum + severityWeight(f.severity) * (f.confidence / 100),
        0
      ) * 1.15
    )
  );

  const securityGrade =
    riskScore >= 80
      ? "F"
      : riskScore >= 65
      ? "D"
      : riskScore >= 45
      ? "C"
      : riskScore >= 25
      ? "B"
      : "A";

  return {
    engine: "SAIFRVW SENTINEL v5",
    language: languageFromFilename(filename),
    filename,
    scannedLines: source.split("\n").length,
    scannedBytes: Buffer.byteLength(source, "utf8"),
    rulesEvaluated: RULES.length,
    findings,
    counts,
    riskScore,
    securityGrade,
    generatedAt: new Date().toISOString(),
  };
}
EOF

# ============================================================
# 5. REMEDIATION ENGINE
# ============================================================

log "Installing remediation engine..."

cat > src/lib/remediation-engine.ts <<'EOF'
import type { Finding } from "./security-engine";

export function buildRemediationPlan(findings: Finding[]) {
  return findings.map((finding, index) => ({
    priority: index + 1,
    findingId: finding.id,
    title: finding.title,
    severity: finding.severity,
    confidence: finding.confidence,
    location: `line ${finding.line}, column ${finding.column}`,
    problem: finding.description,
    impact: finding.impact,
    fix: finding.remediation,
    secureExample: finding.secureExample,
    verification: [
      "Apply the recommended change.",
      "Add a regression/security test for the vulnerable path.",
      "Re-run SAIFRVW analysis.",
      "Confirm the finding disappears or is explicitly accepted.",
    ],
  }));
}
EOF

# ============================================================
# 6. REPORT ENGINE
# ============================================================

log "Installing security report engine..."

cat > src/lib/report-engine.ts <<'EOF'
import type { Finding } from "./security-engine";
import { buildRemediationPlan } from "./remediation-engine";

export function buildSecurityReport(
  analysis: ReturnType<
    typeof import("./security-engine").analyzeSource
  >
) {
  const critical = analysis.findings.filter(
    (f) => f.severity === "critical"
  );

  const high = analysis.findings.filter(
    (f) => f.severity === "high"
  );

  return {
    metadata: {
      product: "SAIFRVW",
      engine: analysis.engine,
      generatedAt: analysis.generatedAt,
      filename: analysis.filename,
      language: analysis.language,
    },

    executiveSummary: {
      grade: analysis.securityGrade,
      riskScore: analysis.riskScore,
      totalFindings: analysis.findings.length,
      critical: analysis.counts.critical,
      high: analysis.counts.high,
      medium: analysis.counts.medium,
      low: analysis.counts.low,
      recommendation:
        critical.length > 0
          ? "Immediate remediation required before production."
          : high.length > 0
          ? "High-priority remediation recommended before release."
          : analysis.findings.length > 0
          ? "Review findings and apply recommended hardening."
          : "No known rule-based findings detected.",
    },

    findings: analysis.findings,

    remediationPlan: buildRemediationPlan(analysis.findings),

    methodology: [
      "Pattern-based security rule evaluation",
      "Severity classification",
      "Confidence scoring",
      "CWE classification",
      "OWASP Top 10 mapping",
      "Evidence extraction",
      "Remediation guidance",
    ],

    limitations: [
      "Static rule analysis cannot prove exploitability.",
      "Absence of findings does not prove software is secure.",
      "Complex data-flow vulnerabilities may require AST or runtime analysis.",
      "Dependency and secret scanning should be added for repository-wide assurance.",
    ],
  };
}
EOF

# ============================================================
# 7. ANALYZER API
# ============================================================

log "Upgrading analyzer API..."

cat > src/app/api/analyze/route.ts <<'EOF'
import { NextResponse } from "next/server";
import { analyzeSource } from "@/lib/security-engine";

export const runtime = "nodejs";

const MAX_SOURCE_BYTES = 500_000;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const source =
      typeof body?.source === "string" ? body.source : "";

    const filename =
      typeof body?.filename === "string" &&
      body.filename.length <= 180
        ? body.filename
        : "untitled.ts";

    if (!source.trim()) {
      return NextResponse.json(
        { error: "source is required" },
        { status: 400 }
      );
    }

    if (Buffer.byteLength(source, "utf8") > MAX_SOURCE_BYTES) {
      return NextResponse.json(
        {
          error: `Source exceeds ${MAX_SOURCE_BYTES} byte limit.`,
        },
        { status: 413 }
      );
    }

    const analysis = analyzeSource(source, filename);

    return NextResponse.json({
      ok: true,
      analysis,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid analysis request." },
      { status: 400 }
    );
  }
}
EOF

# ============================================================
# 8. REPORT API
# ============================================================

log "Creating report API..."

cat > src/app/api/report/route.ts <<'EOF'
import { NextResponse } from "next/server";
import { analyzeSource } from "@/lib/security-engine";
import { buildSecurityReport } from "@/lib/report-engine";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const source =
      typeof body?.source === "string" ? body.source : "";

    const filename =
      typeof body?.filename === "string"
        ? body.filename
        : "untitled.ts";

    if (!source.trim()) {
      return NextResponse.json(
        { error: "source is required" },
        { status: 400 }
      );
    }

    if (Buffer.byteLength(source, "utf8") > 500_000) {
      return NextResponse.json(
        { error: "Source is too large." },
        { status: 413 }
      );
    }

    const analysis = analyzeSource(source, filename);
    const report = buildSecurityReport(analysis);

    return NextResponse.json({
      ok: true,
      report,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to generate security report." },
      { status: 400 }
    );
  }
}
EOF

# ============================================================
# 9. PROVIDER-READY AI ASSISTANT
# ============================================================

log "Upgrading AI assistant..."

cat > src/lib/ai-assistant.ts <<'EOF'
import type { Finding } from "./security-engine";

interface AIRequest {
  question: string;
  findings?: Finding[];
  source?: string;
}

function localAnswer(input: AIRequest) {
  const findings = input.findings || [];

  if (!findings.length) {
    return {
      mode: "local",
      answer:
        "No rule-based findings were supplied. Ask me about secure coding, threat modeling, validation, authentication, secrets, injection prevention, or upload a finding for targeted remediation.",
    };
  }

  const top = findings[0];

  return {
    mode: "local",
    answer:
      `The highest-priority finding is ${top.title} (${top.severity.toUpperCase()}). ` +
      `${top.description} ` +
      `Impact: ${top.impact} ` +
      `Recommended fix: ${top.remediation}`,
    finding: top,
  };
}

export async function askAssistant(input: AIRequest) {
  const apiKey = process.env.AI_API_KEY;
  const baseUrl =
    process.env.AI_BASE_URL ||
    "https://api.openai.com/v1/chat/completions";
  const model = process.env.AI_MODEL || "gpt-4o-mini";

  /*
   * Provider-ready mode is deliberately opt-in.
   * Without AI_API_KEY, SAIFRVW remains fully functional
   * through its local security assistant.
   */
  if (!apiKey) {
    return localAnswer(input);
  }

  const prompt = [
    "You are SAIFRVW Sentinel, a defensive secure-code assistant.",
    "Give precise remediation guidance.",
    "Do not claim a vulnerability is exploitable without evidence.",
    "Prefer concrete secure coding changes.",
    "",
    `Question: ${input.question}`,
    "",
    "Findings:",
    JSON.stringify(input.findings || [], null, 2),
  ].join("\n");

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content:
            "You are a defensive application-security remediation assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    return {
      ...localAnswer(input),
      mode: "local-fallback",
    };
  }

  const data = await response.json();

  return {
    mode: "provider",
    answer:
      data?.choices?.[0]?.message?.content ||
      "The configured AI provider returned no answer.",
  };
}
EOF

cat > src/app/api/ai/route.ts <<'EOF'
import { NextResponse } from "next/server";
import { askAssistant } from "@/lib/ai-assistant";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const question =
      typeof body?.question === "string"
        ? body.question.slice(0, 4000)
        : "";

    if (!question.trim()) {
      return NextResponse.json(
        { error: "question is required" },
        { status: 400 }
      );
    }

    const result = await askAssistant({
      question,
      findings: Array.isArray(body?.findings)
        ? body.findings.slice(0, 50)
        : [],
      source:
        typeof body?.source === "string"
          ? body.source.slice(0, 100_000)
          : undefined,
    });

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch {
    return NextResponse.json(
      { error: "AI assistant request failed." },
      { status: 500 }
    );
  }
}
EOF

# ============================================================
# 10. SECURITY REPORT COMPONENT
# ============================================================

log "Creating report UI component..."

cat > src/components/SecurityReport.tsx <<'EOF'
"use client";

import type { Finding } from "@/lib/security-engine";

export default function SecurityReport({
  findings,
}: {
  findings: Finding[];
}) {
  const critical = findings.filter(
    (f) => f.severity === "critical"
  ).length;

  const high = findings.filter(
    (f) => f.severity === "high"
  ).length;

  return (
    <section className="mt-8 space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="text-xs uppercase text-red-300">
            Critical
          </div>
          <div className="mt-1 text-2xl font-bold">
            {critical}
          </div>
        </div>

        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
          <div className="text-xs uppercase text-orange-300">
            High
          </div>
          <div className="mt-1 text-2xl font-bold">
            {high}
          </div>
        </div>

        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
          <div className="text-xs uppercase text-indigo-300">
            Total
          </div>
          <div className="mt-1 text-2xl font-bold">
            {findings.length}
          </div>
        </div>
      </div>

      {findings.map((finding) => (
        <article
          key={`${finding.id}-${finding.line}`}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs text-slate-500">
                {finding.id} · {finding.cwe} · {finding.owasp}
              </div>

              <h3 className="mt-1 text-lg font-semibold">
                {finding.title}
              </h3>
            </div>

            <div className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase">
              {finding.severity}
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <div className="text-xs uppercase text-slate-500">
                Evidence
              </div>

              <pre className="mt-2 overflow-x-auto rounded-lg bg-black/40 p-3 text-xs text-slate-300">
                {finding.evidence}
              </pre>
            </div>

            <div>
              <div className="text-xs uppercase text-slate-500">
                Location
              </div>

              <p className="mt-2 text-sm text-slate-300">
                Line {finding.line}, column {finding.column}
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {finding.description}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4">
            <div className="text-xs uppercase text-emerald-300">
              Remediation
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              {finding.remediation}
            </p>

            <pre className="mt-3 overflow-x-auto rounded-lg bg-black/40 p-3 text-xs text-emerald-200">
              {finding.secureExample}
            </pre>
          </div>
        </article>
      ))}
    </section>
  );
}
EOF

# ============================================================
# 11. PRICING UI
# ============================================================

log "Refreshing pricing UI..."

cat > src/app/pricing/page.tsx <<'EOF'
import Link from "next/link";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <div className="text-sm font-semibold text-indigo-400">
            SAIFRVW SENTINEL
          </div>

          <h1 className="mt-4 text-4xl font-bold">
            Security that scales with you.
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Start free with powerful static analysis. Upgrade to Pro
            when you need deeper reports, AI assistance, and larger
            analysis workloads.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
            <div className="text-xl font-bold">Free</div>
            <div className="mt-3 text-4xl font-bold">$0</div>

            <ul className="mt-8 space-y-3 text-sm text-slate-300">
              <li>✓ Core vulnerability detection</li>
              <li>✓ CWE + OWASP mappings</li>
              <li>✓ Risk scoring</li>
              <li>✓ Remediation suggestions</li>
              <li>✓ Local AI assistant</li>
              <li>✓ Basic reports</li>
            </ul>

            <Link
              href="/review"
              className="mt-8 block rounded-xl border border-white/10 px-5 py-3 text-center font-semibold"
            >
              Start Free
            </Link>
          </section>

          <section className="rounded-3xl border border-indigo-400/30 bg-indigo-500/10 p-8 shadow-2xl shadow-indigo-500/10">
            <div className="text-sm font-semibold text-indigo-300">
              RECOMMENDED
            </div>

            <div className="mt-2 text-xl font-bold">
              Pro
            </div>

            <div className="mt-3 text-4xl font-bold">
              $12
              <span className="text-base font-normal text-slate-400">
                /month
              </span>
            </div>

            <ul className="mt-8 space-y-3 text-sm text-slate-200">
              <li>✓ Everything in Free</li>
              <li>✓ Advanced security reports</li>
              <li>✓ Provider-backed AI assistant</li>
              <li>✓ Larger analysis limits</li>
              <li>✓ Priority remediation insights</li>
              <li>✓ Export-ready reports</li>
              <li>✓ Team-ready architecture</li>
            </ul>

            <button
              disabled
              className="mt-8 w-full rounded-xl bg-indigo-500 px-5 py-3 font-semibold opacity-60"
            >
              Pro Billing Coming Soon
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}
EOF

# ============================================================
# 12. VALIDATION SCRIPT
# ============================================================

log "Checking generated files..."

REQUIRED_FILES=(
  "src/lib/security-engine.ts"
  "src/lib/remediation-engine.ts"
  "src/lib/report-engine.ts"
  "src/lib/ai-assistant.ts"
  "src/app/api/analyze/route.ts"
  "src/app/api/ai/route.ts"
  "src/app/api/report/route.ts"
  "src/components/SecurityReport.tsx"
  "src/app/pricing/page.tsx"
)

for file in "${REQUIRED_FILES[@]}"; do
  [ -s "$file" ] || die "Required file missing or empty: $file"
done

ok "All generated files exist."

# ============================================================
# 13. LINT
# ============================================================

log "Running ESLint..."

npm run lint

ok "Lint passed."

# ============================================================
# 14. TYPESCRIPT
# ============================================================

log "Running TypeScript..."

./node_modules/.bin/tsc --noEmit

ok "TypeScript passed."

# ============================================================
# 15. PRODUCTION BUILD
# ============================================================

log "Running production build..."

rm -rf .next

npm run build

ok "Production build passed."

# ============================================================
# 16. ROUTE VALIDATION
# ============================================================

log "Checking expected routes..."

BUILD_OUTPUT="$(find .next/server/app -type f 2>/dev/null || true)"

echo "$BUILD_OUTPUT" | grep -q "page.js" \
  || die "Next build output missing page."

[ -d ".next/server/app/review" ] \
  || die "Review route missing from build."

[ -d ".next/server/app/docs" ] \
  || die "Docs route missing from build."

[ -d ".next/server/app/pricing" ] \
  || die "Pricing route missing from build."

[ -d ".next/server/app/api/analyze" ] \
  || die "Analyze API missing from build."

[ -d ".next/server/app/api/ai" ] \
  || die "AI API missing from build."

[ -d ".next/server/app/api/report" ] \
  || die "Report API missing from build."

ok "Expected routes exist in build."

# ============================================================
# 17. LOCAL API SMOKE TEST
# ============================================================

log "Starting temporary production server..."

PORT=3199
SMOKE_LOG="$ROOT/.sentinel-smoke-$STAMP.log"

npm run start -- -p "$PORT" >"$SMOKE_LOG" 2>&1 &
SERVER_PID=$!

cleanup_server() {
  if kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
  fi
}

trap 'cleanup_server' EXIT

sleep 5

kill -0 "$SERVER_PID" 2>/dev/null \
  || die "Next production server failed to start. See $SMOKE_LOG"

log "Testing /api/analyze..."

ANALYZE_RESPONSE="$(
  curl -fsS \
    -X POST \
    -H "Content-Type: application/json" \
    --data '{"filename":"test.ts","source":"const x = eval(userInput);"}' \
    "http://127.0.0.1:$PORT/api/analyze"
)"

echo "$ANALYZE_RESPONSE" | grep -q '"ok":true' \
  || die "Analyzer API smoke test failed."

echo "$ANALYZE_RESPONSE" | grep -q "S015" \
  || die "Analyzer did not detect expected dynamic-code finding."

ok "Analyzer API smoke test passed."

log "Testing /api/report..."

REPORT_RESPONSE="$(
  curl -fsS \
    -X POST \
    -H "Content-Type: application/json" \
    --data '{"filename":"test.ts","source":"const x = eval(userInput);"}' \
    "http://127.0.0.1:$PORT/api/report"
)"

echo "$REPORT_RESPONSE" | grep -q '"ok":true' \
  || die "Report API smoke test failed."

echo "$REPORT_RESPONSE" | grep -q '"remediationPlan"' \
  || die "Report remediation plan missing."

ok "Report API smoke test passed."

log "Testing /api/ai..."

AI_RESPONSE="$(
  curl -fsS \
    -X POST \
    -H "Content-Type: application/json" \
    --data '{"question":"How should I fix this?","findings":[{"id":"S015","title":"Dynamic Code Execution","severity":"critical","confidence":96,"description":"Dynamic execution","impact":"Code execution","remediation":"Remove eval","line":1,"column":1,"category":"Code Injection","cwe":"CWE-95","owasp":"A03:2021","evidence":"eval(userInput)","secureExample":"Use a lookup table","references":[]}]} ' \
    "http://127.0.0.1:$PORT/api/ai"
)"

echo "$AI_RESPONSE" | grep -q '"ok":true' \
  || die "AI API smoke test failed."

echo "$AI_RESPONSE" | grep -q '"answer"' \
  || die "AI assistant did not return an answer."

ok "AI API smoke test passed."

cleanup_server
trap - EXIT

# ============================================================
# 18. VERCEL SAFETY CHECK
# ============================================================

log "Checking Vercel linkage..."

if [ ! -f ".vercel/project.json" ]; then
  die ".vercel/project.json missing. Refusing deployment."
fi

VERCEL_PROJECT="$(node - <<'NODE'
const fs = require("fs");
const p = JSON.parse(fs.readFileSync(".vercel/project.json", "utf8"));
console.log(p.projectName || "");
NODE
)"

if [ "$VERCEL_PROJECT" != "$EXPECTED_PROJECT" ]; then
  die "Vercel project mismatch: expected $EXPECTED_PROJECT, got $VERCEL_PROJECT"
fi

ok "Vercel project confirmed: $EXPECTED_ORG/$EXPECTED_PROJECT"

# ============================================================
# 19. FINAL GIT DIFF SUMMARY
# ============================================================

log "Final change summary..."

git status --short || true

echo
echo "============================================================"
echo " ALL VALIDATION CHECKS PASSED"
echo "============================================================"
echo
echo "Backup:"
echo "  $BACKUP"
echo
echo "The following deployment is now allowed:"
echo "  $EXPECTED_ORG/$EXPECTED_PROJECT"
echo

# ============================================================
# 20. PRODUCTION DEPLOY
# ============================================================

log "Deploying ONLY duckx/saifrvw..."

./node_modules/.bin/vercel deploy --prod --yes

echo
echo "============================================================"
echo " SAIFRVW SENTINEL v5 DEPLOYED"
echo "============================================================"
echo
echo "Backup:"
echo "  $BACKUP"
echo
echo "Validation:"
echo "  ✓ ESLint"
echo "  ✓ TypeScript"
echo "  ✓ Production build"
echo "  ✓ Route validation"
echo "  ✓ Analyzer API"
echo "  ✓ Report API"
echo "  ✓ AI API"
echo "  ✓ Vercel project verification"
echo
echo "Deployment:"
echo "  ✓ duckx/saifrvw"
echo
echo "============================================================"
