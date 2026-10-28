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

const { design19CanRestoreSelection, design19ContinuePhase, design19SafeStep, design19ChangedSelection, design19FlowUrl, design19InlineUrl, design19ListingReturnTo, parseDesign19Draft } = await import("../src/features/booking/design19/model.ts");
const { design17RequestedSelection, confirmDesign17 } = await import("../src/features/booking/design17/model.ts");
const { patientsForIdentity, holdAfterPaymentFailure } = await import("../src/features/booking/design15/model.ts");
const { getDesign3BookingDoctor } = await import("../src/features/booking/doctors.ts");
const { getDesign3BookingSlots } = await import("../src/features/booking/design3Availability.ts");
const now = Date.parse("2026-10-27T02:00:00Z");
const doctor = getDesign3BookingDoctor("dr-1");
const selection = design17RequestedSelection(doctor, new URLSearchParams(), now);
selection.time = getDesign3BookingSlots(doctor.id, selection.date, selection.mode, selection.hospital, new Date(now), 21).find(slot => slot.available).time;
const guest = { version: 1, doctorId: doctor.id, identity: null, patients: [], selectedPatientId: null, selection, payment: "online", failureHold: null, receipt: null, stage: "patient" };
const identity = { method: "email", value: "account@example.com" };
const patients = patientsForIdentity(identity);
const member = { ...guest, identity, patients, selectedPatientId: patients[0].id, stage: "appointment" };

test("guest selects a real time without authentication, patient details or a reservation", () => {
  const draft = parseDesign19Draft(guest);
  assert.equal(draft.selection.time, selection.time);
  assert.equal(draft.identity, null);
  assert.equal(draft.failureHold, null);
  assert.equal(design19ContinuePhase(guest, false, now), "auth");
  assert.equal(design19ContinuePhase({ ...guest, selection: { ...selection, time: "" } }, false, now), "slots");
  assert.equal(design17RequestedSelection(doctor, new URLSearchParams({ time: selection.time }), now).time, "");
});

test("authentication retains the selected appointment and member selection remains gated", () => {
  assert.equal(design19ContinuePhase(member, true, now), "member");
  assert.equal(parseDesign19Draft(member).selection.time, selection.time);
  assert.equal(design19SafeStep("review", guest, false, now), "patient");
  assert.equal(design19SafeStep("payment", { ...member, selectedPatientId: null }, true, now), "patient");
  assert.equal(design19SafeStep("review", member, true, now), "review");
  assert.equal(confirmDesign17({ ...member, stage: "payment" }, false, true, now), null);
  assert.equal(parseDesign19Draft({ ...guest, patients }), null);
});

test("changing doctor, hospital, date or consultation mode clears the old time", () => {
  for (const change of [{ doctorId: "dr-2" }, { hospital: "Another hospital" }, { date: "2026-10-28" }, { mode: "video" }]) {
    assert.equal(design19ChangedSelection(selection, { ...selection, ...change }).time, "");
  }
  assert.equal(design19ChangedSelection(selection, { ...selection, time: "02:00 PM" }).time, "02:00 PM");
});

test("reopening an unfinished card retains changed choices while an explicit new filter can override them", () => {
  const changed = { ...guest, selection: { ...selection, mode: "video", hospital: "Another hospital", date: "2026-10-28" } };
  assert.equal(design19CanRestoreSelection(changed, selection, true, true), true);
  assert.equal(design19CanRestoreSelection(changed, selection, true, false), false);
  assert.equal(design19CanRestoreSelection(guest, { ...selection, date: "2026-10-29" }, true, false), false);
  assert.equal(design19CanRestoreSelection(guest, { ...selection, date: "2026-10-29" }, false, false), true);
  assert.equal(design19CanRestoreSelection({ ...guest, receipt: {} }, selection, true, true), false);
  assert.equal(design19CanRestoreSelection(null, selection, false, true), false);
});

test("expired or unavailable times cannot progress into authentication or payment", () => {
  const hold = holdAfterPaymentFailure(null, selection, now);
  const failed = { ...member, failureHold: hold, stage: "review" };
  assert.equal(design19ContinuePhase(failed, true, now), "member");
  assert.equal(design19ContinuePhase(failed, true, now + 15 * 60 * 1000), "slots");
  assert.equal(holdAfterPaymentFailure(hold, selection, now + 60_000), hold);
  assert.equal(confirmDesign17({ ...failed, stage: "payment" }, true, true, now + 15 * 60 * 1000), null);
  assert.equal(design19ContinuePhase({ ...guest, selection: { ...selection, date: "2026-10-26" } }, false, now), "slots");
});

