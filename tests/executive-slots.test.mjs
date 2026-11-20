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

const { getExecutiveSlot, getAppointmentFee } = await import("../src/features/booking/executiveSlots.ts");
const { getDesign3BookingSlots } = await import("../src/features/booking/design3Availability.ts");
const { getDesign20DirectoryDoctor } = await import("../src/features/search/design20Directory.ts");
const { design20Pricing } = await import("../src/features/booking/design20/pricing.ts");
const doctor = getDesign20DirectoryDoctor("dr-ashley");
const selection = { doctorId: doctor.id, mode: "hospital", hospital: doctor.hospital, date: "2026-11-17", time: "02:45 PM" };
const now = new Date("2026-11-16T02:30:00Z");

test("executive appointments require an explicitly configured doctor, mode, location and time", () => {
  for (const id of ["dr-1", "dr-ashley"]) {
    const entry = getDesign20DirectoryDoctor(id);
    assert.deepEqual(getExecutiveSlot({ ...selection, doctorId: id, hospital: entry.hospital }), { fee: "₹2,250" });
  }
  for (const change of [
    { doctorId: "dr-3" }, { doctorId: "unknown" }, { mode: "video" },
    { hospital: "An unrelated hospital" }, { time: "01:15 PM" }, { time: "07:30 PM" },
    { date: "2026-11-32" }, { time: "not a time" },
  ]) assert.equal(getExecutiveSlot({ ...selection, ...change }), null, JSON.stringify(change));
});

test("profile URLs and stored bookings resolve the same executive appointment", () => {
  assert.ok(doctor.profileSlug);
  assert.deepEqual(getExecutiveSlot({ ...selection, doctorId: doctor.profileSlug }), { fee: "₹2,250" });
  assert.deepEqual(getExecutiveSlot({ ...selection, date: "2026-10-17" }), { fee: "₹2,250" });
});

test("executive fee replaces the standard fee and existing discount arithmetic uses it once", () => {
  const executiveFee = getAppointmentFee(doctor.fee, selection);
  assert.equal(executiveFee, "₹2,250");
  assert.equal(getAppointmentFee(executiveFee, selection), executiveFee);
  assert.equal(getAppointmentFee(doctor.fee, { ...selection, time: "01:15 PM" }), doctor.fee);
  const pricing = design20Pricing(executiveFee, "NHCARE10", "one-health-lite", true);
  assert.equal(pricing.amounts.base, 2250);
  assert.equal(pricing.amounts.sponsorshipDiscount, 112.5);
  assert.equal(pricing.amounts.couponDiscount, 150);
  assert.equal(pricing.amounts.total, 1697.5);
});

test("latest availability exposes a mix of explicit executive and standard slots", () => {
  const slots = getDesign3BookingSlots(doctor.id, selection.date, "hospital", selection.hospital, now, 21, "d20");
  assert.deepEqual(slots.filter(slot => slot.isExecutive && slot.available).map(slot => slot.time), ["02:45 PM", "05:30 PM", "06:00 PM"]);
  assert.ok(slots.some(slot => slot.available && !slot.isExecutive));
  assert.ok(slots.some(slot => slot.time === "07:30 PM" && slot.available && !slot.isExecutive));
  const regular = getDesign20DirectoryDoctor("dr-3");
  assert.ok(getDesign3BookingSlots(regular.id, selection.date, "hospital", regular.hospital, now, 21, "d20").every(slot => !slot.isExecutive));
  assert.ok(getDesign3BookingSlots("dr-1", selection.date, "video", getDesign20DirectoryDoctor("dr-1").hospital, now, 21, "d20").every(slot => !slot.isExecutive));
});

test("past executive slots remain unavailable and legacy previews keep their original metadata", () => {
  const lateNow = new Date("2026-11-17T12:45:00Z");
  const slots = getDesign3BookingSlots(doctor.id, selection.date, "hospital", selection.hospital, lateNow, 21, "d20");
  assert.ok(slots.filter(slot => slot.isExecutive).every(slot => !slot.available));
  const legacy = getDesign3BookingSlots("dr-1", selection.date, "hospital", "Narayana Health City, Bangalore", now, 21);
  assert.ok(legacy.length > 0);
  assert.ok(legacy.every(slot => slot.isExecutive === undefined));
});
