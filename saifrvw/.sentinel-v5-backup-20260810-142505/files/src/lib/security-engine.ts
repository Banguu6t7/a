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
