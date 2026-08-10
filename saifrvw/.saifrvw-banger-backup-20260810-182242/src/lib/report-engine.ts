import { buildRemediationPlan } from "./remediation-engine";
import type { Finding } from "./security-engine";

export function buildSecurityReport(
  analysis: {
    engine: string;
    language: string;
    scannedLines: number;
    findings: Finding[];
    counts: Record<string, number>;
    riskScore: number;
    securityGrade: string;
    summary: string;
  }
) {
  return {
    reportVersion: "1.0",
    generatedAt: new Date().toISOString(),
    engine: analysis.engine,
    language: analysis.language,
    scannedLines: analysis.scannedLines,
    summary: analysis.summary,
    riskScore: analysis.riskScore,
    securityGrade: analysis.securityGrade,
    counts: analysis.counts,
    findings: analysis.findings,
    remediation: buildRemediationPlan(analysis.findings)
  };
}
