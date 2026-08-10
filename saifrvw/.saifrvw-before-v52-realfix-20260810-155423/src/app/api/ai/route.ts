import { NextResponse } from "next/server";
import { buildAssistantContext } from "@/lib/ai-assistant";
import { analyzeSource } from "@/lib/security-engine";

export const runtime = "nodejs";

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

    const context = buildAssistantContext(
      code,
      analysis?.findings ?? []
    );

    /*
     * Provider-ready design:
     *
     * Set an AI provider on the server later.
     * Never expose provider API keys to the browser.
     *
     * Example environment variables:
     * AI_PROVIDER=openai
     * AI_API_KEY=...
     *
     * This route currently returns a deterministic fallback so
     * the UI remains functional without an external AI provider.
     */

    const critical =
      analysis?.findings.filter(
        (f) => f.severity === "critical"
      ) ?? [];

    const high =
      analysis?.findings.filter(
        (f) => f.severity === "high"
      ) ?? [];

    const findings = analysis?.findings ?? [];

const severityRank: Record<string, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1,
};

const sortedFindings = [...findings].sort(
  (a, b) =>
    (severityRank[b.severity] ?? 0) -
    (severityRank[a.severity] ?? 0)
);

const top = sortedFindings[0];

const question = message.toLowerCase();

let answer: string;

if (!analysis || !findings.length) {
  const cleanResponses = [
    `Sentinel scanned the supplied ${language} code and found no matching vulnerabilities in the current rule set. That is a clean scan result, but it is not a guarantee that the application is completely secure.`,
    `The current Sentinel rules did not detect a vulnerability in this ${language} sample. I would still review authentication, authorization, input validation, secrets, dependencies, and business logic.`,
    `No rule-based security findings were triggered by this sample. The code should still receive broader security testing before being considered production-safe.`,
  ];

  answer =
    cleanResponses[message.length % cleanResponses.length];
} else if (
  question.includes("fix") ||
  question.includes("solve") ||
  question.includes("remediat") ||
  question.includes("how")
) {
  answer = [
    `The highest-priority issue is ${top.title}, rated ${top.severity}.`,
    `It was detected around line ${top.line} with ${top.confidence}% confidence.`,
    `Why it matters: ${top.impact}`,
    `Recommended remediation: ${top.remediation}`,
    top.secureExample
      ? `Safer example: ${top.secureExample}`
      : "",
    `After applying the change, run Sentinel again and verify that ${top.id} disappears from the findings.`,
  ]
    .filter(Boolean)
    .join(" ");
} else if (
  question.includes("explain") ||
  question.includes("why") ||
  question.includes("danger")
) {
  answer = [
    `${top.title} is classified as ${top.severity} severity.`,
    `Sentinel detected it with ${top.confidence}% confidence at line ${top.line}.`,
    `Category: ${top.category}.`,
    `Potential impact: ${top.impact}`,
    `The relevant evidence is: ${top.evidence}`,
    `Recommended fix: ${top.remediation}`,
  ].join(" ");
} else if (
  question.includes("highest") ||
  question.includes("risk") ||
  question.includes("priority")
) {
  answer = [
    `Your highest-risk finding is ${top.title}.`,
    `Severity: ${top.severity}.`,
    `Confidence: ${top.confidence}%.`,
    `Line: ${top.line}.`,
    `CWE: ${top.cwe}.`,
    `Recommended action: ${top.remediation}`,
  ].join(" ");
} else {
  const responses = [
    `I found ${findings.length} security issue(s). The highest-priority one is ${top.title} at line ${top.line}.`,
    `Sentinel identified ${findings.length} finding(s). The main concern is ${top.title}, rated ${top.severity}.`,
    `The scan's most important issue is ${top.title}. Its potential impact is ${top.impact}`,
  ];

  answer =
    responses[message.length % responses.length] +
    ` ${top.remediation}`;
}

return NextResponse.json({
      ok: true,
      provider: process.env.AI_PROVIDER || "local-fallback",
      answer,
      contextReady: Boolean(context),
      analysis
    });
  } catch {
    return NextResponse.json(
      { error: "AI assistant request failed." },
      { status: 400 }
    );
  }
}
