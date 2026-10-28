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
    if (specifier === "next/navigation") return nextResolve("next/navigation.js", context);
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
const { design17ProfileUrl, getDesign17ProfileDoctor } = await import("../src/features/search/design17Profile.ts");
const { design17DoctorNavigationHref, design17ListingReturnTo } = await import("../src/features/search/design17Navigation.ts");
const { doctorListingParams, doctorListingUrl } = await import("../src/features/search/doctorListingNavigation.ts");
const { readListingParams } = await import("../src/features/search/doctorListing.ts");
const { readDesignVariant, setDesignVariant } = await import("../src/features/design-preview/useDesignVariant.ts");
const now = new Date("2026-10-27T02:30:00Z");
const asUrl = href => new URL(href, "https://nh.local");

test("D19 keeps cross-city hospital, date, mode and listing refinements through profile and booking", () => {
  const hospital = "SRCC Children's Hospital, Mumbai";
  const doctor = getDesign17ProfileDoctor("dr-3", new URLSearchParams({ hospital }));
  assert.ok(doctor);
  const returnTo = "/search/doctors?design=d19&location=Mumbai&mode=hospital&languages=Hindi&appointmentDate=2026-10-28";
  const profile = asUrl(design17ProfileUrl(doctor, "hospital", "2026-10-28", false, "d19", returnTo));
  const restored = getDesign17ProfileDoctor(doctor.id, profile.searchParams);
  const booking = asUrl(design17BookingUrl(restored, "hospital", profile.searchParams.get("date"), now, "d19", profile.searchParams.get("returnTo")));
  for (const url of [profile, booking]) {
    assert.equal(url.searchParams.get("design"), "d19");
    assert.equal(url.searchParams.get("mode"), "hospital");
    assert.equal(url.searchParams.get("hospital"), hospital);
    assert.equal(url.searchParams.get("date"), "2026-10-28");
    assert.equal(url.searchParams.get("returnTo"), returnTo);
    assert.equal(url.searchParams.has("time"), false);
  }
  assert.equal(booking.searchParams.get("city"), "Mumbai");
});

test("D19 landing refinements and leaving the defining city retain the new design", () => {
  const path = "/book-an-appointment/cardiologist/bangalore";
  const params = doctorListingParams(path, "design=d19&mode=video&languages=English");
  const landing = asUrl(doctorListingUrl(path, params));
  assert.equal(landing.pathname, path);
  assert.equal(landing.searchParams.get("design"), "d19");
  assert.equal(doctorListingParams(landing.pathname, landing.search).get("location"), "Bangalore");
  params.set("location", "Mumbai");
  const search = asUrl(doctorListingUrl(path, params));
  assert.equal(search.pathname, "/search/doctors");
  assert.equal(search.searchParams.get("design"), "d19");
  assert.equal(search.searchParams.get("specialties"), "Cardiologist");
  assert.equal(search.searchParams.get("languages"), "English");
  assert.equal(search.searchParams.get("mode"), "video");
});

test("D19 global directory links restore current filters and maintain mode and city", () => {
  const params = new URLSearchParams({ design: "d19", location: "Mumbai", mode: "video", q: "heart", languages: "Hindi" });
  const current = "/search/doctors";
  const back = asUrl(design17DoctorNavigationHref("/book-an-appointment", current, params));
  assert.equal(back.searchParams.get("design"), "d19");
  assert.equal(back.searchParams.get("q"), "heart");
  assert.equal(back.searchParams.get("languages"), "Hindi");
  const speciality = asUrl(design17DoctorNavigationHref("/book-an-appointment/cardiologist", current, params));
  assert.equal(speciality.searchParams.get("design"), "d19");
  assert.equal(speciality.searchParams.get("location"), "Mumbai");
  assert.equal(speciality.searchParams.get("mode"), "video");
  assert.equal(design17DoctorNavigationHref("https://external.test/doctors", current, params), "https://external.test/doctors");
});

test("homepage doctor entry remains D17 Lite even after visiting D19", () => {
  for (const params of [new URLSearchParams(), new URLSearchParams({ design: "d19", mode: "video" })]) {
    const target = asUrl(design17DoctorNavigationHref("/book-an-appointment", "/", params));
    assert.equal(target.searchParams.get("design"), "d17-lite");
  }
});

