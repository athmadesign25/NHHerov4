import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import test from "node:test";
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

const time = await import("../src/features/booking/appointmentTime.ts");
const listing = await import("../src/features/search/doctorListing.ts");
const { getDesign3BookingSlots, isDesign3BookingSlotAvailable } = await import("../src/features/booking/design3Availability.ts");
const { searchDoctorsData } = await import("../src/app/search/mockDoctors.ts");
const { design3CityDoctors } = await import("../src/features/search/design3CityDoctors.ts");
const doctors = [...searchDoctorsData.map(listing.fromDirectoryDoctor), ...design3CityDoctors];

for (const zone of ["Asia/Kolkata", "UTC", "America/Los_Angeles", "Pacific/Auckland"]) {
  test(`India appointment day and advertised card/booking slots agree in ${zone}`, () => {
    const previous = process.env.TZ;
    process.env.TZ = zone;
    try {
      const now = new Date("2026-10-19T18:45:00.000Z"); // 00:15 on 20 October in India.
      assert.equal(time.indiaDate(now), "2026-10-20");
      assert.equal(time.indiaClock(now), "12:15 AM");
      assert.deepEqual(time.appointmentDates(now.getTime()).slice(0, 2), ["2026-10-20", "2026-10-21"]);
      assert.equal(time.appointmentDates(now.getTime()).at(-1), "2026-11-03");
      for (const doctor of doctors) for (const mode of ["hospital", "video"]) {
        const url = new URL(listing.bookingUrl(doctor, mode, true, now), "https://preview.test");
        if (!url.searchParams.get("time")) continue;
        const date = url.searchParams.get("date");
        const clock = url.searchParams.get("time");
        assert.ok(isDesign3BookingSlotAvailable(doctor.id, date, clock, mode, doctor.hospital, now), `${doctor.id}: ${mode}`);
        assert.equal(time.indiaClock(listing.nextSlot(doctor, mode, now)), clock);
      }
      const shetty = doctors.find(doctor => doctor.id === "dr-1");
      assert.equal(listing.nextSlot(shetty, "hospital", now).toISOString(), "2026-10-20T05:00:00.000Z");
      const ashley = doctors.find(doctor => doctor.id === "dr-ashley");
      const tomorrow = listing.filterDoctors([shetty, ashley], { ...listing.emptyDoctorFilters(), availability: "tomorrow" }, "hospital", now);
      assert.deepEqual(tomorrow.map(doctor => doctor.id), ["dr-ashley"]);
      assert.equal(getDesign3BookingSlots(shetty.id, "2026-10-19", "hospital", shetty.hospital, now).length, 0);
      assert.equal(listing.nextSlot(shetty, "hospital", new Date("2026-10-20T05:00:00.000Z")), null);
      assert.equal(isDesign3BookingSlotAvailable(shetty.id, "2026-10-20", "10:30 AM", "hospital", shetty.hospital, new Date("2026-10-20T05:00:00.000Z")), false);
    } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; }
  });
}

test("India timestamp conversion rejects impossible dates and clocks and handles midnight and noon", () => {
  for (const [date, clock] of [["2026-02-30", "10:30 AM"], ["2026-10-20", "00:30 AM"], ["2026-10-20", "13:30 PM"], ["2026-10-20", "10:60 AM"]]) {
    assert.equal(time.indiaAppointmentTimestamp(date, clock), null);
  }
  assert.equal(new Date(time.indiaAppointmentTimestamp("2026-10-20", "12:00 AM")).toISOString(), "2026-10-19T18:30:00.000Z");
  assert.equal(new Date(time.indiaAppointmentTimestamp("2026-10-20", "12:00 PM")).toISOString(), "2026-10-20T06:30:00.000Z");
});
