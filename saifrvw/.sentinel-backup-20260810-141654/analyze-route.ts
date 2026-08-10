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