test("D19 Find a doctor closes the inline workspace and retains discovery refinements", () => {
  const params = new URLSearchParams({ design: "d19", location: "Mumbai", mode: "video", q: "heart",
    languages: "Hindi", appointmentDate: "2026-10-28", booking: "dr-3", bookingMode: "hospital", hospital: "Selected hospital",
    date: "2026-10-28", time: "10:30 AM", step: "review", ref: "NH7-12345678" });
  const target = asUrl(design17DoctorNavigationHref("/book-an-appointment", "/search/doctors", params));
  assert.equal(target.pathname, "/search/doctors");
  for (const key of ["design", "location", "mode", "q", "languages", "appointmentDate"]) {
    assert.equal(target.searchParams.get(key), params.get(key));
  }
  for (const key of ["booking", "bookingMode", "hospital", "date", "time", "step", "ref"]) assert.equal(target.searchParams.has(key), false);
  const legacy = asUrl(design17ListingReturnTo("/search/doctors?design=d17-lite&date=2026-10-28", "d17-lite"));
  assert.equal(legacy.searchParams.get("date"), "2026-10-28");
});

test("D19 return destinations reject external routes and overwrite stale preview context", () => {
  const fallback = "/search/doctors?design=d19&location=All";
  for (const unsafe of ["//external.test/search", "/\\external.test/search", "/doctors/dr-3/book", "javascript:alert(1)", null]) {
    assert.equal(design17ListingReturnTo(unsafe, "d19"), fallback);
  }
  const restored = asUrl(design17ListingReturnTo("/search/doctors?design=d17-lite&location=Mumbai&returnTo=%2Fsearch#old", "d19"));
  assert.equal(restored.searchParams.get("design"), "d19");
  assert.equal(restored.searchParams.get("location"), "Mumbai");
  assert.equal(restored.searchParams.has("returnTo"), false);
  assert.equal(restored.hash, "");
});

test("D19 supports nearest sorting for hospital visits only", () => {
  assert.equal(readListingParams(new URLSearchParams("design=d19&mode=hospital&sort=nearest")).sort, "nearest");
  assert.equal(readListingParams(new URLSearchParams("design=d19&mode=video&sort=nearest")).sort, "relevance");
  assert.equal(readListingParams(new URLSearchParams("design=d3&mode=hospital&sort=nearest")).sort, "relevance");
});

test("D19 is selectable and an explicit URL wins over a saved older preview", t => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const values = new Map([["nh_design_preview:search-top", "d17-lite"]]);
  Object.defineProperty(globalThis, "window", { configurable: true, writable: true, value: Object.assign(new EventTarget(), {
    location: { pathname: "/d19-preview-test", search: "?design=d19" },
  }) });
  Object.defineProperty(globalThis, "localStorage", { configurable: true, writable: true, value: {
    getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value),
  } });
  t.after(() => {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else delete globalThis.window;
    if (previousStorage) Object.defineProperty(globalThis, "localStorage", previousStorage);
    else delete globalThis.localStorage;
  });
  assert.equal(readDesignVariant("search-top"), "d19");
  setDesignVariant("search-top", "d17-lite");
  window.location.search = "?design=d17-lite";
  assert.equal(readDesignVariant("search-top"), "d17-lite");
  setDesignVariant("search-top", "d19");
  assert.equal(readDesignVariant("search-top"), "d19");
});


test("D19 internal doctor navigation uses listing mode instead of an independently chosen card mode", () => {
  const returnTo = "/search/doctors?design=d19&location=Bangalore&mode=hospital&languages=Kannada";
  const params = new URLSearchParams({ design: "d19", mode: "video", hospital: "Narayana Health City, Bangalore", returnTo });
  const directory = asUrl(design17DoctorNavigationHref("/book-an-appointment", "/doctors/dr-1/book", params));
  assert.equal(directory.searchParams.get("mode"), "hospital");
  assert.equal(directory.searchParams.get("languages"), "Kannada");
  const speciality = asUrl(design17DoctorNavigationHref("/book-an-appointment/cardiologist", "/doctors/dr-1/book", params));
  assert.equal(speciality.searchParams.get("design"), "d19");
  assert.equal(speciality.searchParams.get("mode"), "hospital");
  assert.equal(speciality.searchParams.get("location"), "Bangalore");
});
