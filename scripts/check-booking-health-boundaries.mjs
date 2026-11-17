#!/usr/bin/env node
/** Read-only module boundary check; optionally report overlapping branch edits. */
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const healthRoot = "src/features/health-checkups";
const sharedRoot = "src/components/ui/search-location";
const dragHook = "src/components/ui/useMouseDragScroll.ts";
const within = (file, folder) => file === folder || file.startsWith(`${folder}/`);
const relative = file => path.relative(root, file).split(path.sep).join("/");
const config = ts.readConfigFile(path.join(root, "tsconfig.json"), ts.sys.readFile);
if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, "\n"));
const { options } = ts.parseJsonConfigFileContent(config.config, ts.sys, root);

function targetOf(file, specifier) {
  // TypeScript resolves aliases from this repository's tsconfig, including re-exports.
  const resolved = ts.resolveModuleName(specifier, file, options, ts.sys).resolvedModule;
  if (resolved) return relative(resolved.resolvedFileName);
  // CSS imports are not resolved by TypeScript. Preserve normalized path checks.
  if (specifier.startsWith("@/")) return relative(path.resolve(root, "src", specifier.slice(2)));
  if (specifier.startsWith(".")) return relative(path.resolve(path.dirname(file), specifier));
  return null;
}

/** Parse syntax, not comments or string matches; also checks literal dynamic imports. */
export function checkSource(filename, source) {
  const file = path.resolve(root, filename);
  const local = relative(file);
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const failures = [];
  const visit = node => {
    let moduleSpecifier;
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) moduleSpecifier = node.moduleSpecifier;
    else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) moduleSpecifier = node.moduleReference.expression;
    else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) moduleSpecifier = node.argument.literal;
    else if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === "require"))) moduleSpecifier = node.arguments[0];
    if (moduleSpecifier && ts.isStringLiteralLike(moduleSpecifier)) {
      const target = targetOf(file, moduleSpecifier.text);
      const appImport = target && within(target, "src/app");
      const privateBooking = target && within(target, "src/features/booking") && !within(target, "src/features/booking/shared");
      const featureImport = target && within(target, "src/features");
      const invalid = within(local, healthRoot) ? appImport || privateBooking
        : within(local, sharedRoot) || local === dragHook ? appImport || featureImport : false;
      if (invalid) {
        const line = parsed.getLineAndCharacterOfPosition(moduleSpecifier.getStart(parsed)).line + 1;
        failures.push(`${local}:${line} -> ${moduleSpecifier.text}`);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(parsed);
  return failures;
}

function sources(location) {
  const absolute = path.join(root, location);
  if (statSync(absolute).isFile()) return [absolute];
  return readdirSync(absolute, { withFileTypes: true }).flatMap(entry => {
    const child = path.join(location, entry.name);
    return entry.isDirectory() ? sources(child) : /\.[cm]?[jt]sx?$/.test(entry.name) ? [path.join(root, child)] : [];
  });
}

const git = args => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const paths = output => output.split("\0").filter(Boolean);

function reportOverlap(base) {
  // Resolve to a commit before use; no shell interpolation or user-controlled options.
  const target = git(["rev-parse", "--verify", "--end-of-options", `${base}^{commit}`]).trim();
  const ancestor = git(["merge-base", "HEAD", target]).trim();
  const incoming = new Set(paths(git(["diff", "--no-renames", "--name-only", "-z", ancestor, target, "--"])));
  const local = new Set([
    ...paths(git(["diff", "--no-renames", "--name-only", "-z", ancestor, "HEAD", "--"])),
    ...paths(git(["diff", "--no-renames", "--name-only", "-z", "HEAD", "--"])),
    ...paths(git(["ls-files", "--others", "--exclude-standard", "-z"])),
  ]);
  const overlap = [...local].filter(file => incoming.has(file)).sort();
  console.log(`\n${overlap.length} potentially overlapping file(s) with ${base}:`);
  for (const file of overlap) console.log(`  ${file}`);
  console.log("Includes local uncommitted files. Overlap is a review aid, not a merge-conflict prediction.");
  console.log("Uses local Git references only; no fetch, checkout, merge, commit or push is performed.");
}

function main(args) {
  if (args.length && !(args.length === 2 && args[0] === "--base" && args[1])) {
    console.error("Usage: node scripts/check-booking-health-boundaries.mjs [--base origin/main]");
    return 2;
  }
  const files = [healthRoot, sharedRoot, dragHook].flatMap(sources);
  const failures = files.flatMap(file => checkSource(file, readFileSync(file, "utf8")));
  if (failures.length) {
    console.error("Module boundary violations:");
    for (const failure of failures) console.error(`  ${failure}`);
    console.error("Health Checkups must use booking/shared; shared controls must not depend on routes or features.");
  } else console.log(`Module boundaries pass (${files.length} source files checked).`);
  if (args[1]) reportOverlap(args[1]);
  return failures.length ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.exitCode = main(process.argv.slice(2)); }
  catch (error) {
    console.error(`Boundary/handoff check could not complete: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 2;
  }
}
