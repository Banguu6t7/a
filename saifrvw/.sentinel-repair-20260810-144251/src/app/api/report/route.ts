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
