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

const { getDesign16HospitalPreview } = await import("../src/features/search/design16HospitalPreview.ts");
const { design16DoctorsInLocation, refineDesign16Doctors } = await import("../src/features/search/design16Refinements.ts");
const { emptyDoctorFilters, fromDirectoryDoctor, readListingParams, bookingUrl, sortDoctors } = await import("../src/features/search/doctorListing.ts");
const { isDesign3BookingSlotAvailable } = await import("../src/features/booking/design3Availability.ts");
const { requestDoctorPosition } = await import("../src/features/search/doctorPosition.ts");
const { searchDoctorsData } = await import("../src/app/search/mockDoctors.ts");
const { design3CityDoctors } = await import("../src/features/search/design3CityDoctors.ts");
const { design20Directory } = await import("../src/features/search/design20Directory.ts");

const now = new Date("2026-10-20T02:30:00Z");
const directory = searchDoctorsData.map(fromDirectoryDoctor);
const shetty = directory.find(doctor => doctor.id === "dr-1");
const arun = directory.find(doctor => doctor.id === "dr-3");
const distance = doctor => doctor.practiceLocations?.find(unit => unit.hospital === doctor.hospital)?.distanceKm;
const refine = (doctors, filters = emptyDoctorFilters(), date = "", mode = "hospital", selectedUnits = {}) =>
  refineDesign16Doctors(doctors, filters, mode, "nearest", date, false, new Set(), now, selectedUnits);

test("a unit keeps its sample kilometres across doctors, aliases and repeated evaluations", () => {
  const short = getDesign16HospitalPreview("Narayana Health City");
  const full = getDesign16HospitalPreview("Narayana Health City, Bangalore");
  assert.deepEqual(short, full);
  assert.ok(Number.isFinite(short.distanceKm) && short.distanceKm > 0);
  for (let iteration = 0; iteration < 5; iteration += 1) {
    assert.deepEqual(getDesign16HospitalPreview("Narayana Health City"), short);
  }
  const doctors = refine([shetty, arun], { ...emptyDoctorFilters(), hospitals: [shetty.hospital] });
  assert.equal(distance(doctors[0]), distance(doctors[1]));
});

test("directions use real unit destinations and route dummy units to the agreed Bangalore hospital", () => {
  const destinations = [
    ["Narayana Health City", "Narayana Health City, Bommasandra, Bengaluru"],
    ["Mazumdar Shaw Medical Centre, Bangalore", "Mazumdar Shaw Medical Center, Bommasandra, Bengaluru"],
    ["Narayana Institute of Cardiac Sciences, Bangalore", "Narayana Institute of Cardiac Sciences, Bangalore"],
    ["Narayana Multispeciality Hospital, HSR Bangalore", "Narayana Multispeciality Hospital, HSR Bangalore"],
    ["SRCC Children's Hospital, Mumbai", "Narayana Health SRCC Children's Hospital, Haji Ali, Mumbai"],
  ];
  for (const [hospital, destination] of destinations) {
    const url = new URL(getDesign16HospitalPreview(hospital).directionsUrl);
    assert.equal(url.origin, "https://www.google.com");
    assert.equal(url.pathname, "/maps/dir/");
    assert.equal(url.searchParams.get("api"), "1");
    assert.equal(url.searchParams.get("destination"), destination);
    assert.equal(url.searchParams.has("origin"), false);
  }
  for (const doctor of design3CityDoctors) {
    for (const hospital of doctor.hospitals) {
      const fictional = getDesign16HospitalPreview(hospital);
      assert.ok(fictional.distanceKm > 0);
      const url = new URL(fictional.directionsUrl);
      assert.equal(url.searchParams.get("destination"), "Narayana Health City, Bommasandra, Bengaluru");
      assert.equal(url.searchParams.has("origin"), false);
    }
  }
  assert.equal(getDesign16HospitalPreview("An unknown hospital"), null);
});

test("corrected D20 featured hospitals retain stable sample distances, their own directions and selected booking units", () => {
  for (const id of ["dr-1", "dr-ashley"]) {
    const doctor = design20Directory.find(doctor => doctor.id === id);
    const before = JSON.stringify(doctor);
    for (const hospital of doctor.hospitals) {
      const preview = getDesign16HospitalPreview(hospital);
      assert.equal(preview.city, "Bangalore");
      assert.ok(Number.isFinite(preview.distanceKm) && preview.distanceKm > 0);
      assert.deepEqual(getDesign16HospitalPreview(hospital), preview);
      assert.equal(new URL(preview.directionsUrl).searchParams.get("destination"), preview.directionsDestination);
      const [selected] = refineDesign16Doctors([doctor], { ...emptyDoctorFilters(), hospitals: [hospital] },
        "hospital", "nearest", "2026-10-23", false, new Set(), now, {}, "d20");
      assert.equal(selected.hospital, hospital);
      assert.equal(distance(selected), preview.distanceKm);
      const booking = new URL(bookingUrl(selected, "hospital", true, now), "https://preview.test");
      assert.equal(booking.searchParams.get("hospital"), hospital);
      assert.ok(isDesign3BookingSlotAvailable(id, "2026-10-23", booking.searchParams.get("time"), "hospital", hospital, now, 21, "d20"));
    }
    assert.equal(JSON.stringify(doctor), before);
  }
});

