import { NextResponse } from "next/server";
import { runStaticAnalysis } from "@/lib/analysis/static";
import { calculateScores, generateSummary } from "@/lib/analysis/engine";
import { generateId } from "@/lib/utils";

function detectLanguage(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();

  const map: Record<string, string> = {
    js: "javascript",
    jsx: "jsx",
    ts: "typescript",
    tsx: "tsx",
    py: "python",
    go: "go",
    rs: "rust",
    java: "java",
    rb: "ruby",
    php: "php",
    c: "c",
    cpp: "cpp",
    cs: "csharp",
    sql: "sql",
  };

  return map[ext || ""] || "text";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body?.code || typeof body.code !== "string") {
      return NextResponse.json(
        { error: "Code is required." },
        { status: 400 }
      );
    }

    if (body.code.length > 1024 * 1024) {
      return NextResponse.json(
        { error: "Code exceeds the 1 MB limit." },
        { status: 413 }
      );
    }

    const filename =
      typeof body.filename === "string" ? body.filename : "snippet.ts";

    const file = {
      id: generateId(),
      name: filename.split("/").pop() || filename,
      path: filename,
      language: detectLanguage(filename),
      content: body.code,
      size: Buffer.byteLength(body.code, "utf8"),
      lines: body.code.split("\n").length,
    };

    const findings = runStaticAnalysis([file]);
    const scores = calculateScores(findings);
    const summary = generateSummary(findings);

    return NextResponse.json({
      id: generateId(),
      status: "complete",
      files: [file],
      findings,
      scores,
      summary,
      language: file.language,
      createdAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to analyze the submitted code." },
      { status: 500 }
    );
  }
}
