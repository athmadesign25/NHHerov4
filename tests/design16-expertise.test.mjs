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

const { getDesign16ExpertiseShortcuts: shortcuts, toggleDesign16Expertise: toggle } = await import("../src/features/search/design16Expertise.ts");
const { emptyDoctorFilters } = await import("../src/features/search/doctorListing.ts");
const now = new Date("2026-10-23T02:30:00Z");
const filters = () => ({ ...emptyDoctorFilters(), specialties: ["Orthopaedician"] });
const values = (options) => options.map((option) => option.value);

function doctor(id, expertise, overrides = {}) {
  return {
    id, name: `Dr ${id}`, speciality: "Orthopaedician", degrees: "", hospital: "Hospital A", city: "Bangalore",
    experience: "", img: "", fee: "", rating: 0, reviews: 0, expertise, languages: ["English"], gender: "Female",
    modes: { hospital: true, video: false }, availability: { hospital: "Today, 11:00 AM" }, ...overrides,
  };
}
const doctors = [
  doctor("joint", ["Joint replacement", "Sports injuries"]),
  doctor("spine", ["Spine care"], { languages: ["Kannada"], hospital: "Hospital B", gender: "Male", availability: { hospital: "Tomorrow, 11:00 AM" } }),
  doctor("sports", ["Sports injuries"], { modes: { hospital: true, video: true }, availability: { hospital: "Tomorrow, 11:00 AM", video: "Today, 11:00 AM" } }),
  doctor("heart", ["Heart failure"], { speciality: "Cardiologist" }),
];

test("shortcuts need one explicit specialty or unambiguous existing specialty wording", () => {
  assert.deepEqual(shortcuts(doctors, emptyDoctorFilters(), "hospital", "", now), []);
  assert.deepEqual(shortcuts(doctors, { ...filters(), specialties: ["Orthopaedician", "Cardiologist"] }, "hospital", "", now), []);
  assert.deepEqual(shortcuts(doctors, emptyDoctorFilters(), "hospital", "orthopaedic pain", now), []);
  assert.deepEqual(shortcuts(doctors, emptyDoctorFilters(), "hospital", "Orthopaedician Cardiologist", now), []);
  assert.deepEqual(shortcuts(doctors, emptyDoctorFilters(), "hospital", "notanorthopaedician", now), []);
  assert.deepEqual(values(shortcuts(doctors, emptyDoctorFilters(), "hospital", "Find an ORTHOPAEDICIAN", now)), ["Sports injuries", "Joint replacement", "Spine care"]);
});

test("options reuse only source expertise within the specialty, with no API enrichment", () => {
  assert.deepEqual(values(shortcuts(doctors, filters(), "hospital", "", now)), ["Sports injuries", "Joint replacement", "Spine care"]);
  const unknown = doctors.map(({ expertise, ...item }) => item);
  assert.deepEqual(shortcuts(unknown, filters(), "hospital", "", now), []);
  assert.deepEqual(shortcuts(doctors, { ...filters(), specialties: ["Unknown"] }, "hospital", "", now), []);
});

test("query focus suppresses suggestions without trapping an active choice", () => {
  for (const query of ["joint", "Orthopaedician sports injuries", "spine care"]) {
    assert.deepEqual(shortcuts(doctors, filters(), "hospital", query, now), []);
  }
  assert.deepEqual(shortcuts(doctors, { ...filters(), expertise: ["Spine care"] }, "hospital", "spine", now), [
    { value: "Spine care", count: 1, selected: true },
  ]);
});

test("a single source expertise is hidden until selected and removable", () => {
  const single = [doctor("one", ["Joint replacement"])];
  assert.deepEqual(shortcuts(single, filters(), "hospital", "", now), []);
  const selected = { ...filters(), expertise: ["Joint replacement"] };
  assert.deepEqual(shortcuts(single, selected, "hospital", "", now), [{ value: "Joint replacement", count: 1, selected: true }]);
  assert.deepEqual(shortcuts(single, toggle(selected, "Joint replacement"), "hospital", "", now), []);
});

