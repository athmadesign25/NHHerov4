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

const { design17BookingUrl } = await import("../src/features/search/design17Booking.ts");
const { refineDesign16Doctors } = await import("../src/features/search/design16Refinements.ts");
const { emptyDoctorFilters, fromDirectoryDoctor } = await import("../src/features/search/doctorListing.ts");
const { searchDoctorsData } = await import("../src/app/search/mockDoctors.ts");
const now = new Date("2026-10-20T02:30:00Z");
const doctor = fromDirectoryDoctor(searchDoctorsData.find(item => item.id === "dr-1"));
const urlFor = (item = doctor, mode = "hospital", date = "", instant = now) =>
  new URL(design17BookingUrl(item, mode, date, instant), "https://preview.test");

test("Tomorrow refinement preserves the displayed day without preselecting a time", () => {
  const [refined] = refineDesign16Doctors([doctor], { ...emptyDoctorFilters(), availability: "tomorrow" }, "hospital", "relevance", "", false, new Set(), now);
  assert.ok(refined);
  const url = urlFor(refined);
  assert.equal(url.searchParams.get("date"), "2026-10-21");
  assert.equal(url.searchParams.has("time"), false);
  assert.equal(url.searchParams.get("design"), "d17");
});

test("a valid chosen day takes precedence over earlier availability, including the final booking day", () => {
  for (const date of ["2026-10-20", "2026-10-23", "2026-11-09"]) {
    const url = urlFor(doctor, "hospital", date);
    assert.equal(url.searchParams.get("date"), date);
    assert.equal(url.searchParams.has("time"), false);
  }
});

test("booking keeps the selected hospital and city; video uses its own next day without a hospital parameter", () => {
  const selected = { ...doctor, hospital: "Selected hospital & centre", city: "Selected city", availability: {
    hospital: "2026-10-22, 10:30 AM", video: "2026-10-24, 11:30 AM",
  } };
  const hospital = urlFor(selected);
  assert.equal(hospital.searchParams.get("hospital"), selected.hospital);
  assert.equal(hospital.searchParams.get("city"), selected.city);
  assert.equal(hospital.searchParams.get("mode"), "hospital");
  assert.equal(hospital.searchParams.get("date"), "2026-10-22");
  const video = urlFor({ ...selected, modes: { hospital: true, video: true } }, "video");
  assert.equal(video.searchParams.get("mode"), "video");
  assert.equal(video.searchParams.get("city"), selected.city);
  assert.equal(video.searchParams.has("hospital"), false);
  assert.equal(video.searchParams.get("date"), "2026-10-24");
  assert.equal(video.searchParams.has("time"), false);
});

test("invalid chosen dates fall back to valid advertised availability", () => {
  const selected = { ...doctor, availability: { hospital: "2026-10-22, 10:30 AM" } };
  for (const date of ["2026-10-19", "2026-11-10", "2026-10-32", "not-a-date", "2026-10-22&time=09:00 AM"]) {
    const url = urlFor(selected, "hospital", date);
    assert.equal(url.searchParams.get("date"), "2026-10-22");
    assert.equal(url.searchParams.has("time"), false);
  }
});

test("missing, elapsed, unsupported and out-of-window slots do not invent a booking date", () => {
  for (const selected of [
    { ...doctor, availability: {} },
    { ...doctor, availability: { hospital: "2026-10-20, 07:00 AM" } },
    { ...doctor, availability: { hospital: "2026-11-10, 10:30 AM" } },
    { ...doctor, modes: { hospital: false, video: true } },
  ]) {
    const url = urlFor(selected, "hospital", "2026-10-32");
    assert.equal(url.searchParams.has("date"), false);
    assert.equal(url.searchParams.has("time"), false);
    assert.equal(url.searchParams.get("design"), "d17");
  }
});

test("relative availability follows the India day when UTC is still on the previous day", () => {
  const instant = new Date("2026-10-20T18:45:00Z");
  const selected = { ...doctor, availability: { hospital: "Tomorrow, 10:30 AM" } };
  const url = urlFor(selected, "hospital", "", instant);
  assert.equal(url.searchParams.get("date"), "2026-10-22");
  assert.equal(url.searchParams.has("time"), false);
});

const { design17ConsultationHistory } = await import("../src/features/search/design17ConsultationHistory.ts");
const signedInDirectory = { variant: "d17", live: false, authenticated: true };

test("Design 17 supplies two consultation-history doctors with hospital and video options", () => {
  const history = design17ConsultationHistory(new Set(), signedInDirectory);
  const directory = searchDoctorsData.map(fromDirectoryDoctor);
  for (const mode of ["hospital", "video"]) {
    const results = refineDesign16Doctors(directory, emptyDoctorFilters(), mode, "relevance", "", true, history, now);
    assert.deepEqual(results.map(item => item.id), ["dr-1", "dr-3"]);
  }
});

test("sample history is isolated from signed-out users, API search and other designs", () => {
  const session = new Set(["dr-7"]);
  for (const context of [
    { ...signedInDirectory, authenticated: false },
    { ...signedInDirectory, live: true },
    { ...signedInDirectory, variant: "d16" },
    { ...signedInDirectory, variant: "d6" },
  ]) assert.equal(design17ConsultationHistory(session, context), session);
});

