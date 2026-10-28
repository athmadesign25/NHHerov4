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

const { FEE_OPTIONS, readFeeFilter, filterByFee } = await import("../src/app/search/designs/d14/filtering.ts");
const { refineDesign7Doctors } = await import("../src/app/search/designs/d7/directory.ts");
const { emptyDoctorFilters, readListingParams, doctorFilterOptions, activeFilterCount } = await import("../src/features/search/doctorListing.ts");
const now = new Date("2026-10-20T02:30:00Z");
const ids = (doctors) => doctors.map((doctor) => doctor.id);

function doctor(id, fee, overrides = {}) {
  return {
    id, name: `Dr ${id}`, speciality: "Cardiologist", degrees: "MBBS", hospital: "Hospital A, Bangalore",
    city: "Bangalore", experience: "10 years", img: "", fee, rating: 0, reviews: 0,
    modes: { hospital: true, video: false }, languages: ["English"],
    availability: { hospital: "Tomorrow, 11:30 AM" }, ...overrides,
  };
}

test("D14 recognizes only published fee filter keys and safely ignores invalid parameters", () => {
  assert.deepEqual(FEE_OPTIONS.map((option) => option.value), ["any", "under1000", "1000to1500", "above1500"]);
  for (const { value } of FEE_OPTIONS) assert.equal(readFeeFilter(value), value);
  for (const value of [null, undefined, "", "UNDER1000", "under-1500", "0", "Infinity", "__proto__", "<script>", "above1500&mode=video"]) {
    assert.equal(readFeeFilter(value), "any", String(value));
  }
});

test("fee boundaries have no gaps or overlap at 1000 and 1500, including paise", () => {
  const doctors = [
    doctor("free", "₹0"), doctor("below", "₹999.99"), doctor("lower", "₹1,000"),
    doctor("middle", "₹1,250"), doctor("upper", "₹1,500.00"), doctor("above", "₹1,500.01"),
  ];
  assert.deepEqual(ids(filterByFee(doctors, "under1000")), ["free", "below"]);
  assert.deepEqual(ids(filterByFee(doctors, "1000to1500")), ["lower", "middle", "upper"]);
  assert.deepEqual(ids(filterByFee(doctors, "above1500")), ["above"]);
  const partition = FEE_OPTIONS.filter((option) => option.value !== "any").flatMap((option) => ids(filterByFee(doctors, option.value)));
  assert.deepEqual(partition, ids(doctors));
  assert.equal(new Set(partition).size, doctors.length);
});

test("explicit rupee, INR, Rs and numeric prices are recognized consistently", () => {
  const values = ["₹1,200", "INR 1,200", "inr1200", "Rs. 1,200.00", "Rs 1200", "1200", "  ₹ 1,200.50  "];
  const doctors = values.map((fee, index) => doctor(String(index), fee));
  assert.deepEqual(filterByFee(doctors, "1000to1500"), doctors);
  assert.equal(filterByFee(doctors, "under1000").length, 0);
});

test("Any fee retains unknown or descriptive prices while explicit bands exclude them", () => {
  const values = ["", "   ", "Contact hospital", "Not listed", "From ₹900", "₹1,000–₹1,500", "₹1,200 / visit", "-1200", "NaN", "Infinity", "₹1,200.001"];
  const doctors = values.map((fee, index) => doctor(String(index), fee));
  assert.deepEqual(filterByFee(doctors, "any"), doctors);
  for (const band of ["under1000", "1000to1500", "above1500"]) assert.deepEqual(filterByFee(doctors, band), []);
});

