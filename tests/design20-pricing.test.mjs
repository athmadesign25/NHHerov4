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

const { design20Pricing, HEALTH_CREDIT_BALANCE, isDesign20CouponEligible, normalizeDesign20Coupon, defaultSponsorshipForPatient } = await import("../src/features/booking/design20/pricing.ts");
const { design20HealthCreditDraft, parseDesign20Draft } = await import("../src/features/booking/design20/model.ts");
const { Design20DraftStore } = await import("../src/features/booking/design20/serverDraftStore.ts");
const { Design15DraftStore } = await import("../src/features/booking/design15/serverDraftStore.ts");
const { patientsForIdentity } = await import("../src/features/booking/design15/model.ts");
const { getDesign20BookingDoctor } = await import("../src/features/search/design20Directory.ts");
const { getDesign3BookingDoctor } = await import("../src/features/booking/doctors.ts");
const doctor = getDesign20BookingDoctor("dr-1");
const identity = { method: "email", value: "booking@example.test" };
const patients = patientsForIdentity(identity);
const draft = {
  version: 1, doctorId: doctor.id, identity, patients, selectedPatientId: patients[0].id,
  selection: { doctorId: doctor.id, hospital: doctor.hospital, mode: "hospital", date: "2026-10-30", time: "10:30 AM" },
  payment: "online", failureHold: null, receipt: null, stage: "appointment", discountCode: "NHCARE10", sponsorshipId: "nh-staff", useHealthCredits: true,
};
const token = "ac4b86bc-8b7d-4bc9-a5ac-b79f6c689260";

test("one sponsorship applies before one coupon with a transparent exact breakdown", () => {
  const price = design20Pricing("₹1,200", "NHCARE10", "one-health-lite");
  assert.deepEqual(price.amounts, { base: 1200, sponsorshipDiscount: 60, couponDiscount: 114, healthCreditsDiscount: 0, discount: 174, subtotal: 1140, total: 1026 });
  assert.equal(price.total, "₹1,026");
  assert.equal(price.discount, "₹174");
  assert.equal(price.sponsorship.label, "One Health Lite");
  assert.equal(price.hasSponsorship, true);
  assert.equal(price.hasCoupon, true);
});

test("percentage coupons honor their cap and flat coupons honor post-benefit minimums", () => {
  assert.equal(design20Pricing("₹5,000", "NHCARE10", "nhcare").amounts.couponDiscount, 150);
  assert.equal(isDesign20CouponEligible("₹500", "WELCOME100"), true);
  assert.equal(isDesign20CouponEligible("₹500", "WELCOME100", "one-health-lite"), false);
  assert.equal(design20Pricing("₹500", "WELCOME100", "one-health-lite").amounts.total, 475);
  assert.equal(isDesign20CouponEligible("₹300", "CARE50"), true);
  assert.equal(isDesign20CouponEligible("₹299.99", "CARE50"), false);
  assert.equal(design20Pricing("₹625", "WELCOME100", "nh-staff").total, "₹400");
});

test("minor-unit rounding stays exact and payable can never go negative", () => {
  const price = design20Pricing("₹999.99", "NHCARE10", "nhcare");
  assert.deepEqual(price.minorUnits, { base: 99999, sponsorshipDiscount: 15000, subtotal: 84999, couponDiscount: 8500, healthCreditsDiscount: 0, discount: 23500, total: 76499 });
  assert.equal(price.amounts.total, 764.99);
  assert.equal(design20Pricing("₹0.01", "NHCARE10", "nh-staff").minorUnits.total, 1);
  assert.equal(design20Pricing("₹0", "CARE50", "nh-staff").minorUnits.total, 0);
});

