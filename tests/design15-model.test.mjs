import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
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
    if (url.startsWith(pathToFileURL(root).href) && new URL(url).pathname.endsWith(".ts") && !url.includes("/node_modules/")) {
      return { format: "module", shortCircuit: true, source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText };
    }
    return nextLoad(url, context);
  },
});

const auth = await import("../src/features/booking/design15/auth.ts");
const model = await import("../src/features/booking/design15/model.ts");
const now = Date.UTC(2026, 9, 23, 6);
const mobile = { method: "mobile", value: "9876543210" };
const email = { method: "email", value: "Person+care@example.test" };
const selection = { doctorId: "dr-1", mode: "hospital", hospital: "Narayana Health City", date: "2026-10-24", time: "10:30 AM" };
function draft(identity = mobile) {
  const patients = model.patientsForIdentity(identity);
  return { version: 1, doctorId: selection.doctorId, identity: { ...identity }, patients,
    selectedPatientId: patients[0].id, selection: { ...selection }, payment: "online", failureHold: null, receipt: null, stage: "review" };
}

test("mobile login normalizes Indian country codes and rejects malformed or non-Indian numbers", () => {
  for (const value of ["9876543210", "+91 98765 43210", "91 98765 43210", " (98765) 43210 "]) {
    assert.deepEqual(auth.normalizeAuthIdentity("mobile", value), mobile);
  }
  for (const value of ["", "1234567890", "987654321", "98765432100", "+44 9876543210", "98765abc10", "９８７６５４３２１０"]) {
    assert.equal(auth.normalizeAuthIdentity("mobile", value), null, value);
    assert.ok(auth.authContactError("mobile", value));
  }
  assert.equal(auth.authContactError("mobile", mobile.value), null);
});

test("email login preserves the local part, normalizes the domain and shares the 160-character storage limit", () => {
  assert.deepEqual(auth.normalizeAuthIdentity("email", "  Person+care@EXAMPLE.TEST  "), email);
  const maximum = `${"x".repeat(64)}@${"a".repeat(63)}.${"b".repeat(31)}`;
  assert.equal(maximum.length, 160);
  assert.ok(auth.normalizeAuthIdentity("email", maximum));
  assert.equal(auth.normalizeAuthIdentity("email", maximum + "c"), null);
  assert.equal(auth.authContactError("email", email.value), null);
  for (const value of ["", "person", "person@example", "person@@example.com", "p..q@example.com", ".p@example.com", "p.@example.com",
    "person@-example.com", "person@example-.com", "person@exam_ple.com", "person @example.com", "person\u0000@example.com", "person@example.123", `${"x".repeat(65)}@example.com`]) {
    assert.equal(auth.normalizeAuthIdentity("email", value), null, value);
    assert.ok(auth.authContactError("email", value));
  }
  assert.equal(auth.normalizeAuthIdentity("unknown", email.value), null);
});

test("only the exact six-digit presentation verification code succeeds", () => {
  assert.equal(auth.isValidVerificationCode("123456"), true);
  for (const value of ["", "12345", "1234567", "123 456", "000000", "１２３４５６"]) assert.equal(auth.isValidVerificationCode(value), false);
});

test("restored login uses the same contact validation and discards identity extras", () => {
  assert.deepEqual(model.parseIdentity({ ...mobile, accessToken: "do-not-copy" }), mobile);
  assert.deepEqual(model.parseIdentity({ method: "email", value: "Person+care@EXAMPLE.TEST", password: "do-not-copy" }), email);
  for (const value of [null, [], "mobile", {}, { method: "phone", value: mobile.value }, { method: "email", value: "p..q@example.com" },
    { method: "email", value: "person@-example.com" }, { method: "email", value: `a@${"b".repeat(160)}.test` }, { method: "mobile", value: "1234567890" }]) {
    assert.equal(model.parseIdentity(value), null);
  }
});

