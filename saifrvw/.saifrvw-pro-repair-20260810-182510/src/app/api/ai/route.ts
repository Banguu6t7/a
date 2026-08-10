import { NextRequest, NextResponse } from "next/server";

type FindingContext = {
  title: string;
  severity: string;
  description: string;
  remediation: string;
};

function clean(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function extractFinding(message: string): FindingContext {
  const title =
    message.match(/Selected finding:\s*([^\n]+)/i)?.[1]?.trim() ||
    "Security finding";

  const description =
    message.match(/Selected finding:[\s\S]*?\n([^\n]+)\nRemediation:/i)?.[1]?.trim() ||
    "The selected finding indicates potentially unsafe application behavior.";

  const remediation =
    message.match(/Remediation:\s*([\s\S]*)/i)?.[1]?.trim() ||
    "Validate untrusted input and use a safer implementation.";

  const severityMatch =
    message.match(/\b(critical|high|medium|low|info)\b/i)?.[1] || "unknown";

  return {
    title,
    severity: severityMatch.toLowerCase(),
    description,
    remediation,
  };
}

function detectSignals(code: string): string[] {
  const signals: string[] = [];

  if (/\beval\s*\(/i.test(code)) {
    signals.push("eval() / dynamic code execution");
  }

  if (/\bnew\s+Function\s*\(/i.test(code)) {
    signals.push("Function constructor / dynamic execution");
  }

  if (/\binnerHTML\s*=/i.test(code)) {
    signals.push("direct innerHTML assignment");
  }

  if (/\bdocument\.write\s*\(/i.test(code)) {
    signals.push("document.write()");
  }

  if (/\bSELECT\b[\s\S]{0,180}(\+|\$\{|`)/i.test(code)) {
    signals.push("SQL string construction");
  }

  if (/\b(SELECT|INSERT|UPDATE|DELETE)\b[\s\S]{0,180}\+\s*[A-Za-z_$]/i.test(code)) {
    signals.push("possible SQL input concatenation");
  }

  if (/\bfetch\s*\(\s*(req|request|user|input|params|query)/i.test(code)) {
    signals.push("request-controlled network destination");
  }

  if (/\bchild_process\b|\bexec\s*\(|\bspawn\s*\(/i.test(code)) {
    signals.push("process execution");
  }

  if (/\bprocess\.env\b/i.test(code)) {
    signals.push("environment/configuration access");
  }

  if (/\bpassword\b|\bsecret\b|\bapi[_-]?key\b/i.test(code)) {
    signals.push("possible sensitive credential handling");
  }

  return Array.from(new Set(signals));
}

function buildAnswer(
  message: string,
  code: string,
  language: string
): string {
  const finding = extractFinding(message);
  const signals = detectSignals(code);

  const title = finding.title || "Security finding";
  const severity = finding.severity || "unknown";

  let opening =
    `I reviewed the selected "${title}" finding against the supplied ${language} code. ` +
    `This is a ${severity}-severity issue according to Sentinel.`;

  let technical =
    finding.description ||
    "The analyzer identified behavior that may become dangerous when influenced by untrusted input.";

  let fix =
    finding.remediation ||
    "Replace the unsafe operation with a validated, parameterized, or otherwise constrained implementation.";

  let verification =
    "Re-run the Sentinel scan after the change and confirm that the finding disappears without introducing a new issue.";

  if (signals.length > 0) {
    technical += ` The submitted code also contains these relevant signals: ${signals.join(", ")}.`;
  }

  if (/dynamic code execution|eval/i.test(title)) {
    opening =
      `The selected finding is "${title}", and the supplied ${language} code contains dynamic execution behavior.`;

    technical =
      "The dangerous part is that executable code is being constructed or evaluated at runtime. " +
      "If any part of that value can be influenced by an attacker, arbitrary code execution can become possible.";

    fix =
      "Remove eval(), Function(), or equivalent dynamic execution. " +
      "If the input represents data, parse it as data using a strict format such as JSON and validate the resulting structure.";

    verification =
      "Scan again and test the same input with the dangerous value supplied externally. " +
      "The expected result is zero dynamic-code-execution findings.";
  } else if (/sql injection|sql/i.test(title)) {
    opening =
      `The selected finding is "${title}". Sentinel detected a SQL construction pattern that should not trust raw input.`;

    technical =
      "The risk occurs when user-controlled values are concatenated directly into SQL text. " +
      "An attacker may alter the structure of the query instead of supplying only a value.";

    fix =
      "Use parameterized queries or a trusted ORM API. " +
      "Keep SQL structure separate from user-controlled values and validate identifiers independently.";

    verification =
      "Re-run Sentinel and confirm the SQL injection finding is gone. " +
      "Then test with quotes, boolean expressions, and unexpected input to confirm the database layer still treats input as data.";
  } else if (/xss|cross.?site scripting|innerhtml/i.test(title)) {
    opening =
      `The selected finding is "${title}", and the code should treat externally controlled content as untrusted HTML.`;

    technical =
      "Directly inserting untrusted content into an HTML sink can allow attacker-controlled markup or script execution.";

    fix =
      "Prefer safe text rendering APIs. If HTML is genuinely required, sanitize it with a well-maintained sanitizer and apply an appropriate Content Security Policy.";

    verification =
      "Scan again and test the affected UI with harmless HTML/XSS test strings. Confirm they render as text rather than executable markup.";
  }

  const codePreview = code
    .split("\n")
    .slice(0, 8)
    .join("\n")
    .trim();

  return [
    opening,
    "",
    "Why it matters:",
    technical,
    "",
    "Recommended fix:",
    fix,
    "",
    "What I would check next:",
    verification,
    "",
    signals.length
      ? `Observed code signals: ${signals.join(", ")}`
      : "Observed code signals: none beyond the selected finding.",
    "",
    codePreview
      ? "Relevant submitted code preview:\n" + codePreview
      : "No code preview was supplied.",
  ].join("\n");
}


function buildFindingFocusedAnswer(
  message: string,
  code: string,
  language: string,
  selectedFinding: unknown
): string {
  const finding =
    selectedFinding && typeof selectedFinding === "object"
      ? selectedFinding as Record<string, unknown>
      : null;

  /*
   * No selected finding:
   * preserve the existing assistant behavior.
   */
  if (!finding) {
    return buildAnswer(message, code, language);
  }

  const read = (...keys: string[]): string => {
    for (const key of keys) {
      const value = finding[key];

      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }

      if (
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        return String(value);
      }
    }

    return "";
  };

  const title = read(
    "title",
    "name",
    "message",
    "description",
    "rule"
  );

  const severity = read(
    "severity",
    "level",
    "priority"
  ) || "unknown";

  const rule = read(
    "rule",
    "ruleId",
    "id",
    "type"
  );

  const evidence = read(
    "code",
    "snippet",
    "evidence",
    "matchedCode"
  );

  const line = read(
    "line",
    "lineNumber",
    "location"
  );

  const normalized = [
    title,
    rule,
    evidence,
    message
  ].join(" ").toLowerCase();

  /*
   * High-confidence eval() / dynamic-code-execution response.
   *
   * This intentionally does NOT discuss unrelated SQL, SSRF,
   * password logging, or other signals from the whole file.
   */
  if (
    /\beval\s*\(/i.test(normalized) ||
    /\beval\b/i.test(normalized) ||
    /dynamic.?code.?execution/i.test(normalized) ||
    /arbitrary.?code/i.test(normalized)
  ) {
    return [
      `Security finding: ${title || "Dynamic code execution via eval()"}`,
      "",
      `Severity: ${severity}.`,
      line ? `Location: ${line}.` : "",
      rule ? `Rule: ${rule}.` : "",
      "",
      "Why it matters:",
      "The selected finding shows dynamic JavaScript execution through eval(). If attacker-controlled input reaches eval(), that input can be interpreted as executable JavaScript rather than ordinary data.",
      "",
      "Evidence:",
      evidence || "eval(input)",
      "",
      "Recommended fix:",
      "Avoid eval() and other string-based code execution. Replace it with explicit functions, a fixed command map, structured parsing, or validated data handling.",
      "",
      "What to check next:",
      "Re-run the Sentinel scan after removing eval() and confirm that this finding disappears without introducing another dynamic-code-execution path.",
      "",
      "Selected-finding scope:",
      "This response is focused on the selected dynamic-code-execution finding."
    ]
      .filter(Boolean)
      .join("\n");
  }

  /*
   * Generic selected-finding response.
   *
   * Still focuses on the selected finding instead of dumping every
   * signal detected elsewhere in the submitted source.
   */
  return [
    `Security finding: ${title || "Selected security finding"}`,
    "",
    `Severity: ${severity}.`,
    line ? `Location: ${line}.` : "",
    rule ? `Rule: ${rule}.` : "",
    "",
    "Why it matters:",
    title
      ? `The selected finding indicates potentially unsafe behavior associated with ${title}.`
      : "The selected finding indicates potentially unsafe application behavior.",
    "",
    "Evidence:",
    evidence || "No isolated evidence was supplied with the selected finding.",
    "",
    "Recommended fix:",
    "Address the selected finding at its source and validate attacker-controlled input before it reaches the sensitive operation.",
    "",
    "What to check next:",
    "Re-run the Sentinel scan after the change and verify that the selected finding is resolved."
  ]
    .filter(Boolean)
    .join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const selectedFinding =
      body?.selectedFinding ??
      body?.finding ??
      body?.selected ??
      null;

    const message = clean(body?.message);
    const code = clean(body?.code);
    const language = clean(body?.language, "unknown");

    if (!message && !code) {
      return NextResponse.json(
        { error: "Message or code is required." },
        { status: 400 }
      );
    }

    const answer = buildFindingFocusedAnswer(
      message,
      code,
      language,
      selectedFinding
    );

    return NextResponse.json({
      ok: true,
      answer,
      engine: "SAIFRVW Sentinel Assistant v5.2",
      contextual: true,
    });
  } catch {
    return NextResponse.json(
      { error: "AI assistant could not process this request." },
      { status: 400 }
    );
  }
}
