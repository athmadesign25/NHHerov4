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

const { design17RequestedSelection, design17Available, design17SafeStep, confirmDesign17, design17FlowUrl } = await import("../src/features/booking/design17/model.ts");
const { patientsForIdentity, holdAfterPaymentFailure, failureHoldExpired, parseDesign15Draft } = await import("../src/features/booking/design15/model.ts");
const { getDesign3BookingDoctor } = await import("../src/features/booking/doctors.ts");
const { getDesign3BookingSlots } = await import("../src/features/booking/design3Availability.ts");
const { HOLD_DURATION_MS } = await import("../src/features/booking/design7/model.ts");
const now = Date.parse("2026-10-26T02:00:00Z");
const doctor = getDesign3BookingDoctor("dr-1");
const identity = { method: "email", value: "account@example.com" };
const patients = patientsForIdentity(identity);
const selection = design17RequestedSelection(doctor, new URLSearchParams(), now);
selection.time = getDesign3BookingSlots(doctor.id, selection.date, selection.mode, selection.hospital, new Date(now), 21).find(slot => slot.available).time;
const base = { version: 1, doctorId: doctor.id, identity, patients, selectedPatientId: patients[0].id, selection, payment: "online", failureHold: null, receipt: null, stage: "review" };

test("card and direct URL entry never preselect a time or start a hold", () => {
  const value = design17RequestedSelection(doctor, new URLSearchParams({ mode: "hospital", date: selection.date, time: selection.time, step: "payment" }), now);
  assert.equal(value.time, "");
  assert.equal(design17SafeStep("payment", { ...base, selection: value }, true, now), "appointment");
  assert.equal(base.failureHold, null);
});

test("date selection and schedule validation share the full 21-day window", () => {
  const last = design17RequestedSelection(doctor, new URLSearchParams({ date: "2026-11-15" }), now);
  assert.equal(last.date, "2026-11-15");
  last.time = getDesign3BookingSlots(doctor.id, last.date, last.mode, last.hospital, new Date(now), 21).find(slot => slot.available).time;
  assert.equal(design17Available(last, now), true);
  assert.equal(design17Available({ ...last, date: "2026-11-16" }, now), false);
  const rejected = design17RequestedSelection(doctor, new URLSearchParams({ date: "2026-11-16", hospital: "Unknown hospital" }), now);
  assert.equal(rejected.hospital, doctor.hospital);
  assert.notEqual(rejected.date, "2026-11-16");
});

test("every direct step is login-gated and review requires a selected patient", () => {
  for (const step of ["patient", "appointment", "review", "payment", "confirmation"]) {
    assert.equal(design17SafeStep(step, base, false, now), "patient");
    assert.equal(design17SafeStep(step, { ...base, selectedPatientId: null }, true, now), "patient");
  }
  assert.equal(confirmDesign17({ ...base, stage: "payment" }, false, true, now), null);
  assert.equal(design17SafeStep("payment", { ...base, payment: "hospital" }, true, now), "review");
});

test("combined appointment setup can retain a chosen slot while patient selection changes", () => {
  const awaitingPatient = { ...base, stage: "patient", selectedPatientId: null };
  assert.equal(parseDesign15Draft(awaitingPatient, doctor.id).selection.time, selection.time);
  assert.equal(confirmDesign17({ ...awaitingPatient, stage: "payment" }, true, true, now), null);
  const selected = { ...awaitingPatient, selectedPatientId: patients[0].id, stage: "appointment" };
  assert.equal(parseDesign15Draft(selected, doctor.id).selection.time, selection.time);
  assert.equal(design17SafeStep("appointment", selected, true, now), "appointment");
  assert.equal(parseDesign15Draft({ ...selected, selection: { ...selection, time: "" } }, doctor.id).selection.time, "");
});

test("online payment requires the payment step and a successful result", () => {
  assert.equal(confirmDesign17(base, true, true, now), null);
  assert.equal(confirmDesign17({ ...base, stage: "payment" }, true, false, now), null);
  const receipt = confirmDesign17({ ...base, stage: "payment" }, true, true, now);
  assert.equal(receipt.payment, "online");
  assert.equal(receipt.status, "confirmed");
  assert.equal(confirmDesign17({ ...base, stage: "payment", receipt }, true, true, now), null);
});

test("hospital payment confirms from review while video remains online only", () => {
  const receipt = confirmDesign17({ ...base, payment: "hospital" }, true, false, now);
  assert.equal(receipt.payment, "hospital");
  assert.equal(confirmDesign17({ ...base, payment: "hospital", selection: { ...selection, mode: "video" } }, true, false, now), null);
});

test("only payment failure starts 15 minutes; retry, back and expiry never renew it", () => {
  const hold = holdAfterPaymentFailure(null, selection, now);
  assert.equal(hold.expiresAt - hold.createdAt, HOLD_DURATION_MS);
  assert.equal(HOLD_DURATION_MS, 15 * 60 * 1000);
  assert.equal(holdAfterPaymentFailure(hold, selection, now + 30_000), hold);
  const failed = { ...base, failureHold: hold };
  assert.equal(failureHoldExpired(hold, selection, now + HOLD_DURATION_MS - 1), false);
  assert.equal(failureHoldExpired(hold, selection, now + HOLD_DURATION_MS), true);
  assert.equal(design17SafeStep("payment", failed, true, now + HOLD_DURATION_MS), "appointment");
  assert.equal(confirmDesign17({ ...failed, stage: "payment" }, true, true, now + HOLD_DURATION_MS), null);
  assert.equal(holdAfterPaymentFailure(hold, selection, now + HOLD_DURATION_MS), hold);
  assert.ok(confirmDesign17({ ...failed, payment: "hospital" }, true, false, now + 30_000));
});