const combinedDoctors = [
  doctor("today-low", "₹900", { availability: { hospital: "Today, 10:30 AM" } }),
  doctor("tomorrow-lower", "₹1,000", { languages: ["Hindi"] }),
  doctor("tomorrow-upper", "₹1,500", { speciality: "Neurologist", hospital: "Hospital B, Bangalore", languages: ["Hindi"] }),
  doctor("language-mismatch", "₹1,200", { languages: ["Bengali"] }),
  doctor("unknown-fee", "", { languages: ["Hindi"] }),
  doctor("today-middle", "₹1,200", { speciality: "Neurologist", hospital: "Hospital B, Bangalore", availability: { hospital: "Today, 11:30 AM" } }),
  doctor("video-only", "₹1,200", { modes: { hospital: false, video: true }, availability: { video: "Tomorrow, 11:30 AM" } }),
];
const combinedFilters = {
  ...emptyDoctorFilters(), specialties: ["Cardiologist", "Neurologist"],
  hospitals: ["Hospital A, Bangalore", "Hospital B, Bangalore"],
  languages: ["English", "Hindi"], availability: "tomorrow",
};

test("fee combines with availability and OR within multi-select groups, preserving sort order", () => {
  const ranked = refineDesign7Doctors(combinedDoctors, combinedFilters, "hospital", "fee_desc", now);
  assert.deepEqual(ids(filterByFee(ranked, "1000to1500")), ["tomorrow-upper", "tomorrow-lower"]);
  assert.deepEqual(ids(filterByFee(ranked, "any")), ["tomorrow-upper", "tomorrow-lower", "unknown-fee"]);
  const today = refineDesign7Doctors(combinedDoctors, { ...combinedFilters, availability: "today" }, "hospital", "relevance", now);
  assert.deepEqual(ids(filterByFee(today, "1000to1500")), ["today-middle"]);
});

test("fee and availability combinations can produce a truthful, recoverable empty result", () => {
  const tomorrow = refineDesign7Doctors(combinedDoctors, combinedFilters, "hospital", "relevance", now);
  assert.deepEqual(filterByFee(tomorrow, "above1500"), []);
  assert.equal(filterByFee(tomorrow, "any").length, 3);
  const cleared = refineDesign7Doctors(combinedDoctors, emptyDoctorFilters(), "hospital", "relevance", now);
  assert.equal(filterByFee(cleared, "any").length, combinedDoctors.length - 1);
});

test("unknown selected facets survive URL parsing and remain removable without discarding other filters", () => {
  const params = new URLSearchParams("specialties=Unknown+speciality&specialties=Unknown+speciality&languages=Hindi&availability=tomorrow&fee=1000to1500");
  const { filters, mode, sort } = readListingParams(params);
  assert.deepEqual(filters.specialties, ["Unknown speciality"]);
  assert.equal(activeFilterCount(filters), 3);
  assert.deepEqual(filterByFee(refineDesign7Doctors(combinedDoctors, filters, mode, sort, now), readFeeFilter(params.get("fee"))), []);
  const selectedOption = doctorFilterOptions(combinedDoctors, filters, mode, "specialties").find((option) => option.value === "Unknown speciality");
  assert.ok(selectedOption);
  assert.equal(selectedOption.count, 0);
  const removed = { ...filters, specialties: filters.specialties.filter((value) => value !== "Unknown speciality") };
  assert.deepEqual(ids(filterByFee(refineDesign7Doctors(combinedDoctors, removed, mode, sort, now), "1000to1500")), ["tomorrow-lower", "tomorrow-upper"]);
  assert.deepEqual(removed.languages, ["Hindi"]);
  assert.equal(removed.availability, "tomorrow");
});

test("fee refinement does not mutate the source list or reorder surviving doctors", () => {
  const doctors = Object.freeze([Object.freeze(doctor("upper", "₹1,500")), Object.freeze(doctor("low", "₹900")), Object.freeze(doctor("lower", "₹1,000"))]);
  const before = JSON.stringify(doctors);
  const any = filterByFee(doctors, "any");
  assert.notEqual(any, doctors);
  assert.deepEqual(ids(filterByFee(doctors, "1000to1500")), ["upper", "lower"]);
  assert.equal(JSON.stringify(doctors), before);
});
