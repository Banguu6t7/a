import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const finding = body.finding;
    const action = body.action || "explain";

    if (!finding) {
      return NextResponse.json(
        { error: "A finding is required." },
        { status: 400 }
      );
    }

    /*
     * Provider-ready architecture.
     *
     * Add an AI provider later through environment variables.
     *
     * Example:
     * AI_API_URL=
     * AI_API_KEY=
     * AI_MODEL=
     *
     * The frontend already works without the provider.
     */

    const configured =
      Boolean(process.env.AI_API_URL) &&
      Boolean(process.env.AI_API_KEY);

    if (!configured) {
      const responses: Record<string, string> = {
        explain:
          `${finding.title} was detected because ${finding.evidence || "the analyzed code matches a known security pattern"}. ` +
          `This maps to ${finding.cwe} and ${finding.owasp}. ` +
          `The primary risk is ${finding.impact}`,

        fix:
          `Recommended remediation: ${finding.remediation}`,

        secure:
          finding.secureExample ||
          `Replace the vulnerable operation with a parameterized, validated, and explicitly allowlisted implementation.`,

        prioritize:
          `${finding.severity.toUpperCase()} severity findings should be addressed according to their exploitability and exposure. ` +
          `Start with externally reachable critical/high findings before lower-risk code-quality issues.`,
      };

      return NextResponse.json({
        success: true,
        provider: "built-in-remediation",
        configured: false,
        action,
        answer:
          responses[action] ||
          responses.explain,
      });
    }

    /*
     * Generic OpenAI-compatible provider adapter.
     * This keeps SAIFRVW provider-neutral.
     */

    const prompt = `
You are the SAIFRVW Sentinel Security Assistant.

Analyze this static-analysis finding.

Title: ${finding.title}
Severity: ${finding.severity}
CWE: ${finding.cwe}
OWASP: ${finding.owasp}
Evidence: ${finding.evidence}
Description: ${finding.description}
Impact: ${finding.impact}
Existing remediation: ${finding.remediation}

Requested action: ${action}

Give a concise, technically precise security answer.
Include practical remediation and secure replacement guidance.
`;

    const response = await fetch(process.env.AI_API_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "default",
        messages: [
          {
            role: "system",
            content:
              "You are an expert application-security engineer.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("AI provider request failed.");
    }

    const data = await response.json();

    const answer =
      data?.choices?.[0]?.message?.content ||
      data?.output_text ||
      data?.response ||
      "The AI provider returned no usable response.";

    return NextResponse.json({
      success: true,
      provider: "external-ai",
      configured: true,
      action,
      answer,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "AI assistant unavailable.",
      },
      { status: 500 }
    );
  }
}
