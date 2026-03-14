"use client";

import { useEffect, useState } from "react";

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

interface HealthPayload {
  status: "ok" | "warning" | "failed";
  summary: {
    checks: number;
    errors: number;
    warnings: number;
  };
  checks: CheckerResult[];
  generatedAt: string;
}

const statusColor: Record<HealthPayload["status"], string> = {
  ok: "text-green-600 dark:text-green-400",
  warning: "text-amber-600 dark:text-amber-400",
  failed: "text-red-600 dark:text-red-400",
};

export default function SystemHealthPage() {
  const [data, setData] = useState<HealthPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/system/health", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const payload = (await response.json()) as HealthPayload;
        setData(payload);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load health report";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  if (loading) {
    return <div className="p-6 text-foreground">Loading system health...</div>;
  }

  if (error || !data) {
    return <div className="p-6 text-red-600 dark:text-red-400">Failed to load system health: {error}</div>;
  }

  return (
    <main className="min-h-screen bg-background p-6 text-foreground">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-xl border border-border bg-card p-5">
          <h1 className="text-2xl font-semibold">System Health</h1>
          <p className="mt-2 text-sm text-muted-foreground">AI debug checks for routes, environment, schema, layouts, and imports.</p>
          <p className={`mt-3 text-sm font-medium ${statusColor[data.status]}`}>Overall status: {data.status.toUpperCase()}</p>
          <p className="mt-1 text-xs text-muted-foreground">Generated at: {new Date(data.generatedAt).toLocaleString()}</p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Checks</p>
            <p className="mt-1 text-2xl font-semibold">{data.summary.checks}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Errors</p>
            <p className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-400">{data.summary.errors}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Warnings</p>
            <p className="mt-1 text-2xl font-semibold text-amber-600 dark:text-amber-400">{data.summary.warnings}</p>
          </div>
        </section>

        <section className="space-y-4">
          {data.checks.map((check) => (
            <article key={check.name} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-medium">{check.name}</h2>
                <span className={check.ok ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                  {check.ok ? "OK" : "ATTENTION"}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{check.summary}</p>

              {check.issues.length > 0 ? (
                <ul className="mt-3 space-y-2 text-sm">
                  {check.issues.map((issue, idx) => (
                    <li key={`${check.name}-${idx}`} className="rounded-md bg-muted px-3 py-2">
                      <span className={issue.severity === "error" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}>
                        [{issue.severity.toUpperCase()}]
                      </span>{" "}
                      {issue.message}
                      {issue.file ? <span className="text-muted-foreground"> ({issue.file})</span> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">No issues found.</p>
              )}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