test("sample history retains session IDs without mutating or duplicating them", () => {
  const session = new Set(["dr-1", "dr-7"]);
  const history = design17ConsultationHistory(session, signedInDirectory);
  assert.deepEqual([...session], ["dr-1", "dr-7"]);
  assert.deepEqual([...history], ["dr-1", "dr-7", "dr-3"]);
  const cardiology = refineDesign16Doctors(searchDoctorsData.map(fromDirectoryDoctor), {
    ...emptyDoctorFilters(), specialties: ["Cardiologist"],
  }, "hospital", "relevance", "", true, history, now);
  assert.deepEqual(cardiology.map(item => item.id), ["dr-1"]);
});


test("Lite retains the same booking context while preserving its preview through navigation", async () => {
  const { design17ProfileUrl } = await import("../src/features/search/design17Profile.ts");
  const booking = new URL(design17BookingUrl(doctor, "hospital", "2026-10-23", now, "d17-lite"), "https://preview.test");
  const profile = new URL(design17ProfileUrl(doctor, "hospital", "2026-10-23", false, "d17-lite"), "https://preview.test");
  for (const url of [booking, profile]) {
    assert.equal(url.searchParams.get("design"), "d17-lite");
    assert.equal(url.searchParams.get("hospital"), doctor.hospital);
    assert.equal(url.searchParams.get("date"), "2026-10-23");
    assert.equal(url.searchParams.get("mode"), "hospital");
  }
});

const { design17ListingReturnTo } = await import("../src/features/search/design17Navigation.ts");
const { design17ProfileUrl, getDesign17ProfileDoctor } = await import("../src/features/search/design17Profile.ts");

test("card, profile and booking round trips preserve the listing refinements in both previews", () => {
  for (const design of ["d17", "d17-lite"]) {
    const listing = `/search/doctors?design=${design}&location=Bangalore&q=heart&mode=video&languages=Kannada&languages=English&hospitals=Hospital+A&availability=tomorrow&booked=1&date=2026-10-23`;
    const profile = new URL(design17ProfileUrl(doctor, "video", "2026-10-23", false, design, listing), "https://preview.test");
    const selected = getDesign17ProfileDoctor(doctor.id, profile.searchParams);
    assert.ok(selected);
    const booking = new URL(design17BookingUrl(selected, "video", profile.searchParams.get("date"), now, design, profile.searchParams.get("returnTo")), "https://preview.test");
    const backToProfile = new URL(design17ProfileUrl(selected, "video", booking.searchParams.get("date"), false, design, booking.searchParams.get("returnTo")), "https://preview.test");
    for (const url of [profile, booking, backToProfile]) {
      assert.equal(url.searchParams.get("design"), design);
      assert.equal(url.searchParams.get("returnTo"), listing);
      assert.equal(url.searchParams.get("mode"), "video");
    }
    assert.equal(design17ListingReturnTo(backToProfile.searchParams.get("returnTo"), design), listing);
  }
});

test("return destinations allow reviewed directory routes, never external or doctor-detail URLs", () => {
  for (const design of ["d17", "d17-lite"]) {
    const fallback = `/search/doctors?design=${design}&location=All`;
    for (const unsafe of [undefined, null, "", "https://external.test/search", "//external.test/search", "/\\external.test/search", "javascript:alert(1)", "/doctors/dr-1", "/doctors/dr-1/book", "/search/hospitals", "/book-an-appointment/not-a-speciality", "/search\n/doctors"]) {
      assert.equal(design17ListingReturnTo(unsafe, design), fallback);
    }
    const landing = new URL(design17ListingReturnTo("/book-an-appointment/cardiologist/bangalore?design=d3&languages=Kannada&returnTo=%2Fexternal#ignored", design), "https://preview.test");
    assert.equal(landing.pathname, "/book-an-appointment/cardiologist/bangalore");
    assert.equal(landing.searchParams.get("design"), design);
    assert.equal(landing.searchParams.get("languages"), "Kannada");
    assert.equal(landing.searchParams.has("returnTo"), false);
    assert.equal(landing.hash, "");
    assert.equal(design17ListingReturnTo("/search?location=Kolkata&design=d17", design), `/search?location=Kolkata&design=${design}`);
  }
});

test("missing or stale listing context cannot send either preview into the other design", () => {
  for (const design of ["d17", "d17-lite"]) {
    const other = design === "d17" ? "d17-lite" : "d17";
    for (const returnTo of [undefined, `/search/doctors?location=Kolkata&design=${other}`]) {
      for (const url of [
        new URL(design17ProfileUrl(doctor, "hospital", "", false, design, returnTo), "https://preview.test"),
        new URL(design17BookingUrl(doctor, "hospital", "", now, design, returnTo), "https://preview.test"),
      ]) {
        const listing = new URL(url.searchParams.get("returnTo"), "https://preview.test");
        assert.equal(url.searchParams.get("design"), design);
        assert.equal(listing.searchParams.get("design"), design);
        assert.equal(listing.searchParams.get("location"), returnTo ? "Kolkata" : "All");
      }
    }
  }
});
