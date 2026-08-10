export type SecretSeverity = "critical" | "high" | "medium";

export type SecretFinding = {
  type: string;
  severity: SecretSeverity;
  line: number;
  column: number;
  masked: string;
  description: string;
  remediation: string;
};

type Pattern = {
  type: string;
  severity: SecretSeverity;
  description: string;
  remediation: string;
  regex: RegExp;
};

const PATTERNS: Pattern[] = [
  {
    type: "AWS Access Key",
    severity: "critical",
    description: "Possible AWS access key identifier detected.",
    remediation: "Rotate the credential immediately and move it to a secure secret store.",
    regex: /\bAKIA[0-9A-Z]{16}\b/g,
  },
  {
    type: "GitHub Token",
    severity: "critical",
    description: "Possible GitHub personal access token detected.",
    remediation: "Revoke the token and replace it with a short-lived credential.",
    regex: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g,
  },
  {
    type: "Private Key",
    severity: "critical",
    description: "Private key material detected.",
    remediation: "Remove the key from source control and rotate the affected credential.",
    regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g,
  },
  {
    type: "JWT",
    severity: "high",
    description: "Possible JSON Web Token detected.",
    remediation: "Do not commit bearer tokens. Rotate the token if it is active.",
    regex: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
  },
  {
    type: "Generic API Key",
    severity: "high",
    description: "Possible hard-coded API key detected.",
    remediation: "Move the credential into environment variables or a secret manager.",
    regex: /\b(?:api[_-]?key|apikey)\s*[:=]\s*["'][^"'\n]{12,}["']/gi,
  },
  {
    type: "Generic Secret",
    severity: "high",
    description: "Possible hard-coded secret detected.",
    remediation: "Remove the secret from source and rotate it if exposed.",
    regex: /\b(?:secret|password|passwd|token)\s*[:=]\s*["'][^"'\n]{8,}["']/gi,
  },
];

function mask(value: string): string {
  if (value.length <= 8) return "••••••••";

  return `${value.slice(0, 4)}${"•".repeat(
    Math.min(12, Math.max(4, value.length - 8)),
  )}${value.slice(-4)}`;
}

export function scanSecrets(source: string): SecretFinding[] {
  const findings: SecretFinding[] = [];

  for (const pattern of PATTERNS) {
    pattern.regex.lastIndex = 0;

    let match: RegExpExecArray | null;

    while ((match = pattern.regex.exec(source)) !== null) {
      const index = match.index;
      const before = source.slice(0, index);

      const line = before.split("\n").length;
      const lastNewline = before.lastIndexOf("\n");
      const column = index - lastNewline;

      findings.push({
        type: pattern.type,
        severity: pattern.severity,
        line,
        column,
        masked: mask(match[0]),
        description: pattern.description,
        remediation: pattern.remediation,
      });

      if (match[0].length === 0) {
        pattern.regex.lastIndex += 1;
      }
    }
  }

  return findings.sort((a, b) => {
    const severity = {
      critical: 0,
      high: 1,
      medium: 2,
    };

    return severity[a.severity] - severity[b.severity] || a.line - b.line;
  });
}