test("option identities and order survive other groups while counts reflect every group and consultation mode", () => {
  const expected = values(shortcuts(doctors, filters(), "hospital", "", now));
  for (const [change, mode, counts] of [
    [{ hospitals: ["Hospital B"] }, "hospital", [0, 0, 1]],
    [{ languages: ["Kannada"] }, "hospital", [0, 0, 1]],
    [{ genders: ["Female"] }, "hospital", [2, 1, 0]],
    [{ availability: "tomorrow" }, "hospital", [1, 0, 1]],
    [{}, "video", [1, 0, 0]],
    [{ hospitals: ["Hospital B"], languages: ["English"] }, "hospital", [0, 0, 0]],
  ]) {
    const options = shortcuts(doctors, { ...filters(), ...change }, mode, "", now);
    assert.deepEqual(values(options), expected);
    assert.deepEqual(options.map((option) => option.count), counts);
  }
});

test("selected zero-count choices remain removable without clearing other filters", () => {
  const selected = { ...filters(), expertise: ["Joint replacement"], hospitals: ["Hospital B"], languages: ["Kannada"], availability: "tomorrow" };
  const option = shortcuts(doctors, selected, "hospital", "", now).find((item) => item.value === "Joint replacement");
  assert.deepEqual(option, { value: "Joint replacement", count: 0, selected: true });
  const removed = toggle(selected, option.value);
  assert.deepEqual(removed, { ...selected, expertise: [] });
  assert.deepEqual(selected.expertise, ["Joint replacement"]);
});

test("date or booking-history subsets affect counts without changing the shortcut set", () => {
  const selected = { ...filters(), expertise: ["Joint replacement"] };
  const subset = doctors.filter((item) => item.id === "sports");
  const options = shortcuts(doctors, selected, "hospital", "", now, subset);
  assert.deepEqual(values(options), values(shortcuts(doctors, selected, "hospital", "", now)));
  assert.deepEqual(options.map((option) => option.count), [1, 0, 0]);
  assert.equal(options.find((option) => option.value === "Joint replacement").selected, true);
  assert.deepEqual(shortcuts(doctors, { ...selected, languages: ["Kannada"] }, "hospital", "", now, subset).map((option) => option.count), [0, 0, 0]);
  assert.deepEqual(shortcuts(doctors, selected, "hospital", "", now, []).map((option) => option.count), [0, 0, 0]);
});

test("expertise counts ignore selections within their own OR group and count each doctor once", () => {
  const duplicates = [...doctors, doctor("duplicate", ["Sports injuries", "Sports injuries"])];
  const selected = { ...filters(), expertise: ["Joint replacement", "Spine care"] };
  const options = shortcuts(duplicates, selected, "hospital", "", now);
  assert.deepEqual(options.map((option) => option.count), [3, 1, 1]);
  assert.deepEqual(options.filter((option) => option.selected).map((option) => option.value), ["Joint replacement", "Spine care"]);
});

test("suggestions are capped at three while extra active source choices stay removable", () => {
  const source = [doctor("wide", ["A focus", "B focus", "C focus", "D focus", "E focus", ""])];
  assert.deepEqual(values(shortcuts(source, filters(), "hospital", "", now)), ["A focus", "B focus", "C focus"]);
  const selected = { ...filters(), expertise: ["D focus", "E focus", "Unknown"] };
  assert.deepEqual(values(shortcuts(source, selected, "hospital", "", now)), ["A focus", "B focus", "C focus", "D focus", "E focus"]);
});

test("shortcuts and toggles preserve their input arrays", () => {
  const source = Object.freeze(doctors.map((item) => Object.freeze({ ...item, expertise: Object.freeze([...item.expertise]) })));
  const selected = Object.freeze({ ...filters(), expertise: Object.freeze(["Joint replacement"]) });
  const before = JSON.stringify({ source, selected });
  shortcuts(source, selected, "hospital", "", now);
  assert.deepEqual(toggle(selected, "Sports injuries").expertise, ["Joint replacement", "Sports injuries"]);
  assert.equal(JSON.stringify({ source, selected }), before);
});
