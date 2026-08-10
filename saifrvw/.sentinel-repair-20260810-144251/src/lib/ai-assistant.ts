import type { Finding } from "./security-engine";

interface AIRequest {
  question: string;
  findings?: Finding[];
  source?: string;
}

function localAnswer(input: AIRequest) {
  const findings = input.findings || [];

  if (!findings.length) {
    return {
      mode: "local",
      answer:
        "No rule-based findings were supplied. Ask me about secure coding, threat modeling, validation, authentication, secrets, injection prevention, or upload a finding for targeted remediation.",
    };
  }

  const top = findings[0];

  return {
    mode: "local",
    answer:
      `The highest-priority finding is ${top.title} (${top.severity.toUpperCase()}). ` +
      `${top.description} ` +
      `Impact: ${top.impact} ` +
      `Recommended fix: ${top.remediation}`,
    finding: top,
  };
}

export async function askAssistant(input: AIRequest) {
  const apiKey = process.env.AI_API_KEY;
  const baseUrl =
    process.env.AI_BASE_URL ||
    "https://api.openai.com/v1/chat/completions";
  const model = process.env.AI_MODEL || "gpt-4o-mini";

  /*
   * Provider-ready mode is deliberately opt-in.
   * Without AI_API_KEY, SAIFRVW remains fully functional
   * through its local security assistant.
   */
  if (!apiKey) {
    return localAnswer(input);
  }

  const prompt = [
    "You are SAIFRVW Sentinel, a defensive secure-code assistant.",
    "Give precise remediation guidance.",
    "Do not claim a vulnerability is exploitable without evidence.",
    "Prefer concrete secure coding changes.",
    "",
    `Question: ${input.question}`,
    "",
    "Findings:",
    JSON.stringify(input.findings || [], null, 2),
  ].join("\n");

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content:
            "You are a defensive application-security remediation assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    return {
      ...localAnswer(input),
      mode: "local-fallback",
    };
  }

  const data = await response.json();

  return {
    mode: "provider",
    answer:
      data?.choices?.[0]?.message?.content ||
      "The configured AI provider returned no answer.",
  };
}
