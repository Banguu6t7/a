export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface Finding {
  id: string;
  title: string;
  severity: Severity;
  confidence: number;
  line: number;
  column?: number;
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
