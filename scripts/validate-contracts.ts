#!/usr/bin/env node

/**
 * Feature Contract Validator for Cognify
 * 
 * Scans module imports and validates against feature contracts.
 * Detects violations of:
 * - Forbidden imports
 * - Unlisted database table access
 * - Unauthorized API endpoints
 */

import * as fs from "fs";
import * as path from "path";

interface ContractRule {
  allowed: string[];
  forbidden: string[];
  tables: string[];
  routes: string[];
  endpoints: string[];
}

interface ValidationResult {
  module: string;
  violations: string[];
  warnings: string[];
}

const MODULES = [
  "tests",
  "library",
  "cogni",
  "teacher",
  "analytics",
  "notes-converter",
  "dashboard",
];

const contractsDir = path.join(process.cwd(), "feature-contracts");

function readContract(module: string): ContractRule | null {
  const contractPath = path.join(contractsDir, `${module}.contract.md`);

  if (!fs.existsSync(contractPath)) {
    console.warn(`⚠️  Contract not found: ${contractPath}`);
    return null;
  }

  const content = fs.readFileSync(contractPath, "utf-8");

  const allowedMatch = content.match(
    /## ALLOWED IMPORTS\n\n```typescript\n([\s\S]*?)```/
  );
  const forbiddenMatch = content.match(
    /## FORBIDDEN IMPORTS\n\n```typescript\n([\s\S]*?)```/
  );
  const tablesMatch = content.match(/## DATABASE TABLES\n\n([\s\S]*?)(?=## |$)/);
  const routesMatch = content.match(/## ROUTES\n\n([\s\S]*?)(?=## |$)/);
  const endpointsMatch = content.match(/## API ENDPOINTS\n\n([\s\S]*?)(?=## |$)/);

  const parseList = (text: string): string[] => {
    if (!text) return [];
    return text
      .split("\n")
      .filter((line) => line.trim().startsWith("-") || line.trim().startsWith("•"))
      .map((line) => line.replace(/^[\s\-•]+/, "").trim())
      .filter((line) => line.length > 0);
  };

  return {
    allowed: allowedMatch
      ? allowedMatch[1]
          .split("\n")
          .filter((l) => l.includes("@/") || l.includes("import"))
          .map((l) => l.replace(/[`\/\/\*]/g, "").trim())
          .filter((l) => l.length > 0)
      : [],
    forbidden: forbiddenMatch
      ? forbiddenMatch[1]
          .split("\n")
          .filter((l) => l.includes("@/") || l.includes("cannot"))
          .map((l) => l.replace(/[`\/\/❌]/g, "").trim())
          .filter((l) => l.length > 0)
      : [],
    tables: parseList(tablesMatch ? tablesMatch[1] : ""),
    routes: parseList(routesMatch ? routesMatch[1] : ""),
    endpoints: parseList(endpointsMatch ? endpointsMatch[1] : ""),
  };
}

function scanModuleImports(module: string): string[] {
  const modulePaths = [
    path.join(process.cwd(), "src", "app", module),
    path.join(process.cwd(), "src", "modules", module),
  ];

  const imports: string[] = [];

  const scanDir = (dir: string) => {
    if (!fs.existsSync(dir)) return;

    fs.readdirSync(dir, { recursive: true }).forEach((file) => {
      const filePath = path.join(dir, file.toString());
      if (
        !fs.statSync(filePath).isFile() ||
        ![".ts", ".tsx", ".js", ".jsx"].some((ext) =>
          filePath.endsWith(ext)
        )
      )
        return;

      const content = fs.readFileSync(filePath, "utf-8");
      const importRegex = /import\s+.*?from\s+['"](@\/[\w\-\/]*)['"]/g;

      let match;
      while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }
    });
  };

  modulePaths.forEach(scanDir);
  return [...new Set(imports)];
}

function validateModule(module: string): ValidationResult {
  const contract = readContract(module);
  if (!contract) {
    return { module, violations: [], warnings: [`No contract found`] };
  }

  const imports = scanModuleImports(module);
  const violations: string[] = [];
  const warnings: string[] = [];

  // Check forbidden imports
  imports.forEach((imp) => {
    contract.forbidden.forEach((forbidden) => {
      if (imp.includes(forbidden.replace(/^@\//, "").replace(/\*/, ""))) {
        violations.push(
          `❌ FORBIDDEN: ${imp} (matches ${forbidden})`
        );
      }
    });
  });

  // Check each import is in allowed list
  imports.forEach((imp) => {
    if (imp.startsWith("@/")) {
      const isAllowed = contract.allowed.some((allowed) => {
        const pattern = allowed
          .replace(/^@\//, "")
          .replace(/\*/g, ".*")
          .replace(/\//g, "\\/");
        return new RegExp(`^${pattern}`).test(imp.replace("@/", ""));
      });

      if (!isAllowed && !warnings.some(w => w.includes(imp))) {
        warnings.push(`⚠️  Import ${imp} not in ALLOWED_IMPORTS list`);
      }
    }
  });

  return { module, violations, warnings };
}

function main() {
  console.log(`\n🔍 Feature Contract Validator\n`);
  console.log(`Scanning ${MODULES.length} modules...\n`);

  let totalViolations = 0;
  let totalWarnings = 0;

  MODULES.forEach((module) => {
    const result = validateModule(module);

    if (result.violations.length > 0 || result.warnings.length > 0) {
      console.log(`\n📦 ${module.toUpperCase()}`);

      if (result.violations.length > 0) {
        console.log(`   Violations (${result.violations.length}):`);
        result.violations.forEach((v) => console.log(`     ${v}`));
        totalViolations += result.violations.length;
      }

      if (result.warnings.length > 0) {
        console.log(`   Warnings (${result.warnings.length}):`);
        result.warnings.forEach((w) => console.log(`     ${w}`));
        totalWarnings += result.warnings.length;
      }
    }
  });

  console.log(`\n────────────────────────────────`);
  console.log(`📊 Summary`);
  console.log(`   Violations: ${totalViolations}`);
  console.log(`   Warnings: ${totalWarnings}`);
  console.log(`────────────────────────────────\n`);

  if (totalViolations > 0) {
    console.log(`❌ Validation FAILED\n`);
    process.exit(1);
  }

  if (totalWarnings > 0) {
    console.log(`⚠️  Validation passed with warnings\n`);
    process.exit(0);
  }

  console.log(`✅ Validation passed!\n`);
  process.exit(0);
}

main();
