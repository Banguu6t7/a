import { NextResponse } from "next/server";
import { analyzeSource } from "@/lib/security-engine";
import { buildRemediationPlan } from "@/lib/remediation-engine";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const source =
      typeof body?.code === "string" ? body.code : "";

    const language =
      typeof body?.language === "string"
        ? body.language
        : "auto";

    if (!source.trim()) {
      return NextResponse.json(
        { error: "Code input is required." },
        { status: 400 }
      );
    }

    if (source.length > 500_000) {
      return NextResponse.json(
        { error: "Input exceeds the 500KB analysis limit." },
        { status: 413 }
      );
    }

    const analysis = analyzeSource(source, language);

    return NextResponse.json({
      ok: true,
      analysis,
      remediation: buildRemediationPlan(analysis.findings)
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to analyze the submitted source." },
      { status: 400 }
    );
  }
}
