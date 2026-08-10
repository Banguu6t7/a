import { NextRequest, NextResponse } from "next/server";
import { analyzeCode, calculateRisk } from "@/lib/security-engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const code = typeof body.code === "string" ? body.code : "";
    const language =
      typeof body.language === "string" ? body.language : "unknown";

    if (!code.trim()) {
      return NextResponse.json(
        { error: "No source code supplied." },
        { status: 400 }
      );
    }

    if (code.length > 250_000) {
      return NextResponse.json(
        { error: "Code exceeds the 250KB analysis limit." },
        { status: 413 }
      );
    }

    const findings = analyzeCode(code);
    const risk = calculateRisk(findings);

    return NextResponse.json({
      success: true,
      engine: "SENTINEL ENGINE v4",
      language,
      scannedBytes: Buffer.byteLength(code, "utf8"),
      lines: code.split("\n").length,
      findings,
      risk,
      summary: {
        totalFindings: findings.length,
        status: findings.some(
          (x) => x.severity === "critical" || x.severity === "high"
        )
          ? "ACTION_REQUIRED"
          : "PASS",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to analyze the supplied source code." },
      { status: 400 }
    );
  }
}