test("nearest orders only matching doctors, leaves unknown distances last, and does not mutate source data", () => {
  const known = { ...shetty, languages: ["Hindi"] };
  const mismatch = { ...arun, languages: ["English"] };
  const unknown = { ...known, id: "live-unknown", hospital: "Unregistered hospital", hospitals: ["Unregistered hospital"] };
  const cityDoctors = design3CityDoctors.filter(doctor => doctor.city === "Mumbai");
  const source = [unknown, mismatch, ...cityDoctors, known];
  const snapshot = JSON.stringify(source);
  const filters = { ...emptyDoctorFilters(), languages: ["Hindi"] };
  const results = refine(source, filters);
  assert.equal(results.some(doctor => doctor.id === mismatch.id), false);
  assert.equal(results.at(-1).id, unknown.id);
  const knownDistances = results.slice(0, -1).map(distance);
  assert.ok(knownDistances.every(Number.isFinite));
  assert.deepEqual(knownDistances, [...knownDistances].sort((a, b) => a - b));
  assert.equal(JSON.stringify(source), snapshot);
});

test("nearest chooses an eligible unit and an explicit hospital choice controls distance, slot and booking", () => {
  const [closest] = refine([shetty], emptyDoctorFilters(), "2026-10-23");
  const units = closest.practiceLocations;
  assert.equal(distance(closest), Math.min(...units.map(unit => unit.distanceKm)));
  const farther = units.find(unit => unit.hospital !== closest.hospital);
  const [selected] = refine([shetty], { ...emptyDoctorFilters(), hospitals: [farther.hospital] }, "2026-10-23");
  assert.equal(selected.hospital, farther.hospital);
  assert.equal(distance(selected), farther.distanceKm);
  assert.deepEqual(selected.practiceLocations.map(unit => unit.hospital), [farther.hospital]);
  const url = new URL(bookingUrl(selected, "hospital", true, now), "https://preview.test");
  assert.equal(url.searchParams.get("hospital"), farther.hospital);
  assert.equal(url.searchParams.get("city"), farther.city);
  assert.equal(url.searchParams.get("date"), "2026-10-23");
  assert.ok(isDesign3BookingSlotAvailable(selected.id, "2026-10-23", url.searchParams.get("time"), "hospital", farther.hospital, now, 21));
});

test("manually choosing a farther unit reorders that doctor and ignores invalid or filtered-out unit overrides", () => {
  const other = directory.find(doctor => doctor.id === "dr-4");
  const source = [shetty, other];
  const initial = refine(source, emptyDoctorFilters(), "2026-10-23");
  assert.deepEqual(initial.map(doctor => doctor.id), [shetty.id, other.id]);
  const farther = initial[0].practiceLocations.find(unit => unit.distanceKm > distance(initial[0]));
  assert.ok(farther);
  const selected = refine(source, emptyDoctorFilters(), "2026-10-23", "hospital", { [shetty.id]: farther.hospital });
  assert.deepEqual(selected.map(doctor => doctor.id), [other.id, shetty.id]);
  const switched = selected.find(doctor => doctor.id === shetty.id);
  assert.equal(switched.hospital, farther.hospital);
  assert.equal(distance(switched), farther.distanceKm);
  const booking = new URL(bookingUrl(switched, "hospital", true, now), "https://preview.test");
  assert.equal(booking.searchParams.get("hospital"), farther.hospital);
  assert.ok(isDesign3BookingSlotAvailable(switched.id, "2026-10-23", booking.searchParams.get("time"), "hospital", farther.hospital, now, 21));

  const [invalid] = refine([shetty], emptyDoctorFilters(), "2026-10-23", "hospital", { [shetty.id]: "Unrelated hospital" });
  assert.equal(invalid.hospital, initial[0].hospital);
  const [filtered] = refine([shetty], { ...emptyDoctorFilters(), hospitals: [initial[0].hospital] }, "2026-10-23", "hospital", { [shetty.id]: farther.hospital });
  assert.equal(filtered.hospital, initial[0].hospital);
  assert.deepEqual(filtered.hospitals, [initial[0].hospital]);
});

test("an unavailable near doctor never bypasses the chosen date", () => {
  const ashley = directory.find(doctor => doctor.id === "dr-ashley");
  assert.deepEqual(refine([ashley], { ...emptyDoctorFilters(), availability: "today" }), []);
  assert.equal(refine([ashley], { ...emptyDoctorFilters(), availability: "tomorrow" }).length, 1);
});