test("NH app sponsorship and health credits produce the reference savings", () => {
  assert.equal(HEALTH_CREDIT_BALANCE, 290);
  const sponsored = design20Pricing("₹750", undefined, "one-health-lite");
  assert.equal(sponsored.sponsorshipDiscount, "₹37.50");
  assert.equal(sponsored.total, "₹712.50");
  assert.equal(sponsored.hasHealthCredits, false);
  const credited = design20Pricing("₹750", undefined, "one-health-lite", true);
  assert.equal(credited.healthCreditsUsed, 290);
  assert.equal(credited.healthCreditsDiscount, "₹290");
  assert.equal(credited.discount, "₹327.50");
  assert.equal(credited.total, "₹422.50");
  assert.equal(credited.hasHealthCredits, true);
});

test("credits apply after coupons, cap at the remaining bill and retain paise precision", () => {
  const price = design20Pricing("₹750", "NHCARE10", "one-health-lite", true);
  assert.deepEqual(price.minorUnits, { base: 75000, sponsorshipDiscount: 3750, subtotal: 71250, couponDiscount: 7125,
    healthCreditsDiscount: 29000, discount: 39875, total: 35125 });
  const capped = design20Pricing("₹300", "CARE50", null, true);
  assert.equal(capped.couponEligible, true);
  assert.equal(capped.healthCreditsUsed, 250);
  assert.equal(capped.discount, "₹300");
  assert.equal(capped.total, "₹0");
  const fractional = design20Pricing("₹0.01", undefined, null, true);
  assert.equal(fractional.healthCreditsUsed, 0.01);
  assert.equal(fractional.healthCreditsDiscount, "₹0.01");
  assert.equal(fractional.minorUnits.total, 0);
  assert.equal(design20Pricing("₹0", undefined, null, true).hasHealthCredits, false);
  assert.equal(design20Pricing("₹750", undefined, "one-health-lite", false).total, "₹712.50");
});

test("credits toggle is account-level, reversible and cannot change during or after payment", () => {
  const enabled = design20HealthCreditDraft({ ...draft, selectedPatientId: null, sponsorshipId: undefined, stage: "patient" }, true, true);
  assert.equal(enabled.useHealthCredits, true);
  assert.equal(design20HealthCreditDraft(enabled, false, true).useHealthCredits, false);
  assert.equal(design20HealthCreditDraft(draft, true, false), null);
  assert.equal(design20HealthCreditDraft({ ...draft, identity: null }, true, true), null);
  assert.equal(design20HealthCreditDraft({ ...draft, stage: "payment" }, false, true), null);
  assert.equal(design20HealthCreditDraft({ ...draft, receipt: {} }, false, true), null);
  assert.equal(design20HealthCreditDraft(draft, "true", true), null);
});

test("unknown offers and malformed amounts do not create discounts or credits", () => {
  assert.equal(normalizeDesign20Coupon("  nhcare10  "), "NHCARE10");
  assert.equal(normalizeDesign20Coupon("NHCARE100"), null);
  assert.equal(design20Pricing("₹1,200", "UNKNOWN", "unknown").total, "₹1,200");
  for (const fee of ["₹-100", "abc", "Infinity", "₹1.23.4", "₹1,200 plus 30", "9007199254740992"]) {
    assert.equal(design20Pricing(fee, "NHCARE10", "nh-staff").amounts.total, 0, fee);
  }
});

test("fixture member benefits remain distinct and new members have none by default", () => {
  assert.equal(defaultSponsorshipForPatient({ id: "existing-self" }), "one-health-lite");
  assert.equal(defaultSponsorshipForPatient({ id: "existing-spouse" }), "nhcare");
  assert.equal(defaultSponsorshipForPatient({ id: "existing-parent" }), "nh-staff");
  assert.equal(defaultSponsorshipForPatient({ id: "existing-child" }), null);
  assert.equal(defaultSponsorshipForPatient({ id: "new-member", patient: { relation: "self" } }), null);
  assert.equal(defaultSponsorshipForPatient(undefined), null);
});

