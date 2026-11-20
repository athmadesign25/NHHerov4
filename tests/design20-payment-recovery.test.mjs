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

const { confirmDesign20, design20PaymentDraft, design20RequestedSelection, design20SafeStep, design20SavedAppointment, parseDesign20Draft } = await import("../src/features/booking/design20/model.ts");
const { interruptDesign20Payment, skipDesign20Payment } = await import("../src/features/booking/design20/paymentRecovery.ts");
const { Design20DraftStore } = await import("../src/features/booking/design20/serverDraftStore.ts");
const { patientsForIdentity, failureHoldExpired } = await import("../src/features/booking/design15/model.ts");
const { getDesign20BookingDoctor } = await import("../src/features/search/design20Directory.ts");
const { getDesign3BookingSlots } = await import("../src/features/booking/design3Availability.ts");

const now = Date.parse("2026-10-27T02:00:00Z");
const doctor = getDesign20BookingDoctor("dr-1");
const selection = design20RequestedSelection(doctor, new URLSearchParams(), now);
const slots = getDesign3BookingSlots(doctor.id, selection.date, selection.mode, selection.hospital, new Date(now), 21, "d20").filter(slot => slot.available);
selection.time = slots[0].time;
const identity = { method: "email", value: "recovery@example.com" };
const patients = patientsForIdentity(identity);
const payment = { version: 1, doctorId: doctor.id, identity, patients, selectedPatientId: patients[0].id, selection,
  payment: "online", failureHold: null, receipt: null, stage: "payment", sponsorshipId: "one-health-lite", discountCode: "NHCARE10", useHealthCredits: true };

for (const status of ["cancelled", "failed"]) {
  test(`${status} payment retains the booking choices, creates one reservation and survives parsing`, () => {
    const result = interruptDesign20Payment(payment, status, now);
    assert.equal(result.stage, "review");
    assert.equal(result.paymentRecovery, status);
    assert.equal(result.reservationSkipped, undefined);
    assert.equal(result.payment, "online");
    assert.equal(result.receipt, null);
    assert.deepEqual(result.selection, selection);
    assert.equal(result.selectedPatientId, payment.selectedPatientId);
    assert.equal(result.sponsorshipId, payment.sponsorshipId);
    assert.equal(result.discountCode, payment.discountCode);
    assert.equal(result.useHealthCredits, true);
    assert.equal(result.failureHold.createdAt, now);
    assert.equal(result.failureHold.expiresAt, now + 15 * 60 * 1000);
    const restored = parseDesign20Draft(JSON.parse(JSON.stringify(result)), doctor.id);
    assert.equal(restored.paymentRecovery, status);
    assert.deepEqual(restored.failureHold, result.failureHold);
    assert.equal(payment.failureHold, null, "the previous state is not mutated");
  });
}

test("Skip defers the same appointment without confirming it or switching to pay at hospital", () => {
  const failed = interruptDesign20Payment(payment, "failed", now);
  const skipped = skipDesign20Payment(failed);
  assert.equal(skipped.reservationSkipped, true);
  assert.equal(skipped.stage, "review");
  assert.equal(skipped.payment, "online");
  assert.equal(skipped.receipt, null);
  assert.deepEqual(skipped.selection, failed.selection);
  assert.equal(skipped.failureHold, failed.failureHold);
  assert.equal(parseDesign20Draft(JSON.parse(JSON.stringify(skipped))).reservationSkipped, true);
  assert.deepEqual(skipDesign20Payment(skipped), skipped, "repeated Skip does not extend the reservation");
});

test("Retry, another cancellation and Skip all retain the original expiry", () => {
  const first = interruptDesign20Payment(payment, "failed", now);
  const skipped = skipDesign20Payment(first);
  const retry = design20PaymentDraft(skipped, "online", true, now + 60_000);
  assert.equal(retry.stage, "payment");
  assert.equal(retry.reservationSkipped, undefined);
  assert.equal(retry.paymentRecovery, "failed");
  const cancelled = interruptDesign20Payment(retry, "cancelled", now + 120_000);
  assert.equal(cancelled.paymentRecovery, "cancelled");
  assert.equal(cancelled.failureHold, first.failureHold);
  const skippedAgain = skipDesign20Payment(cancelled);
  assert.equal(skippedAgain.failureHold.expiresAt, now + 15 * 60 * 1000);
  assert.ok(parseDesign20Draft(skippedAgain));
});

