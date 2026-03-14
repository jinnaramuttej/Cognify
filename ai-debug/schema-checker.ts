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
const SCHEMA_PATH = path.join(ROOT, "db", "schema.sql");
const SRC_DIR = path.join(ROOT, "src");
const CONTRACTS_DIR = path.join(ROOT, "feature-contracts");

const CRITICAL_TABLES = [
  "profiles",
  "tests",
  "questions",
  "test_attempt_questions",
  "syllabus_exams",
  "syllabus_subjects",
  "syllabus_units",
  "syllabus_chapters",
] as const;

const MODULE_SOURCE_PATHS: Record<string, string[]> = {
  tests: ["src/app/tests", "src/modules/tests", "src/app/api/tests"],
  library: ["src/app/library", "src/modules/library"],
  cogni: ["src/app/cogni", "src/modules/cogni", "src/app/api/cogni"],
  teacher: ["src/app/teacher", "src/modules/teacher", "src/app/api/teacher"],
  analytics: ["src/app/progress-analytics", "src/modules/analytics", "src/app/api/analytics"],
  "notes-converter": ["src/app/notes-converter", "src/modules/notes-converter", "src/app/api/notes-converter"],
  dashboard: ["src/app/dashboard"],
};

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

function parseSchemaTables(content: string): Set<string> {
  const tables = new Set<string>();
  const regex = /create\s+table\s+if\s+not\s+exists\s+(?:public\.)?([a-z_][a-z0-9_]*)/gi;

  let match: RegExpExecArray | null = null;
  while ((match = regex.exec(content)) !== null) {
    tables.add(match[1]);
  }

  return tables;
}

function parseSupabaseTableReferences(fileContent: string): string[] {
  const tables: string[] = [];
  const regex = /\.from\(\s*['"]([a-z_][a-z0-9_]*)['"]\s*\)/g;

  let match: RegExpExecArray | null = null;
  while ((match = regex.exec(fileContent)) !== null) {
    tables.push(match[1]);
  }

  return tables;
}

function parseContractTables(contractPath: string): Set<string> {
  const content = fs.readFileSync(contractPath, "utf-8");
  const section = content.match(/## DATABASE TABLES\n([\s\S]*?)(?=\n## |$)/);
  if (!section) return new Set<string>();

  const tableRegex = /`([a-z_][a-z0-9_]*)`/g;
  const tables = new Set<string>();

  let match: RegExpExecArray | null = null;
  while ((match = tableRegex.exec(section[1])) !== null) {
    tables.add(match[1]);
  }

  return tables;
}

function findSchemaMismatches(validTables: Set<string>): DebugIssue[] {
  const issues: DebugIssue[] = [];
  const codeFiles = walkFiles(SRC_DIR).filter((file) => /\.(ts|tsx|js|jsx)$/.test(file));

  for (const filePath of codeFiles) {
    const content = fs.readFileSync(filePath, "utf-8");
    const tableRefs = parseSupabaseTableReferences(content);

    for (const table of tableRefs) {
      if (!validTables.has(table)) {
        issues.push({
          severity: "warning",
          message: `Table referenced in code but missing from db/schema.sql: ${table}`,
          file: path.relative(ROOT, filePath),
        });
      }
    }
  }

  return issues;
}

function findUnauthorizedModuleTableUsage(validTables: Set<string>): DebugIssue[] {
  const issues: DebugIssue[] = [];

  for (const [moduleName, modulePaths] of Object.entries(MODULE_SOURCE_PATHS)) {
    const contractPath = path.join(CONTRACTS_DIR, `${moduleName}.contract.md`);
    if (!fs.existsSync(contractPath)) {
      issues.push({
        severity: "warning",
        message: `Missing contract for module table validation: ${moduleName}`,
      });
      continue;
    }

    const allowedTables = parseContractTables(contractPath);
    for (const relativeModulePath of modulePaths) {
      const absoluteModulePath = path.join(ROOT, relativeModulePath);
      const files = walkFiles(absoluteModulePath).filter((file) => /\.(ts|tsx|js|jsx)$/.test(file));

      for (const filePath of files) {
        const content = fs.readFileSync(filePath, "utf-8");
        const tableRefs = parseSupabaseTableReferences(content);

        for (const table of tableRefs) {
          if (!validTables.has(table)) {
            continue;
          }

          if (allowedTables.size > 0 && !allowedTables.has(table)) {
            issues.push({
              severity: "warning",
              message: `Unauthorized database usage in ${moduleName}: table '${table}' is not listed in contract`,
              file: path.relative(ROOT, filePath),
            });
          }
        }
      }
    }
  }

  return issues;
}

export function runSchemaChecker(): CheckerResult {
  if (!fs.existsSync(SCHEMA_PATH)) {
    return {
      name: "Database Schema",
      ok: false,
      issues: [
        {
          severity: "error",
          message: "db/schema.sql not found.",
          file: "db/schema.sql",
        },
      ],
      summary: "Schema scan failed.",
    };
  }

  const schemaContent = fs.readFileSync(SCHEMA_PATH, "utf-8");
  const schemaTables = parseSchemaTables(schemaContent);
  const issues: DebugIssue[] = [];

  for (const criticalTable of CRITICAL_TABLES) {
    if (!schemaTables.has(criticalTable)) {
      issues.push({
        severity: "error",
        message: `Critical table missing from schema.sql: ${criticalTable}`,
        file: "db/schema.sql",
      });
    }
  }

  issues.push(...findSchemaMismatches(schemaTables));
  issues.push(...findUnauthorizedModuleTableUsage(schemaTables));

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.length - errorCount;

  return {
    name: "Database Schema",
    ok: errorCount === 0,
    issues,
    summary: `${schemaTables.size} tables parsed (${errorCount} errors, ${warningCount} warnings).`,
  };
}
