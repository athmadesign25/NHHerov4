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

const { readDesign16Date, refineDesign16Doctors, findDesign16NextAvailability, hasDesign16Availability } = await import("../src/features/search/design16Refinements.ts");
const { emptyDoctorFilters, fromDirectoryDoctor, bookingUrl, nextSlot } = await import("../src/features/search/doctorListing.ts");
const { getDesign3BookingSlots, isDesign3BookingSlotAvailable } = await import("../src/features/booking/design3Availability.ts");
const { searchDoctorsData } = await import("../src/app/search/mockDoctors.ts");
const { design3CityDoctors } = await import("../src/features/search/design3CityDoctors.ts");
const { DESIGN16_BOOKING_DAYS, indiaDate, indiaClock } = await import("../src/features/booking/appointmentTime.ts");

const now = new Date("2026-10-20T02:30:00Z"); // 08:00 India.
const directory = searchDoctorsData.map(fromDirectoryDoctor);
const shetty = directory.find((doctor) => doctor.id === "dr-1");
const ashley = directory.find((doctor) => doctor.id === "dr-ashley");
const ids = (doctors) => doctors.map((doctor) => doctor.id);
const noHistory = new Set();
const refine = (doctors, filters = emptyDoctorFilters(), mode = "hospital", date = "", history = false, bookedIds = noHistory, instant = now, sort = "relevance") =>
  refineDesign16Doctors(doctors, filters, mode, sort, date, history, bookedIds, instant);

function liveDoctor(id, overrides = {}) {
  return {
    ...shetty, id, name: `Dr ${id}`, hospitals: [shetty.hospital],
    languages: ["English"], gender: "Female", expertise: ["Heart failure"],
    availability: { hospital: "2026-10-23, 10:30 AM", video: "2026-10-24, 04:00 PM" },
    ...overrides,
  };
}

test("custom dates accept only real, canonical days inside the 21-day India booking window", () => {
  assert.equal(readDesign16Date("2026-10-20", now), "2026-10-20");
  assert.equal(readDesign16Date("2026-11-09", now), "2026-11-09");
  for (const date of [null, undefined, "", "2026-10-19", "2026-11-10", "2026-10-32", "2026-02-29", "2026-10-2", "2026-10-20T00:00:00Z", " 2026-10-20", "2026-10-20&mode=video", "__proto__"]) {
    assert.equal(readDesign16Date(date, now), "", String(date));
  }
  assert.deepEqual(refine([shetty], emptyDoctorFilters(), "hospital", "2026-10-32"), []);
});

test("India midnight controls validation and selected dates independently of the viewer timezone", () => {
  const before = new Date("2026-10-20T18:29:59Z");
  const midnight = new Date("2026-10-20T18:30:00Z");
  const previousZone = process.env.TZ;
  try {
    for (const zone of ["UTC", "Asia/Kolkata", "America/Los_Angeles", "Pacific/Auckland"]) {
      process.env.TZ = zone;
      assert.equal(readDesign16Date("2026-10-20", before), "2026-10-20");
      assert.equal(readDesign16Date("2026-10-20", midnight), "");
      assert.equal(readDesign16Date("2026-11-10", before), "");
      assert.equal(readDesign16Date("2026-11-10", midnight), "2026-11-10");
      const [doctor] = refine([shetty], { ...emptyDoctorFilters(), availability: "today" }, "hospital", "", false, noHistory, midnight);
      assert.equal(doctor.availability.hospital, "2026-10-21, 10:30 AM");
    }
  } finally {
    if (previousZone === undefined) delete process.env.TZ;
    else process.env.TZ = previousZone;
  }
});

test("a future date uses the full preview schedule and propagates its exact earliest slot to booking", () => {
  const date = "2026-10-23";
  const [doctor] = refine([shetty], emptyDoctorFilters(), "hospital", date);
  const expected = getDesign3BookingSlots(shetty.id, date, "hospital", shetty.hospital, now).find((slot) => slot.available);
  assert.equal(doctor.availability.hospital, `${date}, ${expected.time}`);
  assert.equal(doctor.availability.video, shetty.availability.video);
  const url = new URL(bookingUrl(doctor, "hospital", true, now), "https://preview.test");
  assert.equal(url.searchParams.get("date"), date);
  assert.equal(url.searchParams.get("time"), expected.time);
  assert.ok(isDesign3BookingSlotAvailable(doctor.id, date, expected.time, "hospital", doctor.hospital, now));
});

test("the 21st day can be booked in either mode, while day 22 and other designs keep their limits", () => {
  for (const mode of ["hospital", "video"]) {
    const [doctor] = refine([shetty], emptyDoctorFilters(), mode, "2026-11-09");
    assert.ok(doctor);
    const url = new URL(bookingUrl(doctor, mode, true, now), "https://preview.test");
    assert.equal(url.searchParams.get("date"), "2026-11-09");
    assert.ok(isDesign3BookingSlotAvailable(doctor.id, "2026-11-09", url.searchParams.get("time"), mode, doctor.hospital, now, DESIGN16_BOOKING_DAYS));
    assert.deepEqual(getDesign3BookingSlots(doctor.id, "2026-11-10", mode, doctor.hospital, now, DESIGN16_BOOKING_DAYS), []);
    assert.deepEqual(getDesign3BookingSlots(doctor.id, "2026-11-09", mode, doctor.hospital, now), []);
    assert.deepEqual(refine([shetty], emptyDoctorFilters(), mode, "2026-11-10"), []);
  }
});

