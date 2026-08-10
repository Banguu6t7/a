import { NextResponse } from "next/server";
import { buildAssistantContext } from "@/lib/ai-assistant";
import { analyzeSource } from "@/lib/security-engine";

export const runtime = "nodejs";

type Finding = {
  id: string;
  title: string;
  severity: string;
  remediation: string;
  description: string;
  impact: string;
  evidence: string;
  line?: number;
};

function pick<T>(items: T[], seed: number): T {
  return items[Math.abs(seed) % items.length];
}

function makeSeed(message: string, findings: Finding[]): number {
  const input =
    message +
    findings.map((f) => `${f.id}:${f.title}:${f.severity}`).join("|");

  let hash = 0;

  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }

  return Math.abs(hash);
}

function buildDynamicAnswer(
  message: string,
  language: string,
  findings: Finding[],
  riskScore: number,
  securityGrade: string
): string {
  if (!findings.length) {
    const cleanResponses = [
      `I scanned the ${language} source and did not detect any vulnerabilities covered by the current Sentinel rules. The current risk score is ${riskScore}/100 with grade ${securityGrade}. Keep the code covered by tests and re-scan after security-sensitive changes.`,
      `Sentinel found no matching security findings in this scan. Risk is currently ${riskScore}/100 (${securityGrade}). That does not prove the code is vulnerability-free, but it means the active rules found nothing actionable.`,
      `This scan is clean under the current Sentinel rule set: ${riskScore}/100 risk and grade ${securityGrade}. For stronger assurance, combine static analysis with dependency, runtime, and penetration testing.`,
    ];

    return pick(cleanResponses, makeSeed(message, findings));
  }

  const critical = findings.filter((f) => f.severity === "critical");
  const high = findings.filter((f) => f.severity === "high");
  const medium = findings.filter((f) => f.severity === "medium");
  const low = findings.filter((f) => f.severity === "low");

  const top = findings[0];
  const seed = makeSeed(message, findings);

  const openings = [
    `I reviewed the ${language} findings against your request.`,
    `I checked the current Sentinel results and focused on the issue you asked about.`,
    `I analyzed the current security findings and prioritized the most important remediation path.`,
    `I looked at the scan results rather than returning a generic security response.`,
  ];

  const priority =
    critical.length > 0
      ? `The first priority is ${critical.length} critical finding${critical.length === 1 ? "" : "s"}: ${critical.map((f) => f.title).join(", ")}.`
      : high.length > 0
        ? `The highest current priority is ${high.length} high-severity finding${high.length === 1 ? "" : "s"}: ${high.map((f) => f.title).join(", ")}.`
        : `The most important remaining issue is ${top.title}.`;

  const detail =
    message.toLowerCase().includes("fix") ||
    message.toLowerCase().includes("remediat") ||
    message.toLowerCase().includes("solve")
      ? `For ${top.title}, the recommended remediation is: ${top.remediation}`
      : `The main issue is ${top.title}. ${top.description} ${top.impact}`;

  const nextSteps = [
    `Start with the highest-severity finding, apply the recommended remediation, and run the scan again.`,
    `After fixing that issue, re-run Sentinel and confirm that the finding disappears rather than only being suppressed.`,
    `Then review the remaining findings in severity order and add a regression test for the vulnerable behavior.`,
    `Do not treat the risk score alone as proof of security; validate the actual fix with tests and a second scan.`,
  ];

  const distribution = [
    `Current distribution: ${critical.length} critical, ${high.length} high, ${medium.length} medium, and ${low.length} low.`,
    `The current scan contains ${findings.length} total finding${findings.length === 1 ? "" : "s"} across the active security rules.`,
    `Sentinel currently reports ${findings.length} actionable finding${findings.length === 1 ? "" : "s"} with a risk score of ${riskScore}/100.`,
  ];

  return [
    pick(openings, seed),
    `Risk score: ${riskScore}/100. Security grade: ${securityGrade}.`,
    distribution[seed % distribution.length],
    priority,
    detail,
    pick(nextSteps, seed + 1),
  ].join(" ");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const message =
      typeof body?.message === "string"
        ? body.message
        : "";

    const code =
      typeof body?.code === "string"
        ? body.code
        : "";

    const language =
      typeof body?.language === "string"
        ? body.language
        : "auto";

    if (!message.trim()) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const analysis = code
      ? analyzeSource(code, language)
      : null;

    const findings: Finding[] =
      analysis?.findings ?? [];

    const context = buildAssistantContext(
      code,
      findings
    );

    const answer = analysis
      ? buildDynamicAnswer(
          message,
          language,
          findings,
          analysis.riskScore,
          analysis.securityGrade
        )
      : [
          "I am ready to help with your security review.",
          "Paste the source code and ask a specific question about a vulnerability, remediation, risk, or secure implementation.",
          "I will base the response on the submitted code and Sentinel findings instead of returning a fixed canned answer.",
        ].join(" ");

    return NextResponse.json({
      ok: true,
      provider: process.env.AI_PROVIDER || "local-sentinel",
      answer,
      contextReady: Boolean(context),
      analysis,
    });
  } catch {
    return NextResponse.json(
      { error: "AI assistant request failed." },
      { status: 400 }
    );
  }
}
