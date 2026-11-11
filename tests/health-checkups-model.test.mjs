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
    if (candidate?.endsWith(".json") && existsSync(candidate)) return nextResolve(pathToFileURL(candidate).href, context);
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.startsWith(pathToFileURL(root).href) && url.endsWith(".json") && !url.includes("/node_modules/")) {
      return { format: "module", shortCircuit: true, source: `export default ${readFileSync(fileURLToPath(url), "utf8")};` };
    }
    if (url.startsWith(pathToFileURL(root).href) && url.endsWith(".ts") && !url.includes("/node_modules/")) {
      return { format: "module", shortCircuit: true, source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText };
    }
    return nextLoad(url, context);
  },
});

const { PREVIEW_ITEMS: ITEMS, SOURCE_ITEMS, FACILITIES, money, addCartItem: addSourceCartItem, getCartItems: getSourceCartItems, cartTotal, cartRequiresSlot, healthEligibilityMessage, healthDateKey, healthDates, getHealthSlots } = await import("../src/features/health-checkups/catalog.ts");
const addCartItem = (ids, item, facilityId) => addSourceCartItem(ids, item, facilityId, ITEMS);
const getCartItems = (ids, facilityId) => getSourceCartItems(ids, facilityId, ITEMS);
const item = id => {
  const found = ITEMS.find(entry => entry.id === id);
  assert.ok(found, id);
  return found;
};

test("audited package, lab-only and mixed paths have correct totals and scheduling", () => {
  const vital = item("prestige-vital-care");
  const aldolase = item("prestige-aldolase");
  assert.equal(cartTotal([vital]), 4999);
  assert.equal(cartRequiresSlot([vital]), true);
  assert.equal(cartTotal([aldolase]), 1200);
  assert.equal(cartRequiresSlot([aldolase]), false);
  const mixed = getCartItems(addCartItem([vital.id], aldolase, "prestige").ids, "prestige");
  assert.equal(cartTotal(mixed), 6199);
  assert.equal(cartRequiresSlot(mixed), true);
  assert.equal(cartRequiresSlot([]), false);
});

test("one package per booking preserves the original selection and explains rejection", () => {
  const result = addCartItem(["prestige-vital-care"], item("prestige-healthy-heart"), "prestige");
  assert.deepEqual(result.ids, ["prestige-vital-care"]);
  assert.match(result.message, /one package per booking/i);
});

test("adding an included test never adds a second charge", () => {
  const result = addCartItem(["electronic-city-male-executive"], item("electronic-city-hba1c"), "electronic-city");
  assert.deepEqual(result.ids, ["electronic-city-male-executive"]);
  assert.match(result.message, /already included/);
  assert.equal(cartTotal(getCartItems(result.ids, "electronic-city")), 5699);
});

test("adding a package removes already-selected covered tests with explicit feedback", () => {
  const result = addCartItem(["electronic-city-hba1c", "electronic-city-aldolase"], item("electronic-city-male-executive"), "electronic-city");
  assert.deepEqual(result.ids, ["electronic-city-aldolase", "electronic-city-male-executive"]);
  assert.match(result.message, /HbA1c.*won't be charged separately/);
  assert.equal(cartTotal(getCartItems(result.ids, "electronic-city")), 6899);
});

test("cart cannot mix hospitals, duplicate items, unknown IDs or multiple packages", () => {
  const original = ["prestige-aldolase"];
  assert.deepEqual(addCartItem(original, item("prestige-aldolase"), "prestige").ids, original);
  const wrongFacility = addCartItem(original, item("electronic-city-hba1c"), "prestige");
  assert.deepEqual(wrongFacility.ids, original);
  assert.match(wrongFacility.message, /not available/);
  assert.deepEqual(getCartItems(["unknown", "prestige-vital-care", "prestige-healthy-heart", "prestige-cbc", "prestige-aldolase", "prestige-aldolase", "electronic-city-hba1c"], "prestige").map(entry => entry.id), ["prestige-vital-care", "prestige-aldolase"]);
  assert.deepEqual(original, ["prestige-aldolase"]);
});

test("catalog associations and assets are internally valid", () => {
  assert.equal(new Set(ITEMS.map(entry => entry.id)).size, ITEMS.length);
  for (const entry of ITEMS) {
    assert.ok(FACILITIES.some(facility => facility.id === entry.facilityId));
    assert.ok(entry.price > 0);
    if (entry.image) assert.ok(existsSync(path.join(root, "public", entry.image)));
    for (const id of entry.includedTestIds) {
      const included = item(id);
      assert.equal(included.kind, "test");
      assert.equal(included.facilityId, entry.facilityId);
    }
  }
  assert.equal(money(4999), "₹4,999");
  assert.equal(money(57.5), "₹57.50");
});

test("live catalogue stays distinct from illustrative fixtures and has valid source associations", () => {
  assert.ok(SOURCE_ITEMS.length > 0);
  assert.equal(new Set(SOURCE_ITEMS.map(entry => entry.id)).size, SOURCE_ITEMS.length);
  for (const entry of SOURCE_ITEMS) {
    assert.ok(FACILITIES.some(facility => facility.id === entry.facilityId), entry.id);
    assert.ok(Number.isFinite(entry.price) && entry.price >= 0, entry.id);
    assert.ok(entry.sourceUrl?.startsWith("https://www.narayanahealth.org/"));
    assert.ok(["live-detail", "live-listing"].includes(entry.provenance));
    assert.equal(entry.audience, undefined, "Source text must not become inferred clinical eligibility");
    assert.equal(getSourceCartItems([entry.id], entry.facilityId)[0]?.id, entry.id);
  }
  assert.deepEqual(getSourceCartItems(["prestige-healthy-heart"], "prestige"), [], "Demo fixtures cannot enter the real-data catalogue");
});

test("explicit preview audience metadata guards child and gender mismatches", () => {
  const executive = item("electronic-city-male-executive");
  assert.equal(healthEligibilityMessage([executive], { age: "32", gender: "male" }), null);
  assert.equal(healthEligibilityMessage([executive], { age: 18, gender: "male" }), null);
  assert.match(healthEligibilityMessage([executive], { age: "6", gender: "male" }), /men aged 18\+/);
  assert.match(healthEligibilityMessage([executive], { age: "17", gender: "male" }), /Choose another package or member/);
  assert.match(healthEligibilityMessage([executive], { age: "30", gender: "female" }), /Choose another package or member/);
  assert.match(healthEligibilityMessage([executive], { age: "30", gender: "other" }), /Choose another package or member/);
});

test("missing eligibility data is not silently accepted and unspecified packages stay unrestricted", () => {
  const executive = item("electronic-city-male-executive");
  for (const member of [undefined, null, {}, { age: "", gender: "male" }, { age: "unknown", gender: "male" }, { age: "32", gender: "" }]) {
    assert.match(healthEligibilityMessage([executive], member), /Add this member’s age and gender/);
  }
  assert.equal(healthEligibilityMessage([item("prestige-vital-care")], { age: "6", gender: "female" }), null);
  assert.equal(healthEligibilityMessage([item("electronic-city-hba1c")], null), null);
  assert.equal(healthEligibilityMessage([], null), null);
});

for (const zone of ["Asia/Kolkata", "UTC", "America/Los_Angeles"]) {
  test(`slots stay in India time and reject elapsed/invalid dates in ${zone}`, () => {
    const previous = process.env.TZ;
    process.env.TZ = zone;
    try {
      const now = new Date("2026-11-06T02:30:00Z"); // 08:00 in Bangalore.
      assert.equal(healthDateKey(now), "2026-11-06");
      assert.deepEqual(healthDates(2, now), ["2026-11-06", "2026-11-07"]);
      assert.equal(getHealthSlots("2026-11-06", now)[0], "08:30 AM");
      assert.equal(getHealthSlots("2026-11-07", now)[0], "08:00 AM");
      assert.deepEqual(getHealthSlots("2026-11-05", now), []);
      assert.deepEqual(getHealthSlots("2026-02-30", now), []);
      assert.deepEqual(getHealthSlots("tomorrow", now), []);
      assert.deepEqual(getHealthSlots("2026-11-06", new Date("2026-11-06T07:00:00Z")), []);
      assert.equal(healthDateKey(new Date("2026-11-06T19:00:00Z")), "2026-11-07");
    } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; }
  });
}