test("secondary city affiliations remain discoverable and book the selected city unit", () => {
  const source = JSON.stringify(arun);
  const mumbai = design16DoctorsInLocation([arun], "Mumbai");
  assert.equal(mumbai.length, 1);
  assert.equal(mumbai[0].city, "Mumbai");
  assert.deepEqual(mumbai[0].hospitals, ["SRCC Children's Hospital, Mumbai"]);
  const [selected] = refine(mumbai, emptyDoctorFilters(), "2026-10-23");
  const url = new URL(bookingUrl(selected, "hospital", true, now), "https://preview.test");
  assert.equal(url.searchParams.get("city"), "Mumbai");
  assert.equal(url.searchParams.get("hospital"), "SRCC Children's Hospital, Mumbai");
  const bangalore = design16DoctorsInLocation([arun], "Bangalore");
  assert.deepEqual(bangalore[0].hospitals, ["Narayana Health City, Bangalore"]);
  assert.deepEqual(design16DoctorsInLocation([arun], "Jaipur"), []);
  assert.equal(JSON.stringify(arun), source);
});

test("sample location metadata never overwrites an unknown live doctor's city or fabricates distance", () => {
  const live = { ...shetty, id: "live-source", city: "Provided city", availability: { hospital: "2026-10-23, 10:30 AM" } };
  const [selected] = refine([live], emptyDoctorFilters(), "2026-10-23");
  assert.equal(selected.city, live.city);
  assert.equal(distance(selected), undefined);
});

test("nearest URLs apply only to smart directory hospital visits and do not add applied filters", () => {
  for (const design of ["d16", "d17"]) {
    const selected = readListingParams(new URLSearchParams(`design=${design}&mode=hospital&sort=nearest`));
    assert.equal(selected.sort, "nearest");
    assert.deepEqual(selected.filters, emptyDoctorFilters());
  }
  for (const query of ["design=d16&mode=video&sort=nearest", "design=d17&mode=video&sort=nearest", "design=d6&mode=hospital&sort=nearest", "sort=nearest", "design=d16&sort=invalid", "design=d17&sort=invalid"]) {
    assert.equal(readListingParams(new URLSearchParams(query)).sort, "relevance");
  }
  const order = [arun, shetty];
  assert.deepEqual(sortDoctors(order, "nearest", "video", now).map(doctor => doctor.id), order.map(doctor => doctor.id));
});

async function withBrowser(navigatorValue, run, secure = true) {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  Object.defineProperty(globalThis, "window", { configurable: true, value: { isSecureContext: secure } });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: navigatorValue });
  try { await run(); }
  finally {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else delete globalThis.window;
    if (previousNavigator) Object.defineProperty(globalThis, "navigator", previousNavigator);
    else delete globalThis.navigator;
  }
}

test("denied permission does not trigger another location request", async () => {
  let requested = false;
  await withBrowser({
    permissions: { async query() { return { state: "denied" }; } },
    geolocation: { getCurrentPosition() { requested = true; } },
  }, async () => {
    assert.match((await requestDoctorPosition()).error, /blocked/i);
    assert.equal(requested, false);
  });
});

test("requests cancelled before or after the native location prompt cannot apply a stale position", async () => {
  let current = true;
  let requested = false;
  await withBrowser({
    permissions: { async query() { current = false; return { state: "prompt" }; } },
    geolocation: { getCurrentPosition() { requested = true; } },
  }, async () => {
    assert.match((await requestDoctorPosition(() => current)).error, /cancelled/);
    assert.equal(requested, false);
  });
  current = true;
  await withBrowser({ geolocation: { getCurrentPosition(success) {
    current = false;
    success({ coords: { latitude: 12.9716, longitude: 77.5946, accuracy: 50 } });
  } } }, async () => {
    const result = await requestDoctorPosition(() => current);
    assert.equal(result.position, undefined);
    assert.match(result.error, /cancelled/);
  });
});

test("a valid remote position is accepted without city mapping while invalid positions remain recoverable", async () => {
  const remote = { latitude: 51.5072, longitude: -0.1276, accuracy: 50 };
  await withBrowser({ geolocation: { getCurrentPosition(success) { success({ coords: remote }); } } }, async () => {
    assert.deepEqual(await requestDoctorPosition(), { position: remote });
  });
  for (const coords of [{ ...remote, accuracy: 20000 }, { ...remote, latitude: NaN }, { ...remote, longitude: 181 }]) {
    await withBrowser({ geolocation: { getCurrentPosition(success) { success({ coords }); } } }, async () => {
      const result = await requestDoctorPosition();
      assert.equal(result.position, undefined);
      assert.match(result.error, /precise location/);
    });
  }
});
