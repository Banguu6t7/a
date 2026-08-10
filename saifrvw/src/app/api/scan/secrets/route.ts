import { NextResponse } from "next/server";
import { scanSecrets } from "@/lib/security/secretScanner";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body.code !== "string") {
      return NextResponse.json(
        {
          ok: false,
          error: "Expected a string field named code.",
        },
        { status: 400 },
      );
    }

    if (body.code.length > 500_000) {
      return NextResponse.json(
        {
          ok: false,
          error: "Input is too large. Maximum size is 500 KB.",
        },
        { status: 413 },
      );
    }

    const findings = scanSecrets(body.code);

    return NextResponse.json({
      ok: true,
      findings,
      summary: {
        total: findings.length,
        critical: findings.filter((item) => item.severity === "critical").length,
        high: findings.filter((item) => item.severity === "high").length,
        medium: findings.filter((item) => item.severity === "medium").length,
      },
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid request.",
      },
      { status: 400 },
    );
  }
}