test("patient defaults and newly added patients belong to the current mobile or email identity", () => {
  for (const identity of [mobile, email]) {
    const patients = model.patientsForIdentity(identity);
    assert.equal(patients.length, 2);
    for (const { patient } of patients) {
      assert.equal(identity.method === "mobile" ? patient.phone : patient.email, identity.value);
      assert.deepEqual(model.patientErrors(patient, identity), {});
    }
    const original = { ...patients[0].patient, phone: "9999999999", email: "other@example.test" };
    const assigned = model.patientForIdentity(identity, original);
    assert.notStrictEqual(assigned, original);
    assert.equal(original.phone, "9999999999");
    assert.equal(original.email, "other@example.test");
    assert.deepEqual(model.patientErrors(assigned, identity), {});
    const wrong = identity.method === "mobile" ? { ...assigned, phone: "9999999999" } : { ...assigned, email: "other@example.test" };
    assert.ok(model.patientErrors(wrong, identity).identity);
    assert.ok(model.patientErrors(assigned, null).identity);
  }
});

test("patient validation accepts infants and rejects incomplete or invalid demographics", () => {
  const patient = draft().patients[0].patient;
  assert.deepEqual(model.patientErrors({ ...patient, age: "0" }, mobile), {});
  for (const change of [{ name: " " }, { name: "A" }, { name: "x".repeat(81) }, { age: "" }, { age: "-1" }, { age: "121" },
    { age: "2.5" }, { gender: "" }, { relation: "unknown" }, { phone: "1234567890" }, { email: "not-an-email" }]) {
    assert.ok(Object.keys(model.patientErrors({ ...patient, ...change }, mobile)).length);
  }
});

test("ordinary review and payment have no slot hold and either valid payment path can confirm", () => {
  for (const identity of [mobile, email]) {
    const online = { ...draft(identity), stage: "payment" };
    const restored = model.parseDesign15Draft(online, selection.doctorId);
    assert.equal(restored.failureHold, null);
    const receipt = model.confirmDesign15(restored, true, true, now);
    assert.equal(receipt.payment, "online");
    assert.equal(receipt.status, "confirmed");
    assert.equal(restored.failureHold, null);
    const hospital = { ...draft(identity), payment: "hospital" };
    const hospitalReceipt = model.confirmDesign15(hospital, false, true, now);
    assert.equal(hospitalReceipt.payment, "hospital");
    assert.equal(hospital.failureHold, null);
    assert.equal(model.failureHoldExpired(null, selection, now), false);
    assert.deepEqual(model.parseDesign15Draft({ ...online, receipt, stage: "confirmation" }, selection.doctorId).receipt, receipt);
    assert.deepEqual(Object.keys(receipt).sort(), ["createdAt", "payment", "ref", "selection", "status"]);
  }
});

test("confirmation requires the correct stage, verified patient, selected time, availability and payment result", () => {
  const online = { ...draft(), stage: "payment" };
  assert.equal(model.confirmDesign15(online, false, true, now), null);
  assert.equal(model.confirmDesign15(online, true, false, now), null);
  for (const change of [{ identity: null }, { selectedPatientId: null }, { selectedPatientId: "missing" }, { patients: [] },
    { selection: { ...selection, time: "" } }, { stage: "patient" }, { stage: "appointment" }, { stage: "review" },
    { receipt: model.confirmDesign15(online, true, true, now) }]) {
    assert.equal(model.confirmDesign15({ ...online, ...change }, true, true, now), null);
  }
  const hospital = { ...draft(), payment: "hospital" };
  assert.ok(model.confirmDesign15(hospital, false, true, now));
  assert.equal(model.confirmDesign15({ ...hospital, stage: "payment" }, false, true, now), null);
  assert.equal(model.confirmDesign15({ ...hospital, selection: { ...selection, mode: "video" } }, false, true, now), null);
  assert.ok(model.confirmDesign15({ ...online, selection: { ...selection, mode: "video" } }, true, true, now));
});

test("the first failed payment starts a fixed 15-minute hold and repeated failures never renew it", () => {
  const hold = model.holdAfterPaymentFailure(null, selection, now);
  assert.equal(hold.createdAt, now);
  assert.equal(hold.expiresAt, now + 900_000);
  assert.strictEqual(model.holdAfterPaymentFailure(hold, { ...selection }, now + 500_000), hold);
  assert.strictEqual(model.holdAfterPaymentFailure(hold, { ...selection }, now + 900_000), hold);
  assert.strictEqual(model.holdAfterPaymentFailure(hold, { ...selection }, now + 2_700_000), hold);
  const restored = model.parseDesign15Draft({ ...draft(), failureHold: hold }, selection.doctorId);
  assert.equal(restored.failureHold.expiresAt, hold.expiresAt);
  assert.strictEqual(model.holdAfterPaymentFailure(restored.failureHold, selection, now + 800_000), restored.failureHold);
});

