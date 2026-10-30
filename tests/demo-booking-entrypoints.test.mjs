import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/navigation") return nextResolve("next/navigation.js", context);
    const candidate = specifier.startsWith("@/") ? path.join(root, "src", specifier.slice(2))
      : specifier.startsWith(".") && context.parentURL?.startsWith(pathToFileURL(root).href)
        ? fileURLToPath(new URL(specifier, context.parentURL)) : null;
    if (candidate && existsSync(candidate + ".ts")) return nextResolve(pathToFileURL(candidate + ".ts").href, context);
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.startsWith(pathToFileURL(root).href) && url.endsWith(".ts") && !url.includes("/node_modules/")) {
      return { format: "module", shortCircuit: true, source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText };
    }
    return nextLoad(url, context);
  },
});

const { doctorNavUrl } = await import("../src/features/search/navigationEntries.ts");
const { readListingParams } = await import("../src/features/search/doctorListing.ts");
const { readSearchLocation } = await import("../src/features/search/design3Data.ts");
const { readDesign16Date } = await import("../src/features/search/design16Refinements.ts");
const { getDesign20DirectoryDoctor } = await import("../src/features/search/design20Directory.ts");
const asUrl = href => new URL(href, "https://nh.local");

test("specialty menu entry applies a listing facet rather than a free-text query", () => {
 const params = asUrl(doctorNavUrl("specialty", "Cardiologists")).searchParams;
 assert.deepEqual(readListingParams(params).filters.specialties, ["Cardiologist"]);
 assert.equal(params.has("q"), false);
});
test("city menu entry is understood by the directory location selector", () => {
 assert.equal(readSearchLocation(asUrl(doctorNavUrl("location", "Bangalore")).searchParams), "Bangalore");
});
test("condition entry deliberately opens unfiltered discovery", () => {
 assert.equal(asUrl(doctorNavUrl("condition", "Diabetes")).searchParams.toString(), "design=d20");
});
test("Sunday entry selects the nearest Sunday within the booking calendar, including today", () => {
 for (const [now, expected] of [["2026-10-29T09:00:00Z", "2026-11-01"], ["2026-11-01T09:00:00Z", "2026-11-01"], ["2026-11-01T20:00:00Z", "2026-11-08"]]) {
  const date = asUrl(doctorNavUrl("sunday", undefined, new Date(now))).searchParams.get("appointmentDate");
  assert.equal(date, expected); assert.equal(readDesign16Date(date, new Date(now)), expected);
 }
});
test("Today entry applies the listing's existing availability filter", () => {
 assert.equal(readListingParams(asUrl(doctorNavUrl("today")).searchParams).filters.availability, "today");
});
test("search identities override colliding fixture IDs without inventing unknown doctors", () => {
 assert.equal(getDesign20DirectoryDoctor("external-api-id", "Dr. Abhinandan S Punit")?.id, "d20-dr-abhinandan-s-punit");
 assert.equal(getDesign20DirectoryDoctor("dr-1", "Dr. Unknown Person"), null);
});

const { specialityBookingEntry } = await import("../src/features/search/specialityBookingEntry.ts");
test("speciality detail appointment links keep the existing directory filters and location", () => {
 const url = asUrl(specialityBookingEntry("oncology", "Bangalore"));
 assert.equal(url.pathname, "/search/doctors");
 assert.equal(url.searchParams.get("design"), "d20");
 assert.deepEqual(readListingParams(url.searchParams).filters.specialties, ["Oncologist"]);
 assert.equal(readSearchLocation(url.searchParams), "Bangalore");
});
test("unmapped speciality departments use discovery without creating unsupported facets", () => {
 const url = asUrl(specialityBookingEntry("unknown-department"));
 assert.equal(url.pathname, "/search/doctors");
 assert.equal(url.searchParams.has("specialties"), false);
});
