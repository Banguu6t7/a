import { NextResponse } from "next/server";
import { analyzeSource } from "@/lib/security-engine";
import { buildSecurityReport } from "@/lib/report-engine";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const source =
      typeof body?.source === "string" ? body.source : "";

    const filename =
      typeof body?.filename === "string"
        ? body.filename
        : "untitled.ts";

    if (!source.trim()) {
      return NextResponse.json(
        { error: "source is required" },
        { status: 400 }
      );
    }

    if (Buffer.byteLength(source, "utf8") > 500_000) {
      return NextResponse.json(
        { error: "Source is too large." },
        { status: 413 }
      );
    }

    const analysis = analyzeSource(source, filename);
    const report = buildSecurityReport(analysis);

    return NextResponse.json({
      ok: true,
      report,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to generate security report." },
      { status: 400 }
    );
  }
}