test("Today, Tomorrow and Next 7 days use the full schedule, with explicit dates taking precedence", () => {
  assert.deepEqual(ids(refine([shetty, ashley], { ...emptyDoctorFilters(), availability: "today" })), [shetty.id]);
  assert.deepEqual(ids(refine([shetty, ashley], { ...emptyDoctorFilters(), availability: "tomorrow" })), [shetty.id, ashley.id]);
  const upcoming = refine([shetty, ashley], { ...emptyDoctorFilters(), availability: "week" });
  assert.equal(upcoming[0].availability.hospital, "2026-10-20, 10:30 AM");
  assert.equal(upcoming[1].availability.hospital, "2026-10-21, 11:30 AM");
  const [override] = refine([ashley], { ...emptyDoctorFilters(), availability: "today" }, "hospital", "2026-10-23");
  assert.equal(override.availability.hospital, "2026-10-23, 09:15 AM");
});

test("expired slots are excluded, Any date finds the next real slot, and earliest sorting uses refreshed times", () => {
  const expired = new Date("2026-10-20T05:00:00Z"); // Exactly 10:30 India.
  const [doctor] = refine([shetty], { ...emptyDoctorFilters(), availability: "today" }, "hospital", "", false, noHistory, expired);
  assert.equal(doctor.availability.hospital, "2026-10-20, 10:45 AM");
  assert.ok(nextSlot(doctor, "hospital", expired).getTime() > expired.getTime());
  const afterLastSlot = new Date("2026-10-20T14:30:00Z"); // Exactly 20:00 India.
  assert.deepEqual(refine([shetty], { ...emptyDoctorFilters(), availability: "today" }, "hospital", "", false, noHistory, afterLastSlot), []);
  const ranked = refine([ashley, shetty], emptyDoctorFilters(), "hospital", "", false, noHistory, afterLastSlot, "earliest");
  assert.deepEqual(ids(ranked), [shetty.id, ashley.id]);
  assert.equal(ranked[0].availability.hospital, "2026-10-21, 09:15 AM");
  assert.equal(ranked[1].availability.hospital, "2026-10-21, 11:30 AM");
  assert.equal(hasDesign16Availability([shetty], "hospital", afterLastSlot), true);
});

test("all nondate filters, hospital selection, mode and booked history remain effective together", () => {
  const selectedHospital = shetty.hospitals[1];
  const target = { ...shetty, languages: ["Hindi"], gender: "Female", expertise: ["Heart failure"] };
  const unmatched = liveDoctor("unmatched", { languages: ["English"] });
  const filters = {
    specialties: [shetty.speciality], hospitals: [selectedHospital], languages: ["Hindi"],
    genders: ["Female"], expertise: ["Heart failure"], availability: "today",
  };
  const [match] = refine([target, unmatched, ashley], filters, "hospital", "2026-10-23", true, new Set([shetty.id, "unmatched"]));
  assert.equal(match.id, shetty.id);
  assert.equal(match.hospital, selectedHospital);
  const url = new URL(bookingUrl(match, "hospital", true, now), "https://preview.test");
  assert.equal(url.searchParams.get("hospital"), selectedHospital);
  assert.ok(isDesign3BookingSlotAvailable(match.id, "2026-10-23", url.searchParams.get("time"), "hospital", selectedHospital, now));
  assert.deepEqual(refine([target], filters, "hospital", "2026-10-23", true, new Set(["another-doctor"])), []);
  assert.deepEqual(refine([ashley], emptyDoctorFilters(), "video", "2026-10-23"), []);
  const [video] = refine([shetty], { ...emptyDoctorFilters(), availability: "today" }, "video");
  assert.equal(video.availability.video, "2026-10-20, 02:00 PM");
});

test("unknown live IDs match only their supplied future slot, and unknown availability is never fabricated", () => {
  const knownTime = liveDoctor("live-with-time");
  const unknownTime = liveDoctor("live-no-time", { availability: {}, modes: { hospital: null, video: true } });
  assert.deepEqual(ids(refine([knownTime, unknownTime], emptyDoctorFilters(), "hospital", "2026-10-23")), [knownTime.id]);
  assert.deepEqual(refine([knownTime], emptyDoctorFilters(), "hospital", "2026-10-24"), []);
  assert.deepEqual(ids(refine([knownTime], emptyDoctorFilters(), "video", "2026-10-24")), [knownTime.id]);
  assert.equal(refine([unknownTime]).length, 1);
  assert.equal(hasDesign16Availability([unknownTime], "hospital", now), false);
  assert.equal(hasDesign16Availability([knownTime], "hospital", now), true);
  const instant = new Date("2026-10-23T05:00:00Z");
  assert.deepEqual(refine([knownTime], emptyDoctorFilters(), "hospital", "2026-10-23", false, noHistory, instant), []);
  assert.equal(hasDesign16Availability([knownTime], "hospital", instant), false);
});

