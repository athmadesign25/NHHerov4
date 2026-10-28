import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

// The model has only erased type imports, so its runtime is independent of
// React, browser globals and Next routing.
const source = ts.transpileModule(readFileSync(new URL("./model.ts", import.meta.url), "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
const model = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
const navigationSource = ts.transpileModule(readFileSync(new URL("./navigation.ts", import.meta.url), "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
const { bookingDirectoryHref } = await import(`data:text/javascript;base64,${Buffer.from(navigationSource).toString("base64")}`);

const selection = { doctorId: "dr-1", mode: "hospital", hospital: "Narayana Health City", date: "2026-10-21", time: "10:30 AM" };
const now = new Date("2026-10-20T06:00:00.000Z").getTime();
const validPatient = { name: "Sample Person", age: "32", gender: "other", relation: "self", phone: "9000000000", email: "" };

test("a hold lasts exactly 15 minutes and never extends when review or payment is retried", () => {
  const first = model.getOrCreateHold(null, selection, now);
  assert.equal(first.expiresAt - first.createdAt, 900_000);
  assert.strictEqual(model.getOrCreateHold(first, { ...selection }, now + 500_000), first);
  assert.strictEqual(model.getOrCreateHold(first, { ...selection }, now + 950_000), first, "expired holds are not silently renewed");
  assert.equal(model.remainingHoldSeconds(first, now + 899_001), 1);
  assert.equal(model.remainingHoldSeconds(first, now + 900_000), 0);
});

test("expiry is checked from wall-clock time after tab sleep, including the exact boundary", () => {
  const hold = model.getOrCreateHold(null, selection, now);
  assert.equal(model.holdIsActive(hold, selection, now + 899_999), true);
  assert.equal(model.holdIsActive(hold, selection, now + 900_000), false);
  assert.equal(model.holdIsActive(hold, selection, now + 2_700_000), false);
  assert.equal(model.holdIsActive(hold, selection, now - 1), false);
  assert.equal(model.createPreviewReceipt(hold, selection, "online", true, true, now + 900_000), null);
});

test("a hold is bound to exact doctor, mode, hospital, day and time", () => {
  const hold = model.getOrCreateHold(null, selection, now);
  for (const changed of [
    { doctorId: "dr-2" }, { mode: "video" }, { hospital: "Another hospital" },
    { date: "2026-10-22" }, { time: "11:30 AM" },
  ]) {
    const next = { ...selection, ...changed };
    assert.equal(model.holdIsActive(hold, next, now + 1000), false);
    assert.notEqual(model.getOrCreateHold(hold, next, now + 1000).id, hold.id);
    assert.equal(model.createPreviewReceipt(hold, next, "online", true, true, now + 1000), null);
  }
});

test("online checkout requires gateway success; availability and hold are required for both methods", () => {
  const hold = model.getOrCreateHold(null, selection, now);
  assert.equal(model.createPreviewReceipt(hold, selection, "online", false, true, now + 1000), null);
  assert.equal(model.createPreviewReceipt(hold, selection, "online", true, false, now + 1000), null);
  assert.equal(model.createPreviewReceipt(null, selection, "hospital", false, true, now + 1000), null);
  assert.equal(model.createPreviewReceipt(hold, selection, "hospital", false, false, now + 1000), null);
  const paid = model.createPreviewReceipt(hold, selection, "online", true, true, now + 1000);
  assert.match(paid.ref, /^NH7-[A-F0-9]{8}$/);
  assert.equal(paid.payment, "online");
  assert.equal(paid.status, "confirmed");
  assert.equal(model.createPreviewReceipt(hold, selection, "hospital", false, true, now + 1000).payment, "hospital");
});

test("video appointments cannot bypass online payment using pay at hospital", () => {
  const video = { ...selection, mode: "video" };
  const hold = model.getOrCreateHold(null, video, now);
  assert.equal(model.createPreviewReceipt(hold, video, "hospital", false, true, now + 1000), null);
  assert.equal(model.createPreviewReceipt(hold, video, "online", false, true, now + 1000), null);
  assert.ok(model.createPreviewReceipt(hold, video, "online", true, true, now + 1000));
});

test("refresh restores the original hold deadline and strips all patient/contact fields", () => {
  const hold = model.getOrCreateHold(null, selection, now);
  const raw = JSON.stringify({
    version: 1, selection: { ...selection, patientName: "Private name" },
    hold: { ...hold, phone: "9876543210" }, receipt: null,
    patient: validPatient, email: "private@example.com", token: "secret",
  });
  const restored = model.parseStoredCheckout(raw, selection.doctorId);
  assert.deepEqual(restored, { version: 1, selection, hold, receipt: null });
  assert.equal(model.getOrCreateHold(restored.hold, restored.selection, now + 600_000).expiresAt, now + 900_000);
  assert.equal(JSON.stringify(restored).includes("Private"), false);
  assert.equal(JSON.stringify(restored).includes("9876543210"), false);
  assert.equal(model.parseStoredCheckout(raw, "different-doctor"), null);
});

test("malformed, mismatched and extended persisted holds are rejected", () => {
  const hold = model.getOrCreateHold(null, selection, now);
  const saved = { version: 1, selection, hold, receipt: null };
  assert.equal(model.parseStoredCheckout("{broken", selection.doctorId), null);
  assert.equal(model.parseStoredCheckout(JSON.stringify({ ...saved, version: 2 }), selection.doctorId), null);
  assert.equal(model.parseStoredCheckout(JSON.stringify({ ...saved, hold: { ...hold, expiresAt: hold.expiresAt + 1 } }), selection.doctorId), null);
  assert.equal(model.parseStoredCheckout(JSON.stringify({ ...saved, hold: { ...hold, selection: { ...selection, time: "11:30 AM" } } }), selection.doctorId), null);
  assert.equal(model.parseStoredCheckout(JSON.stringify({ ...saved, hold: { ...hold, createdAt: null } }), selection.doctorId), null);
});

test("stored selections reject impossible dates and malformed clocks before calendar or UI rendering", () => {
  for (const invalid of [{ date: "2026-02-30" }, { date: "2026-13-01" }, { time: "00:30 AM" }, { time: "13:00 PM" }, { time: "10:60 AM" }]) {
    const data = { version: 1, selection: { ...selection, ...invalid }, hold: null, receipt: null };
    assert.equal(model.parseStoredCheckout(JSON.stringify(data), selection.doctorId), null);
  }
});

test("receipt persistence has no patient fields and validates cancelled state without inventing a refund", () => {
  const hold = model.getOrCreateHold(null, selection, now);
  const receipt = model.createPreviewReceipt(hold, selection, "online", true, true, now + 1000);
  const saved = model.parseStoredCheckout(JSON.stringify({ version: 1, selection, hold: null, receipt: { ...receipt, status: "cancelled", patient: validPatient } }), selection.doctorId);
  assert.equal(saved.receipt.status, "cancelled");
  assert.equal("patient" in saved.receipt, false);
  assert.equal("refund" in saved.receipt, false);
});

test("patient validation requires matching demo verification and rejects incomplete or invalid values", () => {
  assert.deepEqual(model.validatePatient(validPatient, validPatient.phone), {});
  assert.ok(model.validatePatient(validPatient, "9111111111").phone);
  for (const invalid of [{ name: " " }, { age: "-1" }, { age: "121" }, { age: "2.5" }, { age: "" }, { gender: "" }, { phone: "1234567890" }, { email: "invalid@" }]) {
    assert.ok(Object.keys(model.validatePatient({ ...validPatient, ...invalid }, validPatient.phone)).length);
  }
  assert.deepEqual(model.validatePatient({ ...validPatient, age: "0" }, validPatient.phone), {}, "infant appointments remain possible");
});

test("calendar download is marked preview only and converts India time to UTC", () => {
  const hold = model.getOrCreateHold(null, selection, now);
  const receipt = model.createPreviewReceipt(hold, selection, "online", true, true, now + 1000);
  const calendar = model.receiptCalendar(receipt, "Dr. Example");
  assert.match(calendar, /DTSTART:20261021T050000Z/);
  assert.match(calendar, /SUMMARY:PREVIEW ONLY/);
  assert.match(calendar, /STATUS:TENTATIVE/);
  assert.equal(calendar.includes(validPatient.name), false);
});

test("directory return links keep every visual journey, consultation mode and encoded location", () => {
  for (const design of ["d7", "d8", "d9", "d10", "d11", "d12"]) {
    for (const mode of ["hospital", "video"]) {
      const url = new URL(bookingDirectoryHref(design, "Delhi & NCR", mode), "http://localhost");
      assert.equal(url.pathname, "/search/doctors");
      assert.equal(url.searchParams.get("design"), design);
      assert.equal(url.searchParams.get("mode"), mode);
      assert.equal(url.searchParams.get("location"), "Delhi & NCR");
      assert.deepEqual([...url.searchParams.keys()].sort(), ["design", "location", "mode"]);
    }
  }
});

test("visual journeys share the same held selection and do not renew its deadline", () => {
  const hold = model.getOrCreateHold(null, selection, now);
  const raw = JSON.stringify({ version: 1, selection, hold, receipt: null });
  for (const design of ["d8", "d9", "d10", "d11", "d12", "d7"]) {
    const href = new URL(bookingDirectoryHref(design, "Bangalore", selection.mode), "http://localhost");
    assert.equal(href.searchParams.get("design"), design);
    const restored = model.parseStoredCheckout(raw, selection.doctorId);
    assert.equal(model.getOrCreateHold(restored.hold, restored.selection, now + 600_000).expiresAt, hold.expiresAt);
    assert.equal(model.checkoutStorageKey(selection.doctorId), "nh:d7:checkout:dr-1");
  }
});
