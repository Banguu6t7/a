import { NextResponse } from "next/server";
import {
  analyzeSource,
  type Finding,
} from "@/lib/security-engine";
import { buildAssistantContext } from "@/lib/ai-assistant";

export const runtime = "nodejs";

type AIRequest = {
  message?: string;
  code?: string;
  language?: string;
  action?: string;
  finding?: Partial<Finding>;
};

function countBySeverity(findings: Finding[], severity: string): number {
  return findings.filter((finding) => finding.severity === severity).length;
}

function buildDynamicAnswer(
  message: string,
  language: string,
  findings: Finding[],
  riskScore: number,
  securityGrade: string
): string {
  const critical = countBySeverity(findings, "critical");
  const high = countBySeverity(findings, "high");
  const medium = countBySeverity(findings, "medium");
  const low = countBySeverity(findings, "low");

  if (!findings.length) {
    return [
      `I scanned the supplied ${language} code and found no matching Sentinel rules.`,
      `Current risk score is ${riskScore}/100 with security grade ${securityGrade}.`,
      `That does not prove the code is vulnerability-free; it means the current static rules did not identify a known pattern.`,
      message
        ? `For your request "${message.slice(0, 140)}", I would next recommend adding tests, dependency scanning, secret detection, and manual review.`
        : "A useful next step is dependency scanning, secret detection, and manual review.",
    ].join(" ");
  }

  const top = findings[0];

  const severitySummary = [
    critical ? `${critical} critical` : "",
    high ? `${high} high` : "",
    medium ? `${medium} medium` : "",
    low ? `${low} low` : "",
  ].filter(Boolean).join(", ");

  const topIssues = findings
    .slice(0, 3)
    .map(
      (finding, index) =>
        `${index + 1}) ${finding.title} on line ${finding.line}: ${finding.remediation}`
    )
    .join(" ");

  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("fix") ||
    normalizedMessage.includes("remediat") ||
    normalizedMessage.includes("secure")
  ) {
    return [
      `I reviewed the ${language} scan and focused on remediation rather than repeating the scan summary.`,
      `Risk is ${riskScore}/100 (${securityGrade}) with ${findings.length} detected issue(s): ${severitySummary}.`,
      `The first fix should address "${top.title}" on line ${top.line}.`,
      `Recommended fix: ${top.remediation}`,
      top.secureExample
        ? `A safer pattern is: ${top.secureExample}`
        : "",
      `After applying the change, run Sentinel again and confirm that the finding disappears.`,
    ].filter(Boolean).join(" ");
  }

  if (
    normalizedMessage.includes("why") ||
    normalizedMessage.includes("explain")
  ) {
    return [
      `The main reason this scan is risky is "${top.title}".`,
      `Sentinel classified it as ${top.severity} severity with ${top.confidence}% confidence.`,
      `${top.description}`,
      `Potential impact: ${top.impact}`,
      `The recommended remediation is: ${top.remediation}`,
    ].join(" ");
  }

  if (
    normalizedMessage.includes("priorit") ||
    normalizedMessage.includes("highest") ||
    normalizedMessage.includes("important")
  ) {
    return [
      `Prioritize "${top.title}" first because it is ${top.severity} severity and was detected with ${top.confidence}% confidence.`,
      `It appears on line ${top.line}.`,
      `Fix: ${top.remediation}`,
      findings.length > 1
        ? `After that, review ${findings.length - 1} remaining finding(s), starting with the highest severity.`
        : "There are no additional findings in this scan.",
    ].join(" ");
  }

  return [
    `I analyzed this ${language} submission with Sentinel v5.2.`,
    `The current risk score is ${riskScore}/100 and the security grade is ${securityGrade}.`,
    `I detected ${findings.length} finding(s): ${severitySummary}.`,
    `The most important issue is "${top.title}" on line ${top.line}.`,
    `Why it matters: ${top.impact}`,
    `Recommended action: ${top.remediation}`,
    `Scan highlights: ${topIssues}`,
    message
      ? `Your request was "${message.slice(0, 140)}", so the response is based on the current scan rather than a fixed canned answer.`
      : "",
  ].filter(Boolean).join(" ");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AIRequest;

    const message =
      typeof body.message === "string"
        ? body.message
        : typeof body.action === "string"
          ? body.action
          : "Explain the current security findings.";

    const code =
      typeof body.code === "string"
        ? body.code
        : "";

    const language =
      typeof body.language === "string" && body.language.trim()
        ? body.language
        : "auto";

    if (!message.trim() && !body.finding) {
      return NextResponse.json(
        { error: "Message or finding is required." },
        { status: 400 }
      );
    }

    let analysis: ReturnType<typeof analyzeSource> | null = null;

    if (code.trim()) {
      analysis = analyzeSource(code, language);
    }

    let findings: Finding[] = analysis?.findings ?? [];

    /*
     * Compatibility with older UI requests that send a single finding.
     * We deliberately do not cast it to Finding because the old payload
     * may not contain the full security-engine Finding contract.
     */
    if (!analysis && body.finding) {
      const legacy = body.finding;

      const compatibleFinding: Finding = {
        id: typeof legacy.id === "string" ? legacy.id : "CUSTOM",
        title:
          typeof legacy.title === "string"
            ? legacy.title
            : "Security finding",
        severity:
          typeof legacy.severity === "string"
            ? legacy.severity
            : "medium",
        confidence:
          typeof legacy.confidence === "number"
            ? legacy.confidence
            : 50,
        line:
          typeof legacy.line === "number"
            ? legacy.line
            : 1,
        category:
          typeof legacy.category === "string"
            ? legacy.category
            : "Security",
        cwe:
          typeof legacy.cwe === "string"
            ? legacy.cwe
            : "N/A",
        owasp:
          typeof legacy.owasp === "string"
            ? legacy.owasp
            : "N/A",
        evidence:
          typeof legacy.evidence === "string"
            ? legacy.evidence
            : "",
        description:
          typeof legacy.description === "string"
            ? legacy.description
            : "Security issue supplied by the client.",
        impact:
          typeof legacy.impact === "string"
            ? legacy.impact
            : "Potential security impact depends on attacker-controlled input.",
        attackScenario:
          typeof legacy.attackScenario === "string"
            ? legacy.attackScenario
            : "",
        remediation:
          typeof legacy.remediation === "string"
            ? legacy.remediation
            : "Review the affected code and apply a secure implementation.",
        secureExample:
          typeof legacy.secureExample === "string"
            ? legacy.secureExample
            : undefined,
      };

      findings = [compatibleFinding];
    }

    const riskScore = analysis?.riskScore ?? 0;
    const securityGrade = analysis?.securityGrade ?? "N/A";

    const context = buildAssistantContext(
      code,
      findings
    );

    const answer = buildDynamicAnswer(
      message,
      language,
      findings,
      riskScore,
      securityGrade
    );

    return NextResponse.json({
      ok: true,
      provider: process.env.AI_PROVIDER || "local-sentinel",
      engine: "SAIFRVW SENTINEL v5.2",
      answer,
      contextReady: Boolean(context),
      analysis,
    });
  } catch (error) {
    console.error("AI route error:", error);

    return NextResponse.json(
      { error: "AI assistant request failed." },
      { status: 400 }
    );
  }
}
