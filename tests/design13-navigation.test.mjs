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

const { safeReturnTo, quickBookingHref, doctorReturnId } = await import("../src/features/booking/design13/navigation.ts");
const { design7Doctors } = await import("../src/app/search/designs/d7/directory.ts");
const { isDesign3BookingSlotAvailable } = await import("../src/features/booking/design3Availability.ts");
const { isJourneyDesign, isQuickJourneyDesign, resolveJourneyDesign, JOURNEY_DESIGN_NAMES } = await import("../src/features/design-preview/journeyDesigns.ts");
const origin = "https://example.test";
const fallback = "/search/doctors?design=d13";
const doctor = design7Doctors.find((item) => item.id === "dr-1");
const now = new Date("2026-10-20T02:30:00Z");

test("D14 is a registered quick journey while earlier variants remain recognized", () => {
  assert.equal(isJourneyDesign("d14"), true);
  assert.equal(isQuickJourneyDesign("d14"), true);
  assert.equal(isQuickJourneyDesign("d13"), true);
  assert.equal(isQuickJourneyDesign("d12"), false);
  assert.equal(resolveJourneyDesign("d14"), "d14");
  assert.equal(JOURNEY_DESIGN_NAMES.d14, "Care, in focus");
  assert.equal(resolveJourneyDesign("unrecognized"), "d7");
});

for (const variant of ["d13", "d14"]) test(`${variant} card and profile actions retain the variant and fee-filter return context`, () => {
  const returnTo = "/search/doctors?design=d12&fee=1000to1500&location=Bangalore&shown=18#doctor-dr-1";
  for (const intent of ["slot", "choose"]) {
    const url = new URL(quickBookingHref(doctor, "hospital", now, returnTo, intent, variant), origin);
    assert.equal(url.searchParams.get("design"), variant);
    assert.equal(url.searchParams.get("intent"), intent);
    const back = new URL(url.searchParams.get("returnTo"), origin);
    assert.equal(back.searchParams.get("design"), variant);
    assert.equal(back.searchParams.get("fee"), "1000to1500");
    assert.equal(back.searchParams.get("shown"), "18");
    assert.equal(back.hash, "#doctor-dr-1");
    assert.equal(url.searchParams.has("time"), intent === "slot");
  }
  assert.equal(safeReturnTo("https://outside.example", "https://also-outside.example", variant), `/search/doctors?design=${variant}`);
  assert.equal(new URL(safeReturnTo(returnTo, fallback, variant), origin).searchParams.get("design"), variant);
});

test("return to results preserves filters, sorting, load count and the selected doctor", () => {
  const value = "/search/doctors?design=d7&q=Shetty&location=Bangalore&mode=hospital&sort=earliest&languages=English&languages=Hindi&shown=18#doctor-dr-1";
  const url = new URL(safeReturnTo(value, fallback), origin);
  assert.equal(url.pathname, "/search/doctors");
  assert.equal(url.searchParams.get("design"), "d13");
  assert.equal(url.searchParams.get("q"), "Shetty");
  assert.equal(url.searchParams.get("location"), "Bangalore");
  assert.equal(url.searchParams.get("mode"), "hospital");
  assert.equal(url.searchParams.get("sort"), "earliest");
  assert.deepEqual(url.searchParams.getAll("languages"), ["English", "Hindi"]);
  assert.equal(url.searchParams.get("shown"), "18");
  assert.equal(url.hash, `#${doctorReturnId(doctor.id)}`);
});

test("return links allow only reviewed directory and landing routes", () => {
  for (const pathname of ["/book-an-appointment", "/book-an-appointment/cardiologist", "/book-an-appointment/cardiologist/bangalore", "/book-an-appointment/city/gurugram"]) {
    assert.equal(new URL(safeReturnTo(`${pathname}?sort=experience`, fallback), origin).pathname, pathname);
  }
  for (const value of ["/", "/doctors/dr-1/book", "/api/search", "/book-an-appointment/unknown", "/book-an-appointment/city/unknown"]) {
    assert.equal(safeReturnTo(value, fallback), fallback);
  }
});

