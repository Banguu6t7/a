#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(pwd)"

echo
echo "============================================================"
echo " SAIFRVW SENTINEL ENGINE — ULTIMATE PRODUCT UPGRADE"
echo "============================================================"
echo

test -f package.json || {
  echo "ERROR: Run this from /workspaces/a/saifrvw"
  exit 1
}

mkdir -p \
  src/app/review \
  src/app/docs \
  src/app/pricing \
  src/app/api/analyze \
  src/app/api/ai \
  src/components \
  src/lib

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP=".sentinel-backup-$STAMP"

mkdir -p "$BACKUP"

echo "Backing up existing application files..."

cp -f src/app/page.tsx "$BACKUP/page.tsx" 2>/dev/null || true
cp -f src/app/globals.css "$BACKUP/globals.css" 2>/dev/null || true
cp -f src/app/api/analyze/route.ts "$BACKUP/analyze-route.ts" 2>/dev/null || true

echo "Backup: $BACKUP"

echo
echo "Installing required dependencies..."

npm install lucide-react

echo
echo "Creating security analysis engine..."

cat > src/lib/security-engine.ts <<'EOF'
export type Severity =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "info";

export type Finding = {
  id: string;
  title: string;
  severity: Severity;
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

type Rule = {
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
  attackScenario: string;
  remediation: string;
  secureExample?: string;
};

const rules: Rule[] = [
  {
    id: "SQLI-001",
    title: "Potential SQL Injection",
    severity: "critical",
    category: "Injection",
    cwe: "CWE-89",
    owasp: "A03:2021 Injection",
    confidence: 96,
    pattern:
      /(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE).*(\+|`|\$\{|\%s).*['"`]?/i,
    description:
      "User-controlled or dynamically constructed data appears to be combined with a SQL statement.",
    impact:
      "An attacker may manipulate the query to read, modify, or destroy database data.",
    attackScenario:
      "An attacker supplies SQL syntax through an input that becomes part of the database query.",
    remediation:
      "Use parameterized queries or a trusted ORM query API. Never concatenate untrusted values into SQL.",
    secureExample:
      "db.query('SELECT * FROM users WHERE username = ?', [username])",
  },

  {
    id: "CMD-001",
    title: "Potential Command Injection",
    severity: "critical",
    category: "Command Injection",
    cwe: "CWE-78",
    owasp: "A03:2021 Injection",
    confidence: 94,
    pattern:
      /(exec|execSync|spawn|spawnSync|system|popen)\s*\([^)]*(\+|`|\$\{)/i,
    description:
      "A process execution API appears to receive dynamically constructed input.",
    impact:
      "Attackers may execute operating-system commands with the application's privileges.",
    attackScenario:
      "Malicious shell metacharacters are injected into a value passed to a process execution function.",
    remediation:
      "Avoid shell execution where possible. Prefer safe argument arrays and strict allowlists.",
    secureExample:
      "spawn('git', ['status'], { shell: false })",
  },

  {
    id: "XSS-001",
    title: "Potential Cross-Site Scripting",
    severity: "high",
    category: "Cross-Site Scripting",
    cwe: "CWE-79",
    owasp: "A03:2021 Injection",
    confidence: 91,
    pattern:
      /(innerHTML|outerHTML|dangerouslySetInnerHTML|document\.write)\s*[=:]/i,
    description:
      "Raw HTML is being written into a document without visible output encoding.",
    impact:
      "An attacker may execute JavaScript in another user's browser.",
    attackScenario:
      "Attacker-controlled markup reaches an HTML sink and is interpreted by the browser.",
    remediation:
      "Prefer safe DOM APIs and framework escaping. Sanitize HTML when raw HTML is genuinely required.",
    secureExample:
      "element.textContent = userInput",
  },

  {
    id: "EVAL-001",
    title: "Dynamic Code Execution",
    severity: "critical",
    category: "Code Injection",
    cwe: "CWE-95",
    owasp: "A03:2021 Injection",
    confidence: 99,
    pattern: /\beval\s*\(|new\s+Function\s*\(/i,
    description:
      "The application dynamically evaluates executable code.",
    impact:
      "If attacker-controlled data reaches this sink, arbitrary code execution may occur.",
    attackScenario:
      "An attacker influences the string evaluated by the runtime.",
    remediation:
      "Remove dynamic code execution. Replace it with explicit functions, parsers, or allowlisted operations.",
  },

  {
    id: "SECRET-001",
    title: "Potential Hardcoded Secret",
    severity: "high",
    category: "Secrets Management",
    cwe: "CWE-798",
    owasp: "A07:2021 Identification and Authentication Failures",
    confidence: 89,
    pattern:
      /(api[_-]?key|secret|password|token|private[_-]?key)\s*[:=]\s*["'][^"']{8,}["']/i,
    description:
      "A credential-like value appears to be hardcoded in source code.",
    impact:
      "Credentials can leak through source control, logs, builds, or client bundles.",
    attackScenario:
      "A leaked repository or deployed bundle exposes the embedded credential.",
    remediation:
      "Move secrets into environment variables or a dedicated secret manager and rotate exposed credentials.",
    secureExample:
      "const apiKey = process.env.API_KEY",
  },

  {
    id: "TRAVERSAL-001",
    title: "Potential Path Traversal",
    severity: "high",
    category: "Path Traversal",
    cwe: "CWE-22",
    owasp: "A01:2021 Broken Access Control",
    confidence: 88,
    pattern:
      /(readFile|readFileSync|writeFile|unlink|unlinkSync|createReadStream)\s*\([^)]*(req\.|request\.|params|query|user)/i,
    description:
      "A filesystem operation appears to use request-controlled input.",
    impact:
      "Attackers may access or modify files outside the intended directory.",
    attackScenario:
      "Traversal sequences such as ../ are supplied through a file parameter.",
    remediation:
      "Resolve paths against a fixed base directory and enforce containment using canonical paths and allowlists.",
  },

  {
    id: "SSRF-001",
    title: "Potential Server-Side Request Forgery",
    severity: "high",
    category: "SSRF",
    cwe: "CWE-918",
    owasp: "A10:2021 Server-Side Request Forgery",
    confidence: 84,
    pattern:
      /(fetch|axios\.get|axios\.post|request|http\.get|https\.get)\s*\(\s*(req\.|request\.|params|query)/i,
    description:
      "A server-side HTTP client appears to consume request-controlled URLs.",
    impact:
      "Attackers may make the server access internal services or cloud metadata endpoints.",
    attackScenario:
      "An attacker supplies an internal URL such as a private IP or metadata endpoint.",
    remediation:
      "Use strict URL allowlists, block private address ranges, validate redirects, and restrict protocols.",
  },

  {
    id: "JWT-001",
    title: "Potential Unsafe JWT Configuration",
    severity: "high",
    category: "Authentication",
    cwe: "CWE-347",
    owasp: "A07:2021 Identification and Authentication Failures",
    confidence: 82,
    pattern:
      /(jwt\.verify|jsonwebtoken).*algorithms\s*:\s*\[[^\]]*(none|HS256)/i,
    description:
      "JWT verification configuration may permit a weak or unexpected algorithm.",
    impact:
      "Incorrect JWT validation can allow authentication bypass or token forgery.",
    attackScenario:
      "A crafted token is accepted because the verifier permits an unsafe algorithm.",
    remediation:
      "Explicitly allow the expected signing algorithm and validate issuer, audience, expiry, and key type.",
  },

  {
    id: "WEAKCRYPTO-001",
    title: "Weak Cryptographic Primitive",
    severity: "medium",
    category: "Cryptography",
    cwe: "CWE-327",
    owasp: "A02:2021 Cryptographic Failures",
    confidence: 90,
    pattern:
      /\b(md5|sha1|des|rc4)\s*\(/i,
    description:
      "A legacy cryptographic primitive appears in the source.",
    impact:
      "Weak primitives can reduce confidentiality or integrity guarantees.",
    attackScenario:
      "An attacker exploits collisions or weak cryptographic properties.",
    remediation:
      "Use modern primitives such as SHA-256/512 for hashing or authenticated encryption such as AES-GCM where appropriate.",
  },

  {
    id: "RANDOM-001",
    title: "Insecure Randomness",
    severity: "medium",
    category: "Cryptography",
    cwe: "CWE-338",
    owasp: "A02:2021 Cryptographic Failures",
    confidence: 85,
    pattern:
      /Math\.random\s*\(/i,
    description:
      "Math.random() is used in code where unpredictability may matter.",
    impact:
      "Predictable values can weaken tokens, identifiers, reset codes, or security decisions.",
    attackScenario:
      "An attacker predicts generated values and uses them to access protected functionality.",
    remediation:
      "Use a cryptographically secure random generator such as crypto.randomBytes or crypto.getRandomValues.",
  },

  {
    id: "LOG-001",
    title: "Potential Sensitive Data Exposure in Logs",
    severity: "medium",
    category: "Sensitive Data",
    cwe: "CWE-532",
    owasp: "A09:2021 Security Logging and Monitoring Failures",
    confidence: 80,
    pattern:
      /(console\.log|logger\.(info|debug|error))\s*\([^)]*(password|token|secret|authorization|cookie)/i,
    description:
      "Sensitive-looking data appears to be written to logs.",
    impact:
      "Secrets and personal information can leak through application logs.",
    attackScenario:
      "An attacker gains access to logs and recovers credentials or session material.",
    remediation:
      "Redact sensitive fields before logging and establish structured logging policies.",
  },

  {
    id: "CORS-001",
    title: "Potentially Unsafe CORS Policy",
    severity: "medium",
    category: "Configuration",
    cwe: "CWE-942",
    owasp: "A05:2021 Security Misconfiguration",
    confidence: 86,
    pattern:
      /(Access-Control-Allow-Origin|origin\s*:\s*["']\*["'])/i,
    description:
      "A permissive cross-origin policy was detected.",
    impact:
      "Overly broad CORS can expose authenticated resources to unintended origins.",
    attackScenario:
      "A malicious website interacts with a sensitive endpoint from an unauthorized origin.",
    remediation:
      "Use an explicit origin allowlist and avoid wildcard origins for credentialed APIs.",
  },

  {
    id: "DEBUG-001",
    title: "Debug Information Exposure",
    severity: "low",
    category: "Information Exposure",
    cwe: "CWE-215",
    owasp: "A05:2021 Security Misconfiguration",
    confidence: 78,
    pattern:
      /(debug\s*[:=]\s*true|NODE_ENV\s*=\s*["']development["'])/i,
    description:
      "Development/debug configuration appears in application code.",
    impact:
      "Debug behavior can expose internal implementation details.",
    attackScenario:
      "An attacker triggers a verbose error path and receives sensitive diagnostic information.",
    remediation:
      "Disable debug functionality in production and configure environments separately.",
  },
];

function lineNumber(code: string, index: number) {
  return code.slice(0, index).split("\n").length;
}

export function analyzeCode(code: string): Finding[] {
  const findings: Finding[] = [];

  for (const rule of rules) {
    const match = rule.pattern.exec(code);

    if (!match || match.index === undefined) continue;

    const line = lineNumber(code, match.index);
    const evidence =
      code.split("\n")[line - 1]?.trim().slice(0, 300) || "";

    findings.push({
      id: rule.id,
      title: rule.title,
      severity: rule.severity,
      confidence: rule.confidence,
      line,
      category: rule.category,
      cwe: rule.cwe,
      owasp: rule.owasp,
      evidence,
      description: rule.description,
      impact: rule.impact,
      attackScenario: rule.attackScenario,
      remediation: rule.remediation,
      secureExample: rule.secureExample,
    });
  }

  return findings;
}

export function calculateRisk(findings: Finding[]) {
  const weights: Record<Severity, number> = {
    critical: 30,
    high: 15,
    medium: 7,
    low: 2,
    info: 0,
  };

  const total = findings.reduce(
    (sum, finding) => sum + weights[finding.severity],
    0
  );

  const score = Math.max(0, Math.min(100, 100 - total));

  let grade = "A";

  if (score < 60) grade = "F";
  else if (score < 70) grade = "D";
  else if (score < 80) grade = "C";
  else if (score < 90) grade = "B";

  return {
    score,
    grade,
    critical: findings.filter((x) => x.severity === "critical").length,
    high: findings.filter((x) => x.severity === "high").length,
    medium: findings.filter((x) => x.severity === "medium").length,
    low: findings.filter((x) => x.severity === "low").length,
    info: findings.filter((x) => x.severity === "info").length,
  };
}
EOF

echo "Creating analyzer API..."

cat > src/app/api/analyze/route.ts <<'EOF'
import { NextRequest, NextResponse } from "next/server";
import { analyzeCode, calculateRisk } from "@/lib/security-engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const code = typeof body.code === "string" ? body.code : "";
    const language =
      typeof body.language === "string" ? body.language : "unknown";

    if (!code.trim()) {
      return NextResponse.json(
        { error: "No source code supplied." },
        { status: 400 }
      );
    }

    if (code.length > 250_000) {
      return NextResponse.json(
        { error: "Code exceeds the 250KB analysis limit." },
        { status: 413 }
      );
    }

    const findings = analyzeCode(code);
    const risk = calculateRisk(findings);

    return NextResponse.json({
      success: true,
      engine: "SENTINEL ENGINE v4",
      language,
      scannedBytes: Buffer.byteLength(code, "utf8"),
      lines: code.split("\n").length,
      findings,
      risk,
      summary: {
        totalFindings: findings.length,
        status: findings.some(
          (x) => x.severity === "critical" || x.severity === "high"
        )
          ? "ACTION_REQUIRED"
          : "PASS",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to analyze the supplied source code." },
      { status: 400 }
    );
  }
}
EOF

echo "Creating provider-ready AI API..."

cat > src/app/api/ai/route.ts <<'EOF'
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const finding = body.finding;
    const action = body.action || "explain";

    if (!finding) {
      return NextResponse.json(
        { error: "A finding is required." },
        { status: 400 }
      );
    }

    /*
     * Provider-ready architecture.
     *
     * Add an AI provider later through environment variables.
     *
     * Example:
     * AI_API_URL=
     * AI_API_KEY=
     * AI_MODEL=
     *
     * The frontend already works without the provider.
     */

    const configured =
      Boolean(process.env.AI_API_URL) &&
      Boolean(process.env.AI_API_KEY);

    if (!configured) {
      const responses: Record<string, string> = {
        explain:
          `${finding.title} was detected because ${finding.evidence || "the analyzed code matches a known security pattern"}. ` +
          `This maps to ${finding.cwe} and ${finding.owasp}. ` +
          `The primary risk is ${finding.impact}`,

        fix:
          `Recommended remediation: ${finding.remediation}`,

        secure:
          finding.secureExample ||
          `Replace the vulnerable operation with a parameterized, validated, and explicitly allowlisted implementation.`,

        prioritize:
          `${finding.severity.toUpperCase()} severity findings should be addressed according to their exploitability and exposure. ` +
          `Start with externally reachable critical/high findings before lower-risk code-quality issues.`,
      };

      return NextResponse.json({
        success: true,
        provider: "built-in-remediation",
        configured: false,
        action,
        answer:
          responses[action] ||
          responses.explain,
      });
    }

    /*
     * Generic OpenAI-compatible provider adapter.
     * This keeps SAIFRVW provider-neutral.
     */

    const prompt = `
You are the SAIFRVW Sentinel Security Assistant.

Analyze this static-analysis finding.

Title: ${finding.title}
Severity: ${finding.severity}
CWE: ${finding.cwe}
OWASP: ${finding.owasp}
Evidence: ${finding.evidence}
Description: ${finding.description}
Impact: ${finding.impact}
Existing remediation: ${finding.remediation}

Requested action: ${action}

Give a concise, technically precise security answer.
Include practical remediation and secure replacement guidance.
`;

    const response = await fetch(process.env.AI_API_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "default",
        messages: [
          {
            role: "system",
            content:
              "You are an expert application-security engineer.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("AI provider request failed.");
    }

    const data = await response.json();

    const answer =
      data?.choices?.[0]?.message?.content ||
      data?.output_text ||
      data?.response ||
      "The AI provider returned no usable response.";

    return NextResponse.json({
      success: true,
      provider: "external-ai",
      configured: true,
      action,
      answer,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "AI assistant unavailable.",
      },
      { status: 500 }
    );
  }
}
EOF

echo "Creating upgraded Analyzer UI..."

cat > src/app/review/page.tsx <<'EOF'
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
EOF

echo "Creating pricing page..."

cat > src/app/pricing/page.tsx <<'EOF'
import Link from "next/link";
import { Check, Shield, Sparkles } from "lucide-react";

const freeFeatures = [
  "Deep static analysis",
  "Core vulnerability detection",
  "Severity scoring",
  "CWE / OWASP mapping",
  "Basic remediation guidance",
  "Security report export",
];

const proFeatures = [
  "Everything in Free",
  "AI security assistant",
  "AI remediation generation",
  "Secure replacement suggestions",
  "Advanced security reports",
  "Scan history",
  "Priority analysis",
  "Higher scan limits",
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#08080d] text-white">
      <nav className="border-b border-white/10 bg-[#0b0b12]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Shield className="h-5 w-5 text-indigo-400" />
            SAIFRVW
          </Link>

          <Link
            href="/review"
            className="text-sm text-gray-400 hover:text-white"
          >
            Analyzer
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            Simple pricing
          </div>

          <h1 className="text-5xl font-bold tracking-tight">
            Security analysis for everyone.
          </h1>

          <p className="mt-5 text-gray-500">
            Start free. Upgrade when you need AI-powered remediation and
            advanced security workflows.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
          <Plan
            name="Free"
            price="$0"
            description="For learning, experimentation, and small projects."
            features={freeFeatures}
            href="/review"
          />

          <Plan
            name="Pro"
            price="$9"
            description="For developers who want deeper security assistance."
            features={proFeatures}
            href="/review"
            featured
          />
        </div>
      </div>
    </main>
  );
}

function Plan({
  name,
  price,
  description,
  features,
  href,
  featured,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  href: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-8 ${
        featured
          ? "border-indigo-500/40 bg-indigo-500/[0.06]"
          : "border-white/10 bg-[#101017]"
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{name}</h2>

        {featured && (
          <span className="rounded-full bg-indigo-500 px-3 py-1 text-[10px] font-bold">
            RECOMMENDED
          </span>
        )}
      </div>

      <div className="mt-7 flex items-end gap-2">
        <span className="text-5xl font-bold">{price}</span>
        {price !== "$0" && (
          <span className="mb-2 text-sm text-gray-500">/ month</span>
        )}
      </div>

      <p className="mt-4 min-h-12 text-sm leading-6 text-gray-500">
        {description}
      </p>

      <Link
        href={href}
        className={`mt-7 block rounded-xl px-4 py-3 text-center text-sm font-semibold ${
          featured
            ? "bg-indigo-500 hover:bg-indigo-600"
            : "border border-white/10 bg-white/5 hover:bg-white/10"
        }`}
      >
        {featured ? "Start Pro" : "Start Free"}
      </Link>

      <div className="mt-8 space-y-3">
        {features.map((feature) => (
          <div
            key={feature}
            className="flex gap-3 text-sm text-gray-400"
          >
            <Check className="h-4 w-4 shrink-0 text-emerald-400" />
            {feature}
          </div>
        ))}
      </div>
    </div>
  );
}
EOF

echo
echo "============================================================"
echo " VALIDATING SENTINEL ENGINE"
echo "============================================================"

npm run lint
npx tsc --noEmit

rm -rf .next
npm run build

echo
echo "============================================================"
echo " ROUTES"
echo "============================================================"

find src/app -maxdepth 4 -type f | sort

echo
echo "============================================================"
echo " BUILD COMPLETE"
echo "============================================================"

echo
echo "Expected routes:"
echo "  /"
echo "  /review"
echo "  /docs"
echo "  /pricing"
echo "  /api/analyze"
echo "  /api/ai"

echo
echo "Deploy with:"
echo "  ./node_modules/.bin/vercel deploy --prod --yes"

