import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/features/health-checkups/healthDetailRouting.ts", import.meta.url), "utf8");
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { resolveHealthDetailItem, findHealthDetailSource } = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
const first = { id: "centre-one-package", slug: "same-package", facilityId: "centre-one", unitCode: "6024", code: "PKG1", price: 0 };
const second = { id: "centre-two-package", slug: "same-package", facilityId: "centre-two", unitCode: "3010", code: "PKG2", price: 200 };
const items = [first, second];

test("facility-specific identities disambiguate shared slugs without dropping zero prices", () => {
  assert.equal(resolveHealthDetailItem(items, "same-package", {}), undefined);
  assert.equal(resolveHealthDetailItem(items, "same-package", { unitCode: "6024" }), first);
  assert.equal(resolveHealthDetailItem(items, "same-package", { item: first.id, unitCode: "6024", code: "PKG1" }).price, 0);
  assert.equal(resolveHealthDetailItem(items, first.id, {}), first);
});

test("unknown, conflicting, blank and repeated query identities never select another package", () => {
  for (const query of [
    { unitCode: "unknown" }, { code: "unknown" }, { item: "unknown" },
    { item: first.id, unitCode: "3010" }, { item: second.id, code: "PKG1" },
    { unitCode: ["6024", "3010"] }, { item: [first.id, second.id] }, { code: ["PKG1"] },
    { unitCode: "" }, { code: "  " }, { item: "" },
  ]) assert.equal(resolveHealthDetailItem(items, "same-package", query), undefined);
  assert.equal(resolveHealthDetailItem(items, "missing", {}), undefined);
});

test("malformed source URLs do not crash detail resolution or cross facility boundaries", () => {
  const invalid = { facilityId: "6024", sourceUrl: "not a URL" };
  const wrongCentre = { facilityId: "3010", sourceUrl: "https://www.narayanahealth.org/health-checkups/package?code=PKG1" };
  const correct = { facilityId: "6024", sourceUrl: "https://www.narayanahealth.org/health-checkups/package?code=PKG1" };
  assert.equal(findHealthDetailSource([invalid, wrongCentre, correct], first), correct);
  assert.equal(findHealthDetailSource([invalid, wrongCentre], first), undefined);
  assert.equal(findHealthDetailSource([{ ...correct, facilityId: "centre-one", unitCode: "6024", code: "PKG1" }], first).code, "PKG1");
});