test("external, malformed, backslash and control-character redirects use a safe fallback", () => {
  for (const value of [
    "https://evil.test/search/doctors", "//evil.test/search/doctors", "javascript:alert(1)",
    "/%2fevil.test/search/doctors", "/\\evil.test/search/doctors", "/search/doctors?x=%5c",
    "/search/doctors?x=%0a", "/search/doctors?x=%00", "/search/doctors?x=%",
  ]) assert.equal(safeReturnTo(value, fallback), fallback, value);
  assert.equal(safeReturnTo(null, "https://evil.test"), fallback);
  assert.equal(safeReturnTo("/bad", "/search/doctors?design=d12&mode=video"), "/search/doctors?mode=video&design=d13");
});

test("return links strip private and unknown parameters, invalid counts, and arbitrary fragments", () => {
  const url = new URL(safeReturnTo("/search/doctors?name=Patient&phone=9999999999&receipt=123&returnTo=https://evil.test&shown=999999&mode=unknown&availability=tomorrow#payment", fallback), origin);
  assert.deepEqual([...url.searchParams], [["availability", "tomorrow"], ["design", "d13"]]);
  assert.equal(url.hash, "");
});

test("advertised slot intent carries the exact doctor, hospital, city, mode, date and time to checkout", () => {
  const returnTo = "/search/doctors?shown=12&sort=earliest#doctor-dr-1";
  const url = new URL(quickBookingHref(doctor, "hospital", now, returnTo, "slot"), origin);
  assert.equal(url.pathname, "/doctors/dr-1/book");
  assert.equal(url.searchParams.get("design"), "d13");
  assert.equal(url.searchParams.get("intent"), "slot");
  assert.equal(url.searchParams.get("step"), "checkout");
  assert.equal(url.searchParams.get("mode"), "hospital");
  assert.equal(url.searchParams.get("city"), "Bangalore");
  assert.equal(url.searchParams.get("hospital"), doctor.hospital);
  assert.equal(url.searchParams.get("date"), "2026-10-20");
  assert.equal(url.searchParams.get("time"), "10:30 AM");
  assert.equal(url.searchParams.get("returnTo"), safeReturnTo(returnTo, fallback));
  assert.ok(isDesign3BookingSlotAvailable(doctor.id, url.searchParams.get("date"), url.searchParams.get("time"), "hospital", doctor.hospital, now));
});

test("More times preserves context but never silently preselects the advertised date or time", () => {
  const url = new URL(quickBookingHref(doctor, "hospital", now, fallback, "choose"), origin);
  assert.equal(url.searchParams.get("intent"), "choose");
  assert.equal(url.searchParams.get("step"), "appointment");
  assert.equal(url.searchParams.get("hospital"), doctor.hospital);
  assert.equal(url.searchParams.has("date"), false);
  assert.equal(url.searchParams.has("time"), false);
});

test("unknown or elapsed availability cannot skip directly to checkout", () => {
  for (const [item, at] of [
    [{ ...doctor, availability: { ...doctor.availability, hospital: "Contact hospital" } }, now],
    [doctor, new Date("2026-10-20T06:30:00Z")],
    [{ ...doctor, modes: { ...doctor.modes, hospital: false } }, now],
  ]) {
    const url = new URL(quickBookingHref(item, "hospital", at, fallback, "slot"), origin);
    assert.equal(url.searchParams.get("intent"), "choose");
    assert.equal(url.searchParams.get("step"), "appointment");
    assert.equal(url.searchParams.has("date"), false);
    assert.equal(url.searchParams.has("time"), false);
  }
});

test("video slot handoff carries no hospital selection", () => {
  const videoDoctor = design7Doctors.find((item) => item.modes.video === true && item.availability.video?.startsWith("Tomorrow"));
  assert.ok(videoDoctor);
  const url = new URL(quickBookingHref(videoDoctor, "video", now, fallback, "slot"), origin);
  assert.equal(url.searchParams.get("mode"), "video");
  assert.equal(url.searchParams.get("intent"), "slot");
  assert.equal(url.searchParams.get("step"), "checkout");
  assert.equal(url.searchParams.has("hospital"), false);
  assert.equal(url.searchParams.get("date"), "2026-10-21");
});
