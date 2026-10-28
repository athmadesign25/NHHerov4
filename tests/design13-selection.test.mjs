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

const { requestedSelection, shouldResumeSelection, reusableHold, quickStepUrl, readQuickStep } = await import("../src/features/booking/design13/selection.ts");
const { getDesign3BookingDoctor } = await import("../src/features/booking/doctors.ts");
const { getOrCreateHold, holdIsActive } = await import("../src/features/booking/design7/model.ts");
const now = Date.parse("2026-10-20T02:30:00Z");
const doctor = getDesign3BookingDoctor("dr-1");
const selection = { doctorId: doctor.id, mode: "hospital", hospital: doctor.hospital, date: "2026-10-20", time: "10:30 AM" };

for (const variant of ["d13", "d14"]) test(`${variant} survives checkout, payment, receipt and Back URLs without changing selection`, () => {
  const current = new URL("https://preview.test/doctors/dr-1/book?design=d13&city=Bangalore");
  current.searchParams.set("returnTo", "/search/doctors?design=d13&fee=above1500&mode=hospital&shown=12");
  let previous = current.href;
  for (const step of ["checkout", "payment", "confirmation", "appointment"]) {
    const reference = step === "confirmation" ? "NH7-12345678" : undefined;
    const next = new URL(quickStepUrl(previous, selection, step, reference, variant), current.origin);
    assert.equal(next.searchParams.get("design"), variant);
    assert.equal(next.searchParams.get("step"), step);
    assert.equal(next.searchParams.get("intent"), "resume");
    assert.equal(next.searchParams.get("date"), selection.date);
    assert.equal(next.searchParams.get("time"), selection.time);
    assert.equal(next.searchParams.get("hospital"), selection.hospital);
    assert.equal(next.searchParams.get("receipt"), reference ?? null);
    const back = new URL(next.searchParams.get("returnTo"), current.origin);
    assert.equal(back.searchParams.get("design"), variant);
    assert.equal(back.searchParams.get("fee"), "above1500");
    previous = next.href;
  }
});

test("a new explicit slot never resumes a conflicting doctor, mode, hospital, date or time", () => {
  assert.equal(shouldResumeSelection("slot", selection, { ...selection }), true);
  for (const change of [
    { doctorId: "dr-2" }, { mode: "video" }, { hospital: "Different hospital" },
    { date: "2026-10-21" }, { time: "11:30 AM" },
  ]) assert.equal(shouldResumeSelection("slot", selection, { ...selection, ...change }), false);
  assert.equal(shouldResumeSelection("slot", selection, undefined), false);
});

test("More times stays a fresh choice, while refresh and route Back restore the latest saved selection", () => {
  const edited = { ...selection, time: "11:30 AM" };
  assert.equal(shouldResumeSelection("choose", selection, selection), false);
  assert.equal(shouldResumeSelection("choose", selection, edited), false);
  assert.equal(shouldResumeSelection("resume", selection, edited), true);
  assert.equal(shouldResumeSelection(null, selection, edited), true);
  assert.equal(shouldResumeSelection("resume", selection, { ...edited, doctorId: "dr-2" }), false);
});

test("refresh and Back reuse an expired matching hold without changing its deadline", () => {
  const hold = getOrCreateHold(null, selection, now - 1_000_000);
  assert.equal(holdIsActive(hold, selection, now), false);
  assert.strictEqual(reusableHold(hold, { ...selection }), hold);
  assert.equal(reusableHold(hold, selection).expiresAt, now - 100_000);
  for (const change of [
    { doctorId: "dr-2" }, { mode: "video" }, { hospital: "Different hospital" },
    { date: "2026-10-21" }, { time: "11:30 AM" },
  ]) assert.equal(reusableHold(hold, { ...selection, ...change }), null);
  assert.equal(reusableHold(null, selection), null);
});

