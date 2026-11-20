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

const { design17ProfileAvailability, design17ProfileDetails, design17ProfileUrl, getDesign17ProfileDoctor, getDesign17RelatedDoctors, selectDesign17ProfileHospital } = await import("../src/features/search/design17Profile.ts");
const { design17BookingUrl } = await import("../src/features/search/design17Booking.ts");
const now = new Date("2026-10-20T02:30:00Z");
const srcc = "SRCC Children's Hospital, Mumbai";
const healthCity = "Narayana Health City, Bangalore";
const profile = (id, hospital) => getDesign17ProfileDoctor(id, new URLSearchParams({ hospital }));

test("a secondary cross-city hospital retains its city from card through profile and booking", () => {
  const selected = profile("dr-3", srcc);
  assert.equal(selected.hospital, srcc);
  assert.equal(selected.city, "Mumbai");
  const details = design17ProfileDetails(selected);
  assert.equal(details.locations.find(location => location.name === srcc).city, "Mumbai");
  assert.equal(details.locations.find(location => location.name === healthCity).city, "Bangalore");
  for (const design of ["d17", "d17-lite"]) {
    const returnTo = `/search/doctors?design=${design}&location=Mumbai&mode=hospital&appointmentDate=2026-10-23`;
    const url = new URL(design17ProfileUrl(selected, "hospital", "2026-10-23", false, design, returnTo), "https://preview.test");
    const restored = getDesign17ProfileDoctor(selected.id, url.searchParams);
    const booking = new URL(design17BookingUrl(restored, "hospital", url.searchParams.get("date"), now, design, url.searchParams.get("returnTo")), "https://preview.test");
    assert.equal(booking.searchParams.get("hospital"), srcc);
    assert.equal(booking.searchParams.get("city"), "Mumbai");
    assert.equal(booking.searchParams.get("date"), "2026-10-23");
    assert.equal(booking.searchParams.get("mode"), "hospital");
    assert.equal(booking.searchParams.get("returnTo"), returnTo);
  }
});

test("changing hospital on the profile resolves the new city and rejects unrelated affiliations", () => {
  const selected = profile("dr-3", srcc);
  const before = JSON.stringify(selected);
  const changed = selectDesign17ProfileHospital(selected, healthCity);
  assert.equal(changed.hospital, healthCity);
  assert.equal(changed.city, "Bangalore");
  assert.equal(JSON.stringify(selected), before);
  const invalid = selectDesign17ProfileHospital(selected, "Unknown Hospital, Delhi");
  assert.equal(invalid.hospital, srcc);
  assert.equal(invalid.city, "Mumbai");
  const unrelated = profile("dr-1", srcc);
  assert.equal(unrelated.hospital, healthCity);
  assert.equal(unrelated.city, "Bangalore");
});

test("fictional city fixtures retain presentation names and never inherit a different hospital", () => {
  const selected = profile("d3-preview-38-1", srcc);
  assert.equal(selected.name, "Dr. Ananya Rao");
  assert.equal(selected.city, "Guwahati");
  assert.notEqual(selected.hospital, srcc);
  assert.ok(design17ProfileDetails(selected).locations.every(location => location.city === "Guwahati"));
});

test("related doctors offer the selected mode and preserve it through profile and booking links", () => {
  for (const mode of ["hospital", "video"]) {
    const doctors = getDesign17RelatedDoctors("dr-1", mode, "Dr. Devi Prasad Shetty");
    assert.ok(doctors.length > 0);
    assert.ok(doctors.every(doctor => doctor.id !== "dr-1" && doctor.modes[mode] === true));
    if (mode === "hospital") assert.ok(!doctors.some(doctor => doctor.id === "dr-2"));
    else {
      assert.ok(doctors.some(doctor => doctor.id === "dr-2"));
      assert.ok(!doctors.some(doctor => doctor.id === "dr-ashley"));
    }
    for (const design of ["d17", "d17-lite"]) for (const doctor of doctors) {
      const returnTo = `/search/doctors?design=${design}&mode=${mode}&q=heart`;
      const urls = [
        design17ProfileUrl(doctor, mode, "2026-10-23", false, design, returnTo),
        design17BookingUrl(doctor, mode, "2026-10-23", now, design, returnTo),
      ];
      for (const href of urls) {
        const url = new URL(href, "https://preview.test");
        assert.equal(url.searchParams.get("mode"), mode);
        assert.equal(url.searchParams.get("date"), "2026-10-23");
        assert.equal(url.searchParams.get("design"), design);
        assert.equal(url.searchParams.get("returnTo"), returnTo);
      }
    }
  }
});

test("related availability uses the selected mode and India date and time", () => {
  const doctor = profile("dr-1", healthCity);
  assert.equal(design17ProfileAvailability(doctor, "hospital", now), "Today, 10:30 AM");
  assert.equal(design17ProfileAvailability(doctor, "video", now), "Today, 02:00 PM");
  const midnight = new Date("2026-10-20T18:45:00Z"); // Already 21 Oct in India.
  const absolute = { ...doctor, availability: { hospital: "2026-10-21, 09:15 AM", video: "2026-10-23, 04:00 PM" } };
  assert.equal(design17ProfileAvailability(absolute, "hospital", midnight), "Today, 09:15 AM");
  assert.equal(design17ProfileAvailability(absolute, "video", midnight), "23 Oct, 04:00 PM");
  assert.equal(design17ProfileAvailability({ ...doctor, availability: { hospital: "Tomorrow, 11:45 AM" } }, "hospital", midnight), "Tomorrow, 11:45 AM");
});

test("unknown, elapsed and unsupported related availability does not invent a slot", () => {
  const doctor = profile("dr-1", healthCity);
  assert.equal(design17ProfileAvailability({ ...doctor, availability: {} }, "hospital", now), "Check availability");
  assert.equal(design17ProfileAvailability({ ...doctor, modes: { hospital: false, video: true } }, "hospital", now), "Check availability");
  assert.equal(design17ProfileAvailability(doctor, "hospital", new Date("2026-10-20T08:00:00Z")), "Check availability");
});