test("relevance keeps source order and the provided city without inferring values from hospital names", () => {
  const unknownMode = liveDoctor("unknown-mode", { modes: { hospital: null, video: true }, city: "Provided city" });
  const knownMode = liveDoctor("known-mode");
  const results = refine([unknownMode, knownMode], emptyDoctorFilters(), "hospital", "2026-10-23");
  assert.deepEqual(ids(results), [unknownMode.id, knownMode.id]);
  assert.equal(results[0].city, "Provided city");
});

test("recovery suggests the nearest later day with count while preserving nondate filters and history", () => {
  const earlyMismatch = liveDoctor("different-language", { languages: ["Hindi"], availability: { hospital: "2026-10-21, 09:15 AM" } });
  const unbooked = liveDoctor("unbooked", { availability: { hospital: "2026-10-21, 09:15 AM" } });
  const first = liveDoctor("first");
  const sameDay = liveDoctor("same-day", { availability: { hospital: "2026-10-23, 04:00 PM" } });
  const later = liveDoctor("later", { availability: { hospital: "2026-10-24, 09:15 AM" } });
  const doctors = [earlyMismatch, unbooked, first, sameDay, later];
  const filters = { ...emptyDoctorFilters(), languages: ["English"], availability: "today" };
  const booked = new Set([earlyMismatch.id, first.id, sameDay.id, later.id]);
  const recovery = findDesign16NextAvailability(doctors, filters, "hospital", "", true, booked, now);
  assert.deepEqual(recovery, { date: "2026-10-23", count: 2 });
  assert.equal(refine(doctors, filters, "hospital", recovery.date, true, booked).length, recovery.count);
  assert.deepEqual(findDesign16NextAvailability(doctors, filters, "hospital", "2026-10-23", true, booked, now), { date: "2026-10-24", count: 1 });
  assert.equal(findDesign16NextAvailability(doctors, { ...filters, genders: ["Male"] }, "hospital", "", true, booked, now), null);
});

test("recovery observes current mode, expired times, the selected window and the 21-day limit", () => {
  const afterLastSlot = new Date("2026-10-20T14:30:00Z");
  assert.deepEqual(findDesign16NextAvailability([shetty], { ...emptyDoctorFilters(), availability: "today" }, "hospital", "", false, noHistory, afterLastSlot), { date: "2026-10-21", count: 1 });
  assert.equal(findDesign16NextAvailability([ashley], emptyDoctorFilters(), "video", "2026-10-20", false, noHistory, now), null);
  assert.deepEqual(findDesign16NextAvailability([shetty], { ...emptyDoctorFilters(), availability: "week" }, "hospital", "", false, noHistory, now), { date: "2026-10-27", count: 1 });
  assert.deepEqual(findDesign16NextAvailability([shetty], emptyDoctorFilters(), "hospital", "2026-11-08", false, noHistory, now), { date: "2026-11-09", count: 1 });
  assert.equal(findDesign16NextAvailability([shetty], emptyDoctorFilters(), "hospital", "2026-11-09", false, noHistory, now), null);
  assert.equal(findDesign16NextAvailability([shetty], emptyDoctorFilters(), "hospital", "2026-10-32", false, noHistory, now), null);
  const outside = liveDoctor("outside", { availability: { hospital: "2026-11-10, 10:30 AM" } });
  assert.equal(findDesign16NextAvailability([outside], emptyDoctorFilters(), "hospital", "2026-10-20", false, noHistory, now), null);
});

test("generated city previews use their schedule and refinements leave all inputs untouched", () => {
  const cityDoctor = design3CityDoctors.find((doctor) => doctor.hospitals.length > 1);
  const source = [shetty, cityDoctor];
  const filters = { ...emptyDoctorFilters(), hospitals: [cityDoctor.hospitals[1]] };
  const before = JSON.stringify({ source, filters });
  const booked = new Set([cityDoctor.id]);
  const result = refine(source, filters, "hospital", "2026-10-23", true, booked);
  assert.deepEqual(ids(result), [cityDoctor.id]);
  const slot = nextSlot(result[0], "hospital", now);
  assert.equal(indiaDate(slot), "2026-10-23");
  assert.ok(isDesign3BookingSlotAvailable(cityDoctor.id, indiaDate(slot), indiaClock(slot), "hospital", cityDoctor.hospitals[1], now));
  findDesign16NextAvailability(source, filters, "hospital", "2026-10-23", true, booked, now);
  assert.equal(JSON.stringify({ source, filters }), before);
  assert.deepEqual([...booked], [cityDoctor.id]);
});
