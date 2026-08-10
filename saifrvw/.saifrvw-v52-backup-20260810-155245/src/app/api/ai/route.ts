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

    const answer = analysis
      ? [
          `I analyzed the supplied ${language} code with Sentinel v5.1.`,
          `Risk score: ${analysis.riskScore}/100.`,
          `Security grade: ${analysis.securityGrade}.`,
          `Detected ${analysis.findings.length} finding(s).`,
          critical.length
            ? `${critical.length} critical finding(s) should be fixed first.`
            : "No critical findings were detected.",
          high.length
            ? `${high.length} high-severity finding(s) should be addressed next.`
            : "No high-severity findings were detected.",
          analysis.findings[0]
            ? `Top issue: ${analysis.findings[0].title}. ${analysis.findings[0].remediation}`
            : "No matching rule-based vulnerabilities were detected."
        ].join(" ")
      : "Paste code into the analyzer and I can use its findings to guide the remediation workflow.";

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
