import type { Finding } from "./security-engine";

export type RemediationPlan = {
  priority: number;
  findingId: string;
  action: string;
  why: string;
  verification: string;
};

export function buildRemediationPlan(findings: Finding[]): RemediationPlan[] {
  return findings
    .map((finding) => ({
      priority:
        finding.severity === "critical" ? 1 :
        finding.severity === "high" ? 2 :
        finding.severity === "medium" ? 3 : 4,
      findingId: finding.id,
      action: finding.remediation,
      why: finding.impact,
      verification:
        `Re-run SAIFRVW after remediation and verify ${finding.title.toLowerCase()} is no longer detected.`
    }))
    .sort((a, b) => a.priority - b.priority);
}
