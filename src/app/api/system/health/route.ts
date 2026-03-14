import { NextResponse } from "next/server";
import { runEnvChecker } from "../../../../../ai-debug/env-checker";
import { runSchemaChecker } from "../../../../../ai-debug/schema-checker";
import { runRouteChecker } from "../../../../../ai-debug/route-checker";
import { runLayoutChecker } from "../../../../../ai-debug/layout-checker";
import { runImportChecker } from "../../../../../ai-debug/import-checker";

export async function GET() {
  try {
    const checks = [
      runRouteChecker(),
      runEnvChecker(),
      runSchemaChecker(),
      runLayoutChecker(),
      runImportChecker(),
    ];

    const errors = checks.flatMap((check) => check.issues).filter((issue) => issue.severity === "error").length;
    const warnings = checks.flatMap((check) => check.issues).filter((issue) => issue.severity === "warning").length;

    return NextResponse.json({
      status: errors > 0 ? "failed" : warnings > 0 ? "warning" : "ok",
      summary: {
        checks: checks.length,
        errors,
        warnings,
      },
      checks,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown debug runner error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