test("failure expiry uses wall-clock time at the exact boundary and blocks both payment methods", () => {
  const hold = model.holdAfterPaymentFailure(null, selection, now);
  assert.equal(model.failureHoldExpired(hold, selection, now + 899_999), false);
  for (const time of [now - 1, now + 900_000, now + 2_700_000]) {
    assert.equal(model.failureHoldExpired(hold, selection, time), true);
    assert.equal(model.confirmDesign15({ ...draft(), failureHold: hold, stage: "payment" }, true, true, time), null);
    assert.equal(model.confirmDesign15({ ...draft(), failureHold: hold, payment: "hospital" }, false, true, time), null);
  }
  assert.ok(model.confirmDesign15({ ...draft(), failureHold: hold, stage: "payment" }, true, true, now + 899_999));
});

test("a failed-payment hold is bound to the exact doctor, mode, hospital, date and time", () => {
  const hold = model.holdAfterPaymentFailure(null, selection, now);
  for (const change of [{ doctorId: "dr-2" }, { mode: "video" }, { hospital: "Another hospital" }, { date: "2026-10-25" }, { time: "11:30 AM" }]) {
    const next = { ...selection, ...change };
    assert.equal(model.failureHoldExpired(hold, next, now + 1000), true);
    assert.equal(model.confirmDesign15({ ...draft(), selection: next, failureHold: hold, stage: "payment" }, true, true, now + 1000), null);
  }
});

test("draft parsing reconstructs only allowlisted fields without leaking extra contact or clinical data", () => {
  const raw = draft();
  raw.identity = { ...raw.identity, token: "do-not-copy" };
  raw.patients = raw.patients.map((entry) => ({ ...entry, accountSecret: "do-not-copy", patient: { ...entry.patient, diagnosis: "do-not-copy" } }));
  raw.selection = { ...raw.selection, patientName: "do-not-copy" };
  raw.paymentToken = "do-not-copy";
  const clean = model.parseDesign15Draft(raw, selection.doctorId);
  assert.deepEqual(Object.keys(clean).sort(), ["doctorId", "failureHold", "identity", "patients", "payment", "receipt", "selectedPatientId", "selection", "stage", "version"]);
  assert.deepEqual(Object.keys(clean.patients[0].patient).sort(), ["age", "email", "gender", "name", "phone", "relation"]);
  assert.equal(JSON.stringify(clean).includes("do-not-copy"), false);
  clean.patients[0].patient.name = "Changed outside";
  assert.notEqual(raw.patients[0].patient.name, "Changed outside");
  const hold = model.holdAfterPaymentFailure(null, selection, now);
  const restoredHold = model.parseDesign15Draft({ ...draft(), failureHold: { ...hold, email: "do-not-copy", selection: { ...selection, name: "do-not-copy" } } }, selection.doctorId);
  assert.equal(JSON.stringify(restoredHold).includes("do-not-copy"), false);
  const receipt = model.confirmDesign15({ ...draft(), stage: "payment" }, true, true, now);
  const restoredReceipt = model.parseDesign15Draft({ ...draft(), stage: "confirmation", receipt: { ...receipt, patient: raw.patients[0].patient } }, selection.doctorId);
  assert.equal("patient" in restoredReceipt.receipt, false);
});

test("draft parsing rejects wrong identity ownership, duplicate patients and over-capacity patient arrays", () => {
  for (const identity of [mobile, email]) {
    const base = draft(identity);
    const wrongPatient = identity.method === "mobile" ? { ...base.patients[0].patient, phone: "9999999999" } : { ...base.patients[0].patient, email: "other@example.test" };
    for (const change of [
      { patients: [{ id: base.selectedPatientId, patient: wrongPatient }] },
      { patients: [...base.patients, base.patients[0]] },
      { patients: Array.from({ length: 11 }, (_, index) => ({ id: `custom-${index}`, patient: { ...base.patients[0].patient } })) },
      { patients: [{ id: "invalid/id", patient: base.patients[0].patient }], selectedPatientId: "invalid/id" },
      { patients: [{ ...base.patients[0], patient: { ...base.patients[0].patient, name: "" } }] },
      { selectedPatientId: "missing-patient" },
    ]) assert.equal(model.parseDesign15Draft({ ...base, ...change }, selection.doctorId), null);
  }
});

