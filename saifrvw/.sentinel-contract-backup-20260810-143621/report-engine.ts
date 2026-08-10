
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
