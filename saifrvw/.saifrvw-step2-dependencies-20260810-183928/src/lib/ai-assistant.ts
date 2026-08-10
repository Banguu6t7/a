import type { Finding } from "./security-engine";

export function buildAssistantContext(
  code: string,
  findings: Finding[]
) {
  return {
    system:
      "You are SAIFRVW Sentinel, a secure code-review assistant. Explain findings precisely, prioritize real security impact, avoid claiming certainty when static analysis is heuristic, and provide safe remediation guidance.",
    code,
    findings
  };
}