test("review and return links retain D19, filters and appointment context without patient data", () => {
  const returnTo = "/search/doctors?design=d17-lite&location=Bangalore&languages=Kannada&mode=video&booking=dr-2&bookingMode=hospital";
  const review = new URL(design19FlowUrl({ ...member, stage: "review" }, returnTo), "https://nh.local");
  assert.equal(review.pathname, "/doctors/dr-1/book");
  assert.equal(review.searchParams.get("design"), "d19");
  assert.equal(review.searchParams.get("step"), "review");
  assert.equal(review.searchParams.get("hospital"), selection.hospital);
  const inline = new URL(design19InlineUrl(member, returnTo), "https://nh.local");
  assert.equal(inline.pathname, "/search/doctors");
  assert.equal(inline.searchParams.get("booking"), doctor.id);
  assert.equal(inline.searchParams.get("languages"), "Kannada");
  assert.equal(inline.searchParams.get("design"), "d19");
  assert.equal(inline.searchParams.get("mode"), "video");
  assert.equal(inline.searchParams.get("bookingMode"), "hospital");
  const cleanReturn = new URL(review.searchParams.get("returnTo"), "https://nh.local");
  assert.equal(cleanReturn.searchParams.get("mode"), "video");
  assert.equal(cleanReturn.searchParams.has("bookingMode"), false);
  assert.equal(inline.searchParams.has("time"), false);
  for (const url of [review, inline]) {
    assert.equal(url.href.includes(encodeURIComponent(identity.value)), false);
    assert.equal(url.href.includes(encodeURIComponent(patients[0].patient.name)), false);
  }
  for (const unsafe of ["https://evil.test", "//evil.test", "/\\evil.test", "javascript:alert(1)"]) {
    assert.equal(design19ListingReturnTo(unsafe), "/search/doctors?design=d19&location=All");
  }
});

test("guest choices survive reopening in memory and signed-in drafts use an isolated opaque token", async () => {
  const { saveDesign19Draft, loadDesign19Draft } = await import("../src/features/booking/design19/draft.ts");
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  const originalSession = globalThis.sessionStorage;
  const stored = new Map();
  const requests = [];
  globalThis.window = { setTimeout, clearTimeout };
  globalThis.sessionStorage = { getItem: key => stored.get(key), setItem: (key, value) => stored.set(key, value) };
  globalThis.fetch = async (url, options) => { requests.push({ url, options }); return new Response("{}", { status: 200 }); };
  try {
    assert.equal(await saveDesign19Draft(guest), true);
    assert.equal((await loadDesign19Draft(doctor.id)).selection.time, selection.time);
    assert.equal(requests.length, 0);
    assert.equal(stored.size, 0);
    assert.equal(await saveDesign19Draft(member), true);
    assert.equal(requests.length, 1);
    assert.deepEqual([...stored.keys()], ["nh:d19:booking-token"]);
    assert.match(stored.get("nh:d19:booking-token"), /^[a-f0-9-]{36}$/);
    assert.equal(requests[0].options.cache, "no-store");
    assert.equal(JSON.parse(requests[0].options.body).selectedPatientId, member.selectedPatientId);
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.window = originalWindow;
    globalThis.sessionStorage = originalSession;
  }
});

test("confirmation requires the right payment outcome and keeps the D19 return context", () => {
  const online = { ...member, stage: "payment", payment: "online" };
  assert.equal(confirmDesign17(online, true, false, now), null);
  const paidReceipt = confirmDesign17(online, true, true, now);
  assert.ok(paidReceipt);
  const hospital = { ...member, stage: "review", payment: "hospital" };
  assert.ok(confirmDesign17(hospital, true, false, now));
  assert.equal(confirmDesign17({ ...hospital, selection: { ...selection, mode: "video" } }, true, false, now), null);
  const confirmation = new URL(design19FlowUrl({ ...online, stage: "confirmation", receipt: paidReceipt }, "/search/doctors?design=d19&location=Bangalore&mode=video&booking=dr-1&bookingMode=hospital"), "https://nh.local");
  assert.equal(confirmation.pathname, "/doctors/dr-1/book/confirmation");
  assert.equal(confirmation.searchParams.get("design"), "d19");
  assert.equal(confirmation.searchParams.get("ref"), paidReceipt.ref);
  const directory = new URL(confirmation.searchParams.get("returnTo"), "https://nh.local");
  assert.equal(directory.searchParams.get("mode"), "video");
  assert.equal(directory.searchParams.has("booking"), false);
  assert.equal(directory.searchParams.has("bookingMode"), false);
});
