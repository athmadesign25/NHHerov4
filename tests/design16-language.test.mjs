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

const { getDesign16LanguageShortcut: shortcut, toggleDesign16Language: toggle } = await import("../src/features/search/design16Language.ts");
const { emptyDoctorFilters } = await import("../src/features/search/doctorListing.ts");
const { NH_CITIES } = await import("../src/lib/searchService.ts");
const now = new Date("2026-10-23T02:30:00Z");
function doctor(id, languages, overrides = {}) {
  return { id, name: `Dr ${id}`, speciality: "Cardiologist", degrees: "", hospital: "Hospital A", city: "Bangalore",
    experience: "", img: "", fee: "", rating: 0, reviews: 0, languages, gender: "Female", expertise: ["Heart failure"],
    modes: { hospital: true, video: true }, availability: { hospital: "Today, 11:00 AM", video: "Today, 11:00 AM" }, ...overrides };
}
const doctors = [
  doctor("k1", ["Kannada", "Hindi"]),
  doctor("k2", ["Kannada", "English"], { speciality: "Orthopaedician", hospital: "Hospital B", gender: "Male", expertise: ["Spine care"], modes: { hospital: true, video: false }, availability: { hospital: "Tomorrow, 11:00 AM" } }),
  doctor("h1", ["Hindi", "English"], { expertise: ["Interventional cardiology"] }),
  doctor("k3", ["Kannada", "English"], { availability: { hospital: "Tomorrow, 11:00 AM", video: "Tomorrow, 11:00 AM" } }),
];

test("every supported city suggests its regional language without inventing doctor language abilities", () => {
  const expected = {
    Bangalore: "Kannada", Dharwad: "Kannada", Shimoga: "Kannada", Kolar: "Kannada", Davangere: "Kannada", Mysore: "Kannada",
    Guwahati: "Assamese", Ahmedabad: "Gujarati", Mumbai: "Marathi", Kolkata: "Bengali", Barasat: "Bengali", Howrah: "Bengali",
    Hosur: "Tamil", Jaipur: "Hindi", Raipur: "Chhattisgarhi", Jamshedpur: "Hindi", Gurugram: "Hindi", Delhi: "Hindi", Katra: "Dogri", Jammu: "Dogri",
  };
  assert.deepEqual(Object.keys(expected).sort(), NH_CITIES.map((city) => city.value).sort());
  for (const { value: city } of NH_CITIES) {
    const source = [doctor("local", ["English", expected[city], "Hindi"], { city })];
    assert.deepEqual(shortcut(source, emptyDoctorFilters(), "hospital", city, now), { value: expected[city], selected: false, count: 1 });
    assert.deepEqual(shortcut([doctor("unknown", undefined, { city })], emptyDoctorFilters(), "hospital", city, now), { value: expected[city], selected: false, count: 0 });
  }
});

test("city aliases follow the supported location mapping", () => {
  for (const city of ["Bangalore", "Bengaluru"]) assert.equal(shortcut(doctors, emptyDoctorFilters(), "hospital", city, now).value, "Kannada");
  for (const city of ["Delhi", "Delhi NCR", "New Delhi", "NCR", "Gurgaon", "Gurugram"]) assert.equal(shortcut(doctors, emptyDoctorFilters(), "hospital", city, now).value, "Hindi");
});

test("missing regional metadata keeps the city suggestion unavailable instead of substituting another language", () => {
  assert.deepEqual(shortcut([doctor("one", ["Hindi", "English"])], emptyDoctorFilters(), "hospital", "Kolkata", now), { value: "Bengali", selected: false, count: 0 });
  for (const source of [[doctor("one", ["English"])], [doctor("one", ["French"])], [doctor("one", [])], []]) {
    const before = structuredClone(source);
    assert.deepEqual(shortcut(source, emptyDoctorFilters(), "hospital", "Bangalore", now), { value: "Kannada", selected: false, count: 0 });
    assert.deepEqual(source, before);
  }
});

test("All and unsupported cities make no inferred language recommendation", () => {
  for (const location of ["All", "All Locations", "", "Unknown city"]) {
    assert.equal(shortcut(doctors, emptyDoctorFilters(), "hospital", location, now), null);
  }
});

