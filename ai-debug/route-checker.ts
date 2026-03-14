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
const CONTRACTS_DIR = path.join(ROOT, "feature-contracts");

const REQUIRED_ROUTES = ["/tests/[testId]", "/tests/create"];
const IGNORED_DIR_NAMES = new Set(["api"]);

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  const out: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(fullPath));
      continue;
    }
    out.push(fullPath);
  }

  return out;
}

function walkDirs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  const out: string[] = [dir];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const fullPath = path.join(dir, entry.name);
    out.push(...walkDirs(fullPath));
  }

  return out;
}

function routeFromPageFile(pageFile: string): string {
  const relative = path.relative(APP_DIR, pageFile).replace(/\\/g, "/");
  const withoutPage = relative.replace(/\/page\.tsx$/, "");
  if (!withoutPage || withoutPage === "") return "/";
  return `/${withoutPage}`;
}

function findAppRoutes(): string[] {
  const files = walk(APP_DIR)
    .filter((file) => file.endsWith("page.tsx"))
    .filter((file) => !file.includes(`${path.sep}_standalone_library_backup${path.sep}`))
    .filter((file) => !file.includes(`${path.sep}src${path.sep}cogni${path.sep}src${path.sep}app${path.sep}`));

  return files.map(routeFromPageFile);
}

function parseContractRoutes(contractPath: string): string[] {
  const content = fs.readFileSync(contractPath, "utf-8");
  const routesSection = content.match(/## ROUTES\n([\s\S]*?)(?=\n## |$)/);
  if (!routesSection) return [];

  const seen = new Set<string>();
  const routeRegex = /`(\/[^`]+)`/g;
  let match: RegExpExecArray | null = null;
  while ((match = routeRegex.exec(routesSection[1])) !== null) {
    seen.add(match[1]);
  }

  return Array.from(seen);
}

function getContractRoutes(): string[] {
  if (!fs.existsSync(CONTRACTS_DIR)) return [];

  const files = fs
    .readdirSync(CONTRACTS_DIR)
    .filter((name) => name.endsWith(".contract.md"))
    .filter((name) => !name.startsWith("shared-"));

  const all = new Set<string>();
  for (const file of files) {
    const contractPath = path.join(CONTRACTS_DIR, file);
    for (const route of parseContractRoutes(contractPath)) {
      all.add(route);
    }
  }

  return Array.from(all);
}

function findDynamicRouteIssues(): DebugIssue[] {
  const issues: DebugIssue[] = [];
  const allDirs = walkDirs(APP_DIR).filter((dir) => dir.includes("[") && dir.includes("]"));

  for (const dir of allDirs) {
    const relative = path.relative(APP_DIR, dir).replace(/\\/g, "/");
    if (!relative) continue;
    if (relative.split("/").some((segment) => IGNORED_DIR_NAMES.has(segment))) continue;

    const pagePath = path.join(dir, "page.tsx");
    const hasOwnPage = fs.existsSync(pagePath);
    const hasNestedPage = walk(dir).some((file) => file.endsWith(`${path.sep}page.tsx`));

    if (!hasOwnPage && !hasNestedPage) {
      issues.push({
        severity: "error",
        message: `Broken dynamic route: /${relative} (missing page.tsx)`,
        file: path.relative(ROOT, dir),
      });
    }
  }

  return issues;
}

function findDuplicateRoutes(routes: string[]): DebugIssue[] {
  const issues: DebugIssue[] = [];
  const counts = new Map<string, number>();

  for (const route of routes) {
    counts.set(route, (counts.get(route) ?? 0) + 1);
  }

  for (const [route, count] of counts.entries()) {
    if (count > 1) {
      issues.push({
        severity: "error",
        message: `Duplicate route detected: ${route} (${count} definitions)`,
      });
    }
  }

  return issues;
}

function findMissingRequiredRoutes(actualRoutes: Set<string>): DebugIssue[] {
  const issues: DebugIssue[] = [];

  for (const requiredRoute of REQUIRED_ROUTES) {
    if (!actualRoutes.has(requiredRoute)) {
      issues.push({
        severity: "error",
        message: `Missing required route: ${requiredRoute}`,
      });
    }
  }

  return issues;
}

function findContractRouteMismatches(actualRoutes: Set<string>): DebugIssue[] {
  const issues: DebugIssue[] = [];
  const contractRoutes = getContractRoutes();

  for (const contractRoute of contractRoutes) {
    if (!actualRoutes.has(contractRoute)) {
      issues.push({
        severity: "warning",
        message: `Contract route not found in src/app: ${contractRoute}`,
      });
    }
  }

  return issues;
}

export function runRouteChecker(): CheckerResult {
  const issues: DebugIssue[] = [];

  if (!fs.existsSync(APP_DIR)) {
    return {
      name: "Routes",
      ok: false,
      issues: [
        {
          severity: "error",
          message: "src/app directory not found.",
          file: "src/app",
        },
      ],
      summary: "Route scan failed.",
    };
  }

  const routes = findAppRoutes();
  const routeSet = new Set(routes);

  issues.push(...findDuplicateRoutes(routes));
  issues.push(...findMissingRequiredRoutes(routeSet));
  issues.push(...findDynamicRouteIssues());
  issues.push(...findContractRouteMismatches(routeSet));

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.length - errorCount;

  return {
    name: "Routes",
    ok: errorCount === 0,
    issues,
    summary: `Discovered ${routes.length} routes (${errorCount} errors, ${warningCount} warnings).`,
  };
}
