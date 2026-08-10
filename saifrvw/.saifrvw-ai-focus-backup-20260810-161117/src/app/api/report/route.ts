import { NextResponse } from "next/server";
import { buildSecurityReport } from "@/lib/report-engine";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const analysis = await request.json();

    if (!analysis || !Array.isArray(analysis.findings)) {
      return NextResponse.json(
        { error: "Valid analysis data is required." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      report: buildSecurityReport(analysis)
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to generate security report." },
      { status: 400 }
    );
  }
}