test("city changes update the suggestion without applying or replacing existing filters", () => {
  const filters = { ...emptyDoctorFilters(), languages: ["English"] };
  const before = structuredClone(filters);
  for (const [city, value, selected, count] of [
    ["Bangalore", "Kannada", false, 3], ["Kolkata", "Bengali", false, 0], ["Delhi", "Hindi", false, 2],
    ["All", "English", true, 3], ["Unknown city", "English", true, 3],
  ]) {
    assert.deepEqual(shortcut(doctors, filters, "hospital", city, now), { value, selected, count });
  }
  assert.deepEqual(filters, before);
  assert.deepEqual(emptyDoctorFilters().languages, []);
});

test("removing the regional shortcut preserves other language selections and facets", () => {
  const filters = { ...emptyDoctorFilters(), languages: ["English", "Kannada"], hospitals: ["Hospital A"] };
  assert.deepEqual(shortcut(doctors, filters, "hospital", "Bangalore", now), { value: "Kannada", selected: true, count: 2 });
  const next = toggle(filters, "Kannada");
  assert.deepEqual(next, { ...filters, languages: ["English"] });
  assert.deepEqual(shortcut(doctors, next, "hospital", "Bangalore", now), { value: "Kannada", selected: false, count: 2 });
  assert.deepEqual(filters.languages, ["English", "Kannada"]);
});

test("all other facets, availability and consultation mode constrain the language count", () => {
  for (const [changes, mode, count] of [
    [{}, "hospital", 3], [{ specialties: ["Cardiologist"] }, "hospital", 2], [{ hospitals: ["Hospital B"] }, "hospital", 1],
    [{ genders: ["Female"] }, "hospital", 2], [{ expertise: ["Spine care"] }, "hospital", 1],
    [{ availability: "today" }, "hospital", 1], [{ availability: "tomorrow" }, "hospital", 2], [{}, "video", 2],
    [{ hospitals: ["Hospital B"], genders: ["Female"] }, "hospital", 0],
  ]) {
    assert.deepEqual(shortcut(doctors, { ...emptyDoctorFilters(), ...changes }, mode, "Bangalore", now), { value: "Kannada", selected: false, count });
  }
});

test("supplied date and history subsets constrain counts without changing the suggested language", () => {
  assert.deepEqual(shortcut(doctors, emptyDoctorFilters(), "hospital", "Bangalore", now, [doctors[3]]), { value: "Kannada", count: 1, selected: false });
  assert.deepEqual(shortcut(doctors, emptyDoctorFilters(), "hospital", "Bangalore", now, [doctors[2]]), { value: "Kannada", count: 0, selected: false });
  assert.deepEqual(shortcut(doctors, emptyDoctorFilters(), "hospital", "Bangalore", now, []), { value: "Kannada", count: 0, selected: false });
  assert.equal(shortcut(doctors, { ...emptyDoctorFilters(), hospitals: ["Hospital B"] }, "hospital", "Bangalore", now, [doctors[3]]).count, 0);
});

test("selected unsupported and zero-count language filters stay removable", () => {
  const filters = { ...emptyDoctorFilters(), languages: ["Unknown language"], expertise: ["Spine care"], availability: "tomorrow" };
  assert.deepEqual(shortcut(doctors, filters, "hospital", "All", now), { value: "Unknown language", count: 0, selected: true });
  assert.deepEqual(toggle(filters, "Unknown language"), { ...filters, languages: [] });
  assert.deepEqual(shortcut(doctors, { ...filters, languages: ["Kannada"] }, "hospital", "Bangalore", now, []), { value: "Kannada", count: 0, selected: true });
});

test("source labels are preserved and repeated metadata counts a doctor only once", () => {
  const source = [doctor("one", ["kannada", "kannada"])];
  assert.deepEqual(shortcut(source, emptyDoctorFilters(), "hospital", "Bangalore", now), { value: "kannada", count: 1, selected: false });
  assert.deepEqual(toggle(emptyDoctorFilters(), "kannada").languages, ["kannada"]);
});

test("helpers preserve frozen source records and unrelated filter arrays", () => {
  const source = Object.freeze(doctors.map((item) => Object.freeze({ ...item, languages: Object.freeze([...item.languages]) })));
  const filters = Object.freeze({ ...emptyDoctorFilters(), languages: Object.freeze(["English"]), hospitals: Object.freeze(["Hospital A"]) });
  const before = JSON.stringify({ source, filters });
  assert.equal(shortcut(source, filters, "hospital", "Bangalore", now).count, 2);
  assert.deepEqual(toggle(filters, "Kannada").languages, ["English", "Kannada"]);
  assert.equal(JSON.stringify({ source, filters }), before);
});
