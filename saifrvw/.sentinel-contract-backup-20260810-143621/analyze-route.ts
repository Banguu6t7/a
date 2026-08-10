import { NextRequest, NextResponse } from "next/server";
import { analyzeSource } from "@/lib/security-engine";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body || typeof body.code !== "string") {
      return NextResponse.json(
        {
          error: "Missing required field: code"
        },
        { status: 400 }
      );
    }

    if (body.code.length > 500_000) {
      return NextResponse.json(
        {
          error: "Code exceeds the 500 KB analysis limit."
        },
        { status: 413 }
      );
    }

    const result = analyzeSource(
      body.code,
      typeof body.language === "string" ? body.language : "auto"
    );

    return NextResponse.json({
      ok: true,
      ...result
    });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to analyze the supplied source."
      },
      { status: 400 }
    );
  }
}
