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

const { filterTreatments, matchesProcedureClassification, parseTreatmentSelection, toggleTreatmentSelection } = await import("../src/components/treatments/treatmentFilters.ts");
const { TREATMENTS_PROCEDURES_DATA: items } = await import("../src/data/treatmentsProceduresData.ts");
const empty = () => ({ specialties: [], classifications: [], letters: [] });
const ids = result => result.map(item => item.id).sort();

test("an empty selection keeps the complete catalogue without mutating it", () => {
  const original = ids(items);
  assert.deepEqual(ids(filterTreatments(items, "", empty())), original);
  assert.deepEqual(ids(items), original);
});

test("multiple specialities form a union rather than replacing each other", () => {
  const specialties = [...new Set(items.map(item => item.speciality))].slice(0, 2);
  const result = filterTreatments(items, "", { ...empty(), specialties });
  assert.deepEqual(ids(result), ids(items.filter(item => specialties.includes(item.speciality))));
  for (const specialty of specialties) assert.ok(result.some(item => item.speciality === specialty));
});

test("classifications are alternatives; specialty, alphabet and search refine that union", () => {
  const classifications = ["Minimally Invasive", "Day Care"];
  const result = filterTreatments(items, "", { ...empty(), classifications });
  assert.deepEqual(ids(result), ids(items.filter(item => classifications.some(value => matchesProcedureClassification(item, value)))));
  const target = result[0];
  assert.ok(target);
  const filters = { specialties: [target.speciality], classifications, letters: [(target.shortTitle || target.title)[0].toUpperCase()] };
  const refined = filterTreatments(items, target.shortTitle, filters);
  assert.ok(refined.some(item => item.id === target.id));
  for (const item of refined) {
    assert.equal(item.speciality, target.speciality);
    assert.equal(item.shortTitle[0], target.shortTitle[0]);
    assert.ok(classifications.some(value => matchesProcedureClassification(item, value)));
  }
});

test("multiple letters retain all matching initial letters", () => {
  const letters = ["A", "H"];
  const result = filterTreatments(items, "", { ...empty(), letters });
  assert.deepEqual(ids(result), ids(items.filter(item => letters.includes((item.shortTitle || item.title)[0].toUpperCase()))));
  for (const letter of letters) assert.ok(result.some(item => item.shortTitle.startsWith(letter)));
});

test("removing one selection preserves its neighbours, and removing the last clears the group", () => {
  const original = ["A", "B"];
  assert.deepEqual(toggleTreatmentSelection(original, "A"), ["B"]);
  assert.deepEqual(toggleTreatmentSelection(["B"], "B"), []);
  assert.deepEqual(toggleTreatmentSelection(original, "C"), ["A", "B", "C"]);
  assert.deepEqual(original, ["A", "B"]);
});

test("existing single-value query parameters work alongside comma-separated selections", () => {
  assert.deepEqual(parseTreatmentSelection("Cardiology & Heart Surgery"), ["Cardiology & Heart Surgery"]);
  assert.deepEqual(parseTreatmentSelection("All, Day Care,Day Care,Minimally Invasive"), ["Day Care", "Minimally Invasive"]);
  assert.deepEqual(parseTreatmentSelection("All Types"), []);
  assert.deepEqual(parseTreatmentSelection(null), []);
});

test("search is case insensitive and impossible combinations return an empty result", () => {
  assert.deepEqual(ids(filterTreatments(items, " HEART ", empty())), ids(filterTreatments(items, "heart", empty())));
  assert.deepEqual(filterTreatments(items, "not-a-real-procedure", empty()), []);
  assert.deepEqual(filterTreatments(items, "", { ...empty(), specialties: ["Unknown"] }), []);
});
