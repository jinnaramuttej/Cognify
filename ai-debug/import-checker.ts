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
const SRC_DIR = path.join(ROOT, "src");
const PACKAGE_PATH = path.join(ROOT, "package.json");

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

function parseImports(fileContent: string): string[] {
  const imports: string[] = [];
  const regex = /import\s+[^;]*?from\s+['"]([^'"]+)['"]/g;

  let match: RegExpExecArray | null = null;
  while ((match = regex.exec(fileContent)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

function loadInstalledPackages(): Set<string> {
  if (!fs.existsSync(PACKAGE_PATH)) return new Set<string>();

  const pkg = JSON.parse(fs.readFileSync(PACKAGE_PATH, "utf-8")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  return new Set<string>([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
  ]);
}

function aliasImportResolves(importPath: string): boolean {
  if (!importPath.startsWith("@/")) return true;

  const relative = importPath.slice(2);
  const base = path.join(ROOT, "src", relative);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
    path.join(base, "index.js"),
    path.join(base, "index.jsx"),
  ];

  return candidates.some((candidate) => fs.existsSync(candidate));
}

export function runImportChecker(): CheckerResult {
  const issues: DebugIssue[] = [];

  if (!fs.existsSync(SRC_DIR)) {
    return {
      name: "Imports",
      ok: false,
      issues: [
        {
          severity: "error",
          message: "src directory not found.",
          file: "src",
        },
      ],
      summary: "Import scan failed.",
    };
  }

  const installedPackages = loadInstalledPackages();
  const files = walkFiles(SRC_DIR).filter((file) => /\.(ts|tsx|js|jsx)$/.test(file));

  for (const filePath of files) {
    if (filePath.includes(`${path.sep}_standalone_library_backup${path.sep}`)) continue;
    if (filePath.includes(`${path.sep}src${path.sep}cogni${path.sep}src${path.sep}`)) continue;

    const relativeFile = path.relative(ROOT, filePath).replace(/\\/g, "/");
    const content = fs.readFileSync(filePath, "utf-8");
    const imports = parseImports(content);

    for (const importPath of imports) {
      if (importPath === "react-router-dom") {
        issues.push({
          severity: "error",
          message: "Invalid import: react-router-dom is not allowed in App Router project.",
          file: relativeFile,
        });
      }

      if (importPath === "axios" && !installedPackages.has("axios")) {
        issues.push({
          severity: "error",
          message: "Invalid import: axios is used but not installed.",
          file: relativeFile,
        });
      }

      if (/^(\.\.\/){2,}components(\/|$)/.test(importPath)) {
        issues.push({
          severity: "warning",
          message: `Deep relative component import detected: ${importPath}. Use @/ alias instead.`,
          file: relativeFile,
        });
      }

      if (importPath.startsWith("@/") && !aliasImportResolves(importPath)) {
        issues.push({
          severity: "error",
          message: `Alias import does not resolve: ${importPath}`,
          file: relativeFile,
        });
      }
    }
  }

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.length - errorCount;

  return {
    name: "Imports",
    ok: errorCount === 0,
    issues,
    summary: `Import checks complete (${errorCount} errors, ${warningCount} warnings).`,
  };
}