test("the exact expiry blocks retry and confirmation while retaining readable deferred state", () => {
  const skipped = skipDesign20Payment(interruptDesign20Payment(payment, "cancelled", now));
  const deadline = skipped.failureHold.expiresAt;
  assert.equal(failureHoldExpired(skipped.failureHold, skipped.selection, deadline - 1), false);
  assert.equal(failureHoldExpired(skipped.failureHold, skipped.selection, deadline), true);
  assert.ok(design20PaymentDraft(skipped, "online", true, deadline - 1));
  assert.equal(design20PaymentDraft(skipped, "online", true, deadline), null);
  assert.equal(confirmDesign20({ ...skipped, stage: "payment" }, true, true, deadline), null);
  const restored = parseDesign20Draft(JSON.parse(JSON.stringify(skipped)));
  assert.equal(restored.reservationSkipped, true);
  assert.equal(restored.failureHold.expiresAt, deadline, "restoration must not invent a new deadline");
  for (const requested of [null, "review", "payment", "appointment"]) {
    assert.equal(design20SafeStep(requested, restored, true, deadline), "review", "expired reservation remains visible instead of reopening payment or silently returning to slots");
  }
  assert.equal(design20SafeStep("review", restored, false, deadline), "patient", "reservation restoration never bypasses authentication");
  const lateCancellation = interruptDesign20Payment({ ...skipped, stage: "payment" }, "cancelled", deadline + 1);
  assert.equal(lateCancellation.failureHold.expiresAt, deadline);
});

test("editing a different slot clears payment recovery; unchanged appointments keep the hold", () => {
  const skipped = skipDesign20Payment(interruptDesign20Payment(payment, "failed", now));
  const unchanged = design20SavedAppointment(skipped, selection, true, now + 1000);
  assert.equal(unchanged.reservationSkipped, undefined);
  assert.equal(unchanged.paymentRecovery, "failed");
  assert.equal(unchanged.failureHold, skipped.failureHold);
  const skippedAfterSave = skipDesign20Payment(unchanged);
  assert.equal(skippedAfterSave.stage, "review");
  assert.equal(skippedAfterSave.reservationSkipped, true);
  assert.equal(skippedAfterSave.failureHold, skipped.failureHold);
  assert.ok(parseDesign20Draft(skippedAfterSave));
  assert.ok(slots[1], "the fixture has a second available time");
  const changed = design20SavedAppointment(skipped, { ...selection, time: slots[1].time }, true, now + 1000);
  assert.equal(changed.reservationSkipped, undefined);
  assert.equal(changed.paymentRecovery, undefined);
  assert.equal(changed.failureHold, null);
  assert.equal(changed.discountCode, payment.discountCode);
  assert.equal(changed.selectedPatientId, payment.selectedPatientId);
});

test("recovery helpers ignore invalid entry points and confirmed bookings", () => {
  const receipt = confirmDesign20(payment, true, true, now);
  assert.ok(receipt);
  for (const invalid of [
    { ...payment, stage: "appointment" }, { ...payment, identity: null },
    { ...payment, selectedPatientId: null }, { ...payment, receipt },
    { ...payment, selection: { ...selection, time: "" } },
  ]) assert.equal(interruptDesign20Payment(invalid, "failed", now), invalid);
  const failed = interruptDesign20Payment(payment, "failed", now);
  for (const invalid of [
    payment, { ...failed, stage: "patient" }, { ...failed, stage: "confirmation" },
    { ...failed, identity: null }, { ...failed, selectedPatientId: null },
    { ...failed, paymentRecovery: undefined }, { ...failed, failureHold: null }, { ...failed, receipt },
  ]) assert.equal(skipDesign20Payment(invalid), invalid);
});

test("parser rejects malformed or contradictory recovery states", () => {
  const failed = interruptDesign20Payment(payment, "failed", now);
  const receipt = confirmDesign20(payment, true, true, now);
  for (const patch of [
    { paymentRecovery: "success" }, { paymentRecovery: null }, { paymentRecovery: 1 },
    { reservationSkipped: "true" }, { reservationSkipped: true, stage: "payment" },
    { reservationSkipped: true, paymentRecovery: undefined }, { failureHold: null },
    { identity: null }, { selectedPatientId: null }, { payment: "hospital" },
    { receipt, stage: "confirmation" },
  ]) assert.equal(parseDesign20Draft({ ...failed, ...patch }), null, JSON.stringify(patch));
  assert.ok(parseDesign20Draft({ ...failed, reservationSkipped: false }));
});

test("server draft round-trip preserves skipped state and expiry across retry writes", () => {
  let clock = now;
  const store = new Design20DraftStore(() => clock);
  const token = "123e4567-e89b-42d3-a456-426614174000";
  try {
    const skipped = skipDesign20Payment(interruptDesign20Payment(payment, "failed", now));
    assert.equal(store.put(token, doctor.id, skipped), "saved");
    clock += 60_000;
    const restored = store.get(token, doctor.id);
    assert.equal(restored.paymentRecovery, "failed");
    assert.equal(restored.reservationSkipped, true);
    assert.equal(restored.failureHold.expiresAt, skipped.failureHold.expiresAt);
    const retry = design20PaymentDraft(restored, "online", true, clock);
    assert.equal(store.put(token, doctor.id, retry), "saved");
    const retried = store.get(token, doctor.id);
    assert.equal(retried.reservationSkipped, undefined);
    assert.equal(retried.failureHold.expiresAt, skipped.failureHold.expiresAt);
    clock = skipped.failureHold.expiresAt;
    assert.equal(design20PaymentDraft(store.get(token, doctor.id), "online", true, clock), null);
  } finally {
    store.dispose();
  }
});