test("URL slot requests are checked against the actual doctor's India-time preview schedule", () => {
  const requested = requestedSelection(doctor, new URLSearchParams({ mode: "hospital", hospital: doctor.hospital, date: "today", time: "10:30 AM" }), now);
  assert.deepEqual(requested, selection);
  assert.equal(requestedSelection(doctor, new URLSearchParams({ ...selection, time: "10:31 AM" }), now).time, "");
  assert.equal(requestedSelection(doctor, new URLSearchParams(selection), Date.parse("2026-10-20T05:00:00Z")).time, "");
  const ashley = getDesign3BookingDoctor("dr-ashley");
  const tomorrow = requestedSelection(ashley, new URLSearchParams({ mode: "hospital", hospital: ashley.hospital, date: "tomorrow", time: "11:30 AM" }), now);
  assert.equal(tomorrow.date, "2026-10-21");
  assert.equal(tomorrow.time, "11:30 AM");
  assert.equal(requestedSelection(ashley, new URLSearchParams({ mode: "video", date: "tomorrow", time: "11:30 AM" }), now).time, "");
  assert.equal(requestedSelection(doctor, new URLSearchParams({ hospital: "Unrelated hospital", date: "today", time: "10:30 AM" }), now).hospital, doctor.hospital);
});

test("checkout history URLs preserve reviewed context while stripping patient identity and arbitrary query data", () => {
  const returnTo = "/search/doctors?design=d12&sort=earliest&phone=9000000000&shown=12#doctor-dr-1";
  const current = new URL("https://preview.test/doctors/dr-1/book");
  current.search = new URLSearchParams({
    name: "Sample Person", phone: "9000000000", email: "sample@example.com", token: "private-token",
    patient: '{"age":"32"}', city: "Bangalore", returnTo, unexpected: "unreviewed",
  }).toString();
  const href = quickStepUrl(current.href, { ...selection, patientName: "Sample Person" }, "payment");
  const next = new URL(href, current.origin);
  assert.equal(next.pathname, "/doctors/dr-1/book");
  assert.equal(next.searchParams.get("design"), "d13");
  assert.equal(next.searchParams.get("intent"), "resume");
  assert.equal(next.searchParams.get("step"), "payment");
  assert.equal(next.searchParams.get("city"), "Bangalore");
  assert.equal(next.searchParams.get("hospital"), doctor.hospital);
  assert.equal(next.searchParams.get("date"), selection.date);
  assert.equal(next.searchParams.get("time"), selection.time);
  for (const key of ["name", "phone", "email", "token", "patient", "unexpected", "patientName"]) assert.equal(next.searchParams.has(key), false);
  assert.equal(decodeURIComponent(href).includes("9000000000"), false);
  assert.equal(decodeURIComponent(href).includes("Sample Person"), false);
  const back = new URL(next.searchParams.get("returnTo"), current.origin);
  assert.equal(back.searchParams.get("sort"), "earliest");
  assert.equal(back.searchParams.get("shown"), "12");
  assert.equal(back.searchParams.get("design"), "d13");
});

test("editing or restarting removes stale receipt/time and unsafe return destinations from history URLs", () => {
  const current = "https://preview.test/doctors/dr-1/book?receipt=NH7-12345678&returnTo=https%3A%2F%2Fevil.test&city=%0Abad";
  const next = new URL(quickStepUrl(current, { ...selection, time: "" }, "appointment"), "https://preview.test");
  assert.equal(next.searchParams.has("receipt"), false);
  assert.equal(next.searchParams.has("time"), false);
  assert.equal(next.searchParams.has("city"), false);
  assert.equal(next.searchParams.get("returnTo"), "/search/doctors?design=d13");
  const confirmation = new URL(quickStepUrl(next.href, selection, "confirmation", "NH7-12345678"), next.origin);
  assert.equal(confirmation.searchParams.get("receipt"), "NH7-12345678");
});

test("unrecognized navigation steps cannot jump directly to payment or confirmation", () => {
  for (const value of [null, "", "paid", "PAYMENT", "javascript:alert(1)"]) assert.equal(readQuickStep(value), "appointment");
  for (const value of ["checkout", "payment", "confirmation"]) assert.equal(readQuickStep(value), value);
});
