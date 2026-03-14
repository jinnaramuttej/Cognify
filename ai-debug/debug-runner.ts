#!/usr/bin/env ts-node

import { runEnvChecker } from "./env-checker";
import { runSchemaChecker } from "./schema-checker";
import { runRouteChecker } from "./route-checker";
import { runLayoutChecker } from "./layout-checker";
import { runImportChecker } from "./import-checker";

type Severity = "error" | "warning";

interface DebugIssue {
  severity: Severity;
  message: string;
  file?: string;
}

interface CheckerResult {
  name: string;
  ok: boolean;
  issues: DebugIssue[];
  summary: string;
}

function statusLine(result: CheckerResult): string {
  if (result.ok && result.issues.length === 0) {
    return `${result.name}: OK`;
  }

  const errors = result.issues.filter((issue) => issue.severity === "error").length;
  const warnings = result.issues.length - errors;

  if (errors > 0) {
    return `${result.name}: ${errors} error(s), ${warnings} warning(s)`;
  }

  return `${result.name}: ${warnings} warning(s)`;
}

function printIssues(result: CheckerResult): void {
  if (result.issues.length === 0) return;

  console.log(`\n${result.name} details:`);
  for (const issue of result.issues) {
    const marker = issue.severity === "error" ? "ERROR" : "WARN";
    const location = issue.file ? ` (${issue.file})` : "";
    console.log(`- [${marker}] ${issue.message}${location}`);
  }
}

function main(): void {
  const results: CheckerResult[] = [
    runEnvChecker(),
    runSchemaChecker(),
    runRouteChecker(),
    runLayoutChecker(),
    runImportChecker(),
  ];

  const totalErrors = results
    .flatMap((result) => result.issues)
    .filter((issue) => issue.severity === "error").length;

  const totalWarnings = results
    .flatMap((result) => result.issues)
    .filter((issue) => issue.severity === "warning").length;

  console.log("\n=== Cognify AI Debug System ===");
  console.log("System health report:\n");

  for (const result of results) {
    console.log(`- ${statusLine(result)}`);
  }

  for (const result of results) {
    printIssues(result);
  }

  console.log("\nSummary:");
  console.log(`- Total errors: ${totalErrors}`);
  console.log(`- Total warnings: ${totalWarnings}`);
  console.log("\nFuture checks planned:");
  console.log("- Supabase RLS policy validation");
  console.log("- API endpoint validation");
  console.log("- AI rate limit monitoring");
  console.log("- Storage bucket validation");

  if (totalErrors > 0) {
    console.log("\nDebug status: FAILED");
    process.exit(1);
  }

  if (totalWarnings > 0) {
    console.log("\nDebug status: PASS_WITH_WARNINGS");
    process.exit(0);
  }

  console.log("\nDebug status: PASS");
  process.exit(0);
}

main();