test("malformed drafts, dates, times, identity methods and stages are rejected", () => {
  for (const value of [null, [], "draft", {}, { ...draft(), version: 2 }, { ...draft(), doctorId: "dr-2" },
    { ...draft(), selection: null }, { ...draft(), patients: {} }, { ...draft(), stage: ["review"] }, { ...draft(), stage: "complete" },
    { ...draft(), payment: "cash" }, { ...draft(), identity: { method: "unknown", value: mobile.value } },
    ...[{ date: "2026-02-30" }, { date: "2026-13-01" }, { time: "00:30 AM" }, { time: "13:00 PM" }, { time: "10:60 AM" }, { mode: "phone" }]
      .map((change) => ({ ...draft(), selection: { ...selection, ...change } })),
  ]) assert.equal(model.parseDesign15Draft(value, selection.doctorId), null);
  assert.equal(model.parseDesign15Draft({ ...draft(), doctorId: "../doctor" }, "../doctor"), null);
});

test("unauthenticated drafts cannot recover patient or slot selections through later-stage links", () => {
  const initial = { ...draft(), identity: null, patients: [], selectedPatientId: null, selection: { ...selection, time: "" }, stage: "patient" };
  assert.ok(model.parseDesign15Draft(initial, selection.doctorId));
  for (const change of [{ selection }, { patients: draft().patients }, { stage: "appointment" }, { stage: "review" }, { stage: "payment" }, { stage: "confirmation" }]) {
    assert.equal(model.parseDesign15Draft({ ...initial, ...change }, selection.doctorId), null);
  }
  assert.equal(model.parseDesign15Draft({ ...draft(), selectedPatientId: null, stage: "appointment" }, selection.doctorId), null);
  assert.ok(model.parseDesign15Draft({ ...draft(), selection: { ...selection, time: "" }, stage: "appointment" }, selection.doctorId));
  for (const stage of ["review", "payment", "confirmation"]) {
    assert.equal(model.parseDesign15Draft({ ...draft(), selection: { ...selection, time: "" }, stage }, selection.doctorId), null);
  }
});

test("gateway and receipt stages cannot be restored under incompatible payment or receipt states", () => {
  assert.equal(model.parseDesign15Draft({ ...draft(), payment: "hospital", stage: "payment" }, selection.doctorId), null);
  assert.equal(model.parseDesign15Draft({ ...draft(), stage: "confirmation" }, selection.doctorId), null);
  const receipt = model.confirmDesign15({ ...draft(), stage: "payment" }, true, true, now);
  for (const stage of ["patient", "appointment", "review", "payment"]) {
    assert.equal(model.parseDesign15Draft({ ...draft(), receipt, stage }, selection.doctorId), null);
  }
  const confirmed = { ...draft(), receipt, stage: "confirmation" };
  assert.ok(model.parseDesign15Draft(confirmed, selection.doctorId));
  assert.equal(model.parseDesign15Draft({ ...confirmed, payment: "hospital" }, selection.doctorId), null);
  assert.equal(model.parseDesign15Draft({ ...confirmed, failureHold: model.holdAfterPaymentFailure(null, selection, now) }, selection.doctorId), null);
});

test("persisted failure holds reject extended deadlines and mismatched selections", () => {
  const hold = model.holdAfterPaymentFailure(null, selection, now);
  for (const failureHold of [{ ...hold, expiresAt: hold.expiresAt + 1 }, { ...hold, createdAt: null },
    { ...hold, selection: { ...selection, time: "11:30 AM" } }, { ...hold, expiresAt: Infinity }]) {
    assert.equal(model.parseDesign15Draft({ ...draft(), failureHold }, selection.doctorId), null);
  }
  assert.equal(model.parseDesign15Draft({ ...draft(), selection: { ...selection, time: "" }, failureHold: hold }, selection.doctorId), null);
});