test("review and confirmation URLs preserve both designs and complete directory context without patient data", () => {
  for (const design of ["d17", "d17-lite"]) {
    const returnTo = `/search/doctors?design=${design}&location=Bangalore&languages=Kannada&q=heart`;
    const receipt = confirmDesign17({ ...base, payment: "hospital" }, true, false, now);
    for (const draft of [base, { ...base, payment: "hospital", receipt, failureHold: null, stage: "confirmation" }]) {
      const url = new URL(design17FlowUrl(draft, design, returnTo), "https://preview.test");
      assert.equal(url.searchParams.get("design"), design);
      assert.equal(url.searchParams.get("returnTo"), returnTo);
      assert.equal(url.searchParams.get("hospital"), selection.hospital);
      assert.equal(url.searchParams.has("patient"), false);
      assert.equal(url.href.includes(encodeURIComponent(patients[0].patient.name)), false);
      assert.equal(url.href.includes(encodeURIComponent(identity.value)), false);
      assert.equal(url.pathname.endsWith("/confirmation"), Boolean(draft.receipt));
    }
  }
});

const { design17Patients, design17PatientAvatar } = await import("../src/features/booking/design17/patients.ts");
test("D17 reuses all four D16 members and applies the signed-in contact", () => {
  const identity = { method: "email", value: "member@example.test" };
  const members = design17Patients(identity);
  assert.deepEqual(members.map(entry => [entry.patient.name, entry.patient.age, entry.patient.relation]), [
    ["Aditya", "32", "self"], ["Aarav", "6", "child"], ["Hazel", "30", "spouse"], ["Rahul", "62", "parent"],
  ]);
  assert.ok(members.every(entry => entry.patient.email === identity.value && design17PatientAvatar(entry)));
  const custom = { id: "custom-member", patient: { ...members[0].patient, name: "Added member" } };
  const updated = design17Patients(identity, [...patientsForIdentity(identity), custom]);
  assert.equal(updated.length, 5);
  assert.deepEqual(updated.find(entry => entry.id === custom.id), custom);
  assert.equal(design17PatientAvatar(custom), undefined);
  assert.deepEqual(design17Patients(identity, updated), updated);
});

const { appointmentPricing, normalizeDiscountCode } = await import("../src/features/booking/design17/pricing.ts");
test("review discounts have one consistent total and survive draft recovery", () => {
  assert.equal(normalizeDiscountCode(" nhcare10 "), "NHCARE10");
  assert.equal(normalizeDiscountCode("INVALID"), null);
  assert.deepEqual(appointmentPricing("₹1,150", "NHCARE10"), { base: "₹1,150", discount: "₹115", total: "₹1,035", hasDiscount: true });
  assert.equal(appointmentPricing("₹1150", "INVALID").total, "₹1,150");
  assert.equal(appointmentPricing("₹0", "NHCARE10").total, "₹0");
  assert.equal(parseDesign15Draft({ ...base, discountCode: "NHCARE10" }, doctor.id).discountCode, "NHCARE10");
  assert.equal(parseDesign15Draft({ ...base, discountCode: "<script>" }, doctor.id), null);
});

const { design17DoctorNavigationHref } = await import("../src/features/search/design17Navigation.ts");
test("navbar returns from every internal D17 screen to the same refined directory", () => {
  for (const design of ["d17", "d17-lite"]) {
    const returnTo = `/search/doctors?design=d3&location=Bangalore&mode=video&languages=Kannada`;
    for (const pathname of ["/doctors/dr-1", "/doctors/dr-1/book", "/doctors/dr-1/book/confirmation"]) {
      const params = new URLSearchParams({ design, returnTo, step: "review" });
      const url = new URL(design17DoctorNavigationHref("/book-an-appointment", pathname, params), "https://nh.local");
      assert.equal(url.pathname, "/search/doctors");
      assert.equal(url.searchParams.get("design"), design);
      assert.equal(url.searchParams.get("location"), "Bangalore");
      assert.equal(url.searchParams.get("languages"), "Kannada");
      assert.equal(url.searchParams.get("step"), null);
    }
    const params = new URLSearchParams({ design, location: "Kolkata" });
    assert.equal(new URL(design17DoctorNavigationHref("/book-an-appointment/cardiologist", "/doctors/dr-1", params), "https://nh.local").searchParams.get("design"), design);
    assert.equal(new URL(design17DoctorNavigationHref("/book-an-appointment", "/search/doctors", params), "https://nh.local").searchParams.get("location"), "Kolkata");
    assert.equal(design17DoctorNavigationHref("/book-an-appointment", "/doctors/dr-1", new URLSearchParams({ design, returnTo: "https://evil.test" })), `/search/doctors?design=${design}&location=All`);
  }
  assert.equal(design17DoctorNavigationHref("/book-an-appointment", "/", new URLSearchParams()), "/search/doctors?design=d17-lite&location=All");
  assert.equal(design17DoctorNavigationHref("/book-an-appointment", "/doctors/dr-1", new URLSearchParams({ design: "d16" })), "/book-an-appointment");
});
