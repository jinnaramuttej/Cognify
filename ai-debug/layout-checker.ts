import * as fs from "fs";
import * as path from "path";

export type Severity = "error" | "warning";

export interface DebugIssue {
  severity: Severity;
  message: string;
  file?: string;
}

export interface CheckerResult {
  name: string;
  ok: boolean;
  issues: DebugIssue[];
  summary: string;
}

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, "src", "app");
const COMPONENTS_DIR = path.join(ROOT, "src", "components");

const EXPECTED_ROOT_LAYOUT = path.join("src", "app", "layout.tsx");
const ALLOWED_LAYOUTS = new Set([
  path.join("src", "app", "layout.tsx").replace(/\\/g, "/"),
  path.join("src", "app", "dashboard", "layout.tsx").replace(/\\/g, "/"),
  path.join("src", "app", "tests", "layout.tsx").replace(/\\/g, "/"),
]);

function walkFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  const out: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(fullPath));
      continue;
    }
    out.push(fullPath);
  }

  return out;
}

function findLayoutIssues(): DebugIssue[] {
  const issues: DebugIssue[] = [];
  const layouts = walkFiles(APP_DIR).filter((file) => file.endsWith(`${path.sep}layout.tsx`));

  const hasRootLayout = layouts.some(
    (filePath) => path.relative(ROOT, filePath).replace(/\\/g, "/") === EXPECTED_ROOT_LAYOUT.replace(/\\/g, "/")
  );

  if (!hasRootLayout) {
    issues.push({
      severity: "error",
      message: "Root layout missing: src/app/layout.tsx",
      file: "src/app/layout.tsx",
    });
  }

  for (const layoutFile of layouts) {
    const relative = path.relative(ROOT, layoutFile).replace(/\\/g, "/");
    if (!ALLOWED_LAYOUTS.has(relative)) {
      issues.push({
        severity: "warning",
        message: `Additional layout detected: ${relative}`,
        file: relative,
      });
    }
  }

  return issues;
}

function findDuplicateSingletons(): DebugIssue[] {
  const issues: DebugIssue[] = [];
  const files = walkFiles(COMPONENTS_DIR).filter((file) => file.endsWith(".tsx") || file.endsWith(".ts"));

  const singletonTargets = ["Navbar.tsx", "Footer.tsx", "Sidebar.tsx"];

  for (const target of singletonTargets) {
    const matches = files.filter((file) => path.basename(file) === target);
    if (matches.length > 1) {
      issues.push({
        severity: "error",
        message: `Duplicate navigation component detected: ${target} (${matches.length} files)`,
        file: matches.map((match) => path.relative(ROOT, match)).join(", "),
      });
    }
  }

  return issues;
}

function findDashboardLayoutIssues(): DebugIssue[] {
  const issues: DebugIssue[] = [];
  const dashboardPage = path.join(ROOT, "src", "app", "dashboard", "page.tsx");
  const dashboardLayout = path.join(ROOT, "src", "app", "dashboard", "layout.tsx");

  if (fs.existsSync(dashboardPage) && !fs.existsSync(dashboardLayout)) {
    issues.push({
      severity: "warning",
      message: "Dashboard page exists without dashboard layout.",
      file: "src/app/dashboard",
    });
  }

  return issues;
}

export function runLayoutChecker(): CheckerResult {
  const issues: DebugIssue[] = [];

  if (!fs.existsSync(APP_DIR)) {
    return {
      name: "Layouts",
      ok: false,
      issues: [
        {
          severity: "error",
          message: "src/app directory not found.",
          file: "src/app",
        },
      ],
      summary: "Layout scan failed.",
    };
  }

  issues.push(...findLayoutIssues());
  issues.push(...findDuplicateSingletons());
  issues.push(...findDashboardLayoutIssues());

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.length - errorCount;

  return {
    name: "Layouts",
    ok: errorCount === 0,
    issues,
    summary: `Layout checks complete (${errorCount} errors, ${warningCount} warnings).`,
  };
}