test("D20 parsing preserves one plan and an explicit no-benefit choice, and rejects invalid IDs", () => {
  assert.equal(parseDesign20Draft(draft).sponsorshipId, "nh-staff");
  assert.equal(parseDesign20Draft({ ...draft, sponsorshipId: null }).sponsorshipId, null);
  assert.equal(parseDesign20Draft({ ...draft, sponsorshipId: undefined }).sponsorshipId, undefined);
  for (const sponsorshipId of ["unknown", ["nh-staff", "nhcare"], {}, 20]) {
    assert.equal(parseDesign20Draft({ ...draft, sponsorshipId }), null);
  }
  assert.equal(parseDesign20Draft({ ...draft, selectedPatientId: null, stage: "patient" }), null);
  assert.equal(parseDesign20Draft(draft, "other-doctor"), null);
  for (const invalid of [null, undefined, "draft", {}, []]) assert.equal(parseDesign20Draft(invalid), null);
});

test("credit preferences survive parsing and legacy drafts stay compatible", () => {
  assert.equal(parseDesign20Draft(draft).useHealthCredits, true);
  assert.equal(parseDesign20Draft({ ...draft, useHealthCredits: false }).useHealthCredits, false);
  const { useHealthCredits, ...legacy } = draft;
  assert.equal(useHealthCredits, true);
  assert.equal(parseDesign20Draft(legacy).useHealthCredits, undefined);
  for (const value of [null, 290, "true", {}, []]) assert.equal(parseDesign20Draft({ ...draft, useHealthCredits: value }), null);
  assert.equal(parseDesign20Draft({ ...legacy, identity: null, patients: [], selectedPatientId: null,
    sponsorshipId: undefined, stage: "patient", useHealthCredits: true }), null);
});

test("D20 recovery retains benefits while the earlier design store keeps its original schema", () => {
  const d20 = new Design20DraftStore();
  const d15 = new Design15DraftStore();
  try {
    assert.equal(d20.put(token, doctor.id, draft), "saved");
    assert.equal(d20.get(token, doctor.id).sponsorshipId, "nh-staff");
    assert.equal(d20.get(token, doctor.id).discountCode, "NHCARE10");
    assert.equal(d20.get(token, doctor.id).useHealthCredits, true);
    assert.equal(d20.put(token, doctor.id, { ...draft, sponsorshipId: null }), "saved");
    assert.equal(d20.get(token, doctor.id).sponsorshipId, null);
    assert.equal(d20.put(token, doctor.id, { ...draft, sponsorshipId: "unknown" }), "invalid");
    assert.equal(d15.put(token, doctor.id, { ...draft, selection: { ...draft.selection, hospital: getDesign3BookingDoctor(doctor.id).hospital } }), "saved");
    assert.equal(d15.get(token, doctor.id).sponsorshipId, undefined);
    assert.equal(d15.get(token, doctor.id).useHealthCredits, undefined);
  } finally { d20.dispose(); d15.dispose(); }
});

test("client recovery reloads a server benefit without placing personal details in browser storage", async () => {
  const { saveDesign20Draft, loadDesign20Draft } = await import("../src/features/booking/design20/draft.ts");
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  const originalSession = globalThis.sessionStorage;
  const stored = new Map();
  const requests = [];
  globalThis.window = { setTimeout, clearTimeout };
  globalThis.sessionStorage = { getItem: key => stored.get(key), setItem: (key, value) => stored.set(key, value) };
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return new Response(JSON.stringify({ draft }), { status: 200 });
  };
  try {
    const restored = await loadDesign20Draft(doctor.id);
    assert.equal(restored.sponsorshipId, "nh-staff");
    assert.equal(restored.discountCode, "NHCARE10");
    assert.equal(restored.useHealthCredits, true);
    assert.equal(await saveDesign20Draft({ ...restored, sponsorshipId: null }), true);
    assert.equal(JSON.parse(requests.at(-1).options.body).sponsorshipId, null);
    assert.equal(JSON.parse(requests.at(-1).options.body).useHealthCredits, true);
    assert.deepEqual([...stored.keys()], ["nh:d20:booking-token"]);
    assert.match(stored.get("nh:d20:booking-token"), /^[a-f0-9-]{36}$/);
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.window = originalWindow;
    globalThis.sessionStorage = originalSession;
  }
});
