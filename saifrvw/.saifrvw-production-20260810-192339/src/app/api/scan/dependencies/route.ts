import { NextResponse } from "next/server";
import { scanDependencies } from "@/lib/security/dependencyScanner";

export const runtime = "nodejs";

export async function POST() {
  try {
    const result = scanDependencies(process.cwd());

    return NextResponse.json(result, {
      status: result.ok ? 200 : 500,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Dependency scan failed.";

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