const { planHealthDetailAddition: planSourceDetailAddition } = await import("../src/features/health-checkups/healthDetailSelection.ts");
const planHealthDetailAddition = (ids, facilityId, item) => planSourceDetailAddition(ids, facilityId, item, ITEMS);

test("detail return preserves existing tests, deduplicates covered tests and remains idempotent", () => {
  const selected = ["electronic-city-aldolase", "electronic-city-hba1c"];
  const packageItem = item("electronic-city-male-executive");
  const first = planHealthDetailAddition(selected, "electronic-city", packageItem);
  assert.equal(first.status, "ready");
  assert.deepEqual(first.ids, ["electronic-city-aldolase", packageItem.id]);
  assert.match(first.message, /won't be charged separately/);
  const repeated = planHealthDetailAddition(first.ids, "electronic-city", packageItem);
  assert.deepEqual(repeated.ids, first.ids);
  assert.match(repeated.message, /already in your selection/);
  assert.deepEqual(selected, ["electronic-city-aldolase", "electronic-city-hba1c"]);
});

test("detail return never clears a different centre's cart before confirmation", () => {
  const current = ["prestige-vital-care", "prestige-aldolase"];
  const packageItem = item("electronic-city-male-executive");
  const pending = planHealthDetailAddition(current, "prestige", packageItem);
  assert.equal(pending.status, "confirm-facility");
  assert.deepEqual(pending.ids, current);
  assert.equal(pending.facilityId, "electronic-city");
  const confirmed = planHealthDetailAddition([], "electronic-city", packageItem);
  assert.equal(confirmed.status, "ready");
  assert.deepEqual(confirmed.ids, [packageItem.id]);
});

test("detail return respects the one-package rule and does not present false success", () => {
  const result = planHealthDetailAddition(["prestige-vital-care"], "prestige", item("prestige-healthy-heart"));
  assert.equal(result.status, "ready");
  assert.deepEqual(result.ids, ["prestige-vital-care"]);
  assert.match(result.message, /Remove your selected package/);
});

test("detail Add retains valid zero prices but rejects unknown or invalid amounts", () => {
  const base = item("prestige-aldolase");
  const free = { ...base, price: 0 };
  const freeResult = planSourceDetailAddition([], "prestige", free, [free]);
  assert.deepEqual(freeResult.ids, [free.id]);
  for (const price of [Number.NaN, Infinity, -1]) {
    const invalid = { ...base, price };
    const result = planSourceDetailAddition([], "prestige", invalid, [invalid]);
    assert.equal(result.status, "blocked");
    assert.deepEqual(result.ids, []);
    assert.match(result.message, /price isn’t listed/);
  }
});

test("an unpriced detail return from another centre keeps the existing cart and centre", () => {
  const selected = item("prestige-vital-care");
  const invalid = { ...item("electronic-city-aldolase"), price: Number.NaN };
  const result = planSourceDetailAddition([selected.id], selected.facilityId, invalid, [selected, invalid]);
  assert.equal(result.status, "blocked");
  assert.equal(result.facilityId, selected.facilityId);
  assert.deepEqual(result.ids, [selected.id]);
});
