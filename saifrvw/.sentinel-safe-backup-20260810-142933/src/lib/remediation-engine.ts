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
