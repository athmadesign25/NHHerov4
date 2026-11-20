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

const { getDesign20Availability } = await import("../src/features/search/design20Availability.ts");
const { design20Directory } = await import("../src/features/search/design20Directory.ts");
const { doctorHospitals } = await import("../src/features/search/doctorListing.ts");
const { getDesign3BookingSlots, isDesign3BookingSlotAvailable } = await import("../src/features/booking/design3Availability.ts");
const { indiaDate, indiaClock } = await import("../src/features/booking/appointmentTime.ts");
const now = new Date("2026-10-20T02:30:00Z");
const doctor = design20Directory.find(doctor => doctor.id === "dr-1");
const resolve = (value = doctor, mode = "hospital", date = "", filter = "any", instant = now) =>
  getDesign20Availability(value, mode, date, filter, instant);

test("both advertised modes correspond to bookable slots for the displayed practice", () => {
  for (const hospital of doctorHospitals(doctor)) {
    for (const mode of ["hospital", "video"]) {
      const slot = resolve({ ...doctor, hospital }, mode, "2026-10-23");
      assert.ok(slot, `${mode} at ${hospital}`);
      assert.equal(indiaDate(slot), "2026-10-23");
      assert.equal(isDesign3BookingSlotAvailable(doctor.id, indiaDate(slot), indiaClock(slot), mode, hospital, now, 21, "d20"), true);
      assert.equal(indiaClock(slot), getDesign3BookingSlots(doctor.id, "2026-10-23", mode, hospital, now, 21, "d20").find(slot => slot.available).time);
    }
  }
});

test("alternate-mode availability follows the chosen date instead of stale listing text", () => {
  const stale = { ...doctor, availability: { hospital: "2026-10-20, 10:30 AM", video: "2026-10-21, 04:00 PM" } };
  assert.equal(indiaDate(resolve(stale, "video", "2026-10-25")), "2026-10-25");
  assert.equal(indiaDate(resolve(stale, "hospital", "2026-10-25")), "2026-10-25");
});

test("today and tomorrow filters apply independently to both modes", () => {
  for (const mode of ["hospital", "video"]) {
    assert.equal(indiaDate(resolve(doctor, mode, "", "today")), indiaDate(now));
    assert.equal(indiaDate(resolve(doctor, mode, "", "tomorrow")), indiaDate(now, 1));
  }
  // A chosen calendar date supersedes the quick-date filter, as in listing.
  assert.equal(indiaDate(resolve(doctor, "video", "2026-10-25", "today")), "2026-10-25");
});

test("past, malformed and out-of-window dates cannot advertise a slot", () => {
  for (const date of ["2026-10-19", "2026-10-32", "2026-10-2", "2026-11-10"]) {
    assert.equal(resolve(doctor, "hospital", date), null, date);
    assert.equal(resolve(doctor, "video", date), null, date);
  }
  assert.equal(indiaDate(resolve(doctor, "hospital", "2026-11-09")), "2026-11-09");
});

test("unsupported and unknown modes never borrow the preview doctor's schedule", () => {
  for (const mode of ["hospital", "video"]) {
    for (const supported of [false, null]) {
      assert.equal(resolve({ ...doctor, modes: { ...doctor.modes, [mode]: supported } }, mode), null);
    }
  }
  assert.equal(resolve({ ...doctor, hospital: "An unrelated hospital", hospitals: ["An unrelated hospital"] }), null);
});

test("unknown IDs retain only supplied future availability and never receive generated slots", () => {
  const live = { ...doctor, id: "live-only", availability: { hospital: "2026-10-23, 10:30 AM", video: "2026-10-24, 04:00 PM" } };
  assert.equal(resolve(live, "hospital")?.toISOString(), "2026-10-23T05:00:00.000Z");
  assert.equal(resolve(live, "video")?.toISOString(), "2026-10-24T10:30:00.000Z");
  assert.equal(resolve(live, "video", "2026-10-23"), null);
  assert.equal(resolve(live, "hospital", "", "today"), null);
  assert.equal(resolve({ ...live, availability: {} }), null);
  assert.equal(resolve({ ...live, availability: { hospital: "2026-10-19, 10:30 AM" } }), null);
});

test("next-seven-days filters exclude an advertised eighth-day appointment", () => {
  const live = { ...doctor, id: "live-only", availability: { hospital: "2026-10-27, 10:30 AM" } };
  assert.equal(resolve(live, "hospital", "", "week"), null);
  assert.ok(resolve(live, "hospital"));
});

test("resolution leaves the card's fee, selected practice and source data unchanged", () => {
  const before = structuredClone(doctor);
  resolve(doctor, "hospital", "2026-10-25");
  resolve(doctor, "video", "2026-10-25");
  assert.deepEqual(doctor, before);
});
