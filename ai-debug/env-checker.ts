import * as dotenv from "dotenv";

export type Severity = "error" | "warning";

export interface DebugIssue {
  severity: Severity;
  message: string;
}

export interface CheckerResult {
  name: string;
  ok: boolean;
  issues: DebugIssue[];
  summary: string;
}

dotenv.config();

const REQUIRED_ENV = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

const FALLBACKS: Record<string, string[]> = {
  SUPABASE_URL: ["NEXT_PUBLIC_SUPABASE_URL"],
  SUPABASE_ANON_KEY: ["NEXT_PUBLIC_SUPABASE_ANON_KEY"],
};

function isPresent(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function runEnvChecker(): CheckerResult {
  const issues: DebugIssue[] = [];

  for (const key of REQUIRED_ENV) {
    const primaryValue = process.env[key];
    if (isPresent(primaryValue)) continue;

    const fallbackKeys = FALLBACKS[key] ?? [];
    const fallbackFound = fallbackKeys.find((fallback) => isPresent(process.env[fallback]));

    if (fallbackFound) {
      issues.push({
        severity: "warning",
        message: `Missing ${key}, but ${fallbackFound} is set (compat mode).`,
      });
      continue;
    }

    issues.push({
      severity: "error",
      message: `Missing ${key}.`,
    });
  }

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.length - errorCount;

  return {
    name: "Environment",
    ok: errorCount === 0,
    issues,
    summary: `${REQUIRED_ENV.length} required keys checked (${errorCount} errors, ${warningCount} warnings). AI provider uses local Ollama model ${process.env.OLLAMA_MODEL || 'phi3'}.`,
  };
}
