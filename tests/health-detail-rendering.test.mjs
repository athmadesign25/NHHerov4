import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/image") return { url: "test:next-image", shortCircuit: true };
    const candidate = specifier.startsWith("@/") ? path.join(root, "src", specifier.slice(2))
      : specifier.startsWith(".") && context.parentURL?.startsWith(pathToFileURL(root).href)
        ? fileURLToPath(new URL(specifier, context.parentURL)) : null;
    if (candidate) {
      for (const extension of ["", ".ts", ".tsx"]) {
        if (existsSync(candidate + extension)) return nextResolve(pathToFileURL(candidate + extension).href, context);
      }
    }
    if (specifier === "next/link") return nextResolve(specifier + ".js", context);
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url === "test:next-image") return { format: "module", shortCircuit: true,
      source: `import imageModule from ${JSON.stringify(pathToFileURL(path.join(root, "node_modules/next/image.js")).href)}; export default imageModule.default ?? imageModule;` };
    if (!url.startsWith(pathToFileURL(root).href) || url.includes("/node_modules/")) return nextLoad(url, context);
    if (url.endsWith(".module.css")) return { format: "module", shortCircuit: true,
      source: "export default new Proxy({}, { get: (_, key) => String(key) });" };
    if (url.endsWith(".json")) return { format: "module", shortCircuit: true,
      source: "export default " + readFileSync(fileURLToPath(url), "utf8") + ";" };
    if (/\.tsx?$/.test(url)) return { format: "module", shortCircuit: true,
      source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
      }).outputText };
    return nextLoad(url, context);
  },
});

const { default: HealthDetail } = await import("../src/features/health-checkups/HealthDetail.tsx");
const { default: HealthItemCard } = await import("../src/features/health-checkups/HealthItemCard.tsx");
const { default: HealthDiscoveryCard } = await import("../src/features/health-checkups/design3/HealthDiscoveryCard.tsx");
const { default: HealthListing3 } = await import("../src/features/health-checkups/design3/HealthListing3.tsx");
const { normalizeHealthDetails } = await import("../src/features/health-checkups/normalizeHealthDetails.ts");
const facility = { id: "test-centre", name: "A long hospital and clinic name that must remain readable", city: "Bangalore", address: "" };
const item = { id: "test", name: "A long laboratory test name (including source medical terminology)", kind: "test", facilityId: facility.id, price: 0, testCount: 0, description: "", inclusions: [], includedTestIds: [], preparation: "", reportTime: "", requiresSlot: false, category: "" };
const render = entry => renderToStaticMarkup(createElement(HealthDetail, { item: entry, facility }));
const text = markup => markup.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");

test("sparse source records keep genuine zero prices and do not invent clinical sections", () => {
  const markup = render(item);
  assert.match(text(markup), /₹0/);
  assert.match(text(markup), /For detailed information and preparation instructions/);
  assert.doesNotMatch(markup, /id="about-package"|id="included-tests"|id="checkup-instructions"/);
  assert.doesNotMatch(text(markup), /tests included|Report availability|Within 24|undefined|NaN/i);
  assert.match(markup, /item=test&amp;add=1/);
});

test("unknown counts and price never render malformed numeric claims or enabled Add", () => {
  const sparse = { ...item, testCount: Infinity, price: Number.NaN, reportTime: "   " };
  const detail = render(sparse);
  assert.doesNotMatch(text(detail), /Infinity|NaN|Tests included|Report availability/);
  assert.match(text(detail), /Price not listed/);
  assert.match(detail, /<button[^>]*disabled/);
  const card = renderToStaticMarkup(createElement(HealthItemCard, { item: sparse, selected: false, included: false, onAdd: () => {}, onDetails: () => {} }));
  assert.doesNotMatch(text(card), /Infinity|NaN|included/);
  assert.match(card, /disabled/);
  assert.match(card, /aria-label="View details for/);
});

test("missing-detail source action is limited to safe official NH URLs", () => {
  for (const sourceUrl of ["javascript:alert(1)", "https://narayanahealth.org.evil.example/test", "not a url"]) {
    assert.doesNotMatch(render({ ...item, sourceUrl }), /View on Narayana Health/);
  }
  const markup = render({ ...item, sourceUrl: "https://www.narayanahealth.org/health-checkups/test?code=T1" });
  assert.match(markup, /View on Narayana Health/);
  assert.match(markup, /rel="noopener noreferrer"/);
});

test("source-backed sections and nested test descriptions render completely with linked anchors", () => {
  const records = JSON.parse(readFileSync(new URL("../src/data/health-checkups/source-details.json", import.meta.url), "utf8"));
  const captured = records.find(record => record.sourceUrl.includes("PKG037822"));
  const details = normalizeHealthDetails(captured.detailsData);
  const markup = render({ ...item, kind: "package", details });
  for (const phrase of [...details.about, ...details.testGroups.map(group => group.name), ...details.instructions]) {
    assert.ok(text(markup).includes(phrase.replaceAll("&", "&amp;").replaceAll("'", "&#x27;").replace(/\s+/g, " ")), phrase);
  }
  const ids = [...markup.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const match of markup.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(match[1]));
  for (const match of markup.matchAll(/aria-controls="([^"]+)"/g)) assert.ok(ids.includes(match[1]));
});

test("detail navigation retains the chosen listing design for Back and Add", async () => {
  const { healthItemDetailHref } = await import("../src/features/health-checkups/healthDetailTypes.ts");
  for (const design of ["1", "2", "3"]) {
    const href = healthItemDetailHref({ ...item, unitCode: "6024", code: "T1" }, design);
    const query = new URL(href, "https://preview.example").searchParams;
    assert.equal(query.get("design"), design);
    assert.equal(query.get("item"), item.id);
    assert.equal(query.get("unitCode"), "6024");
    const markup = renderToStaticMarkup(createElement(HealthDetail, { item, facility, design }));
    const listingLinks = [...markup.matchAll(/href="(\/health-checkups\?[^\"]*)"/g)].map(match => new URL(match[1].replaceAll("&amp;", "&"), "https://preview.example"));
    assert.ok(listingLinks.length >= 2);
    for (const link of listingLinks) assert.equal(link.searchParams.get("design"), design);
  }
});

test("direct detail entries return and add to the current listing preview", () => {
  const markup = render(item);
  const listingLinks = [...markup.matchAll(/href="(\/health-checkups\?[^\"]*)"/g)].map(match => new URL(match[1].replaceAll("&amp;", "&"), "https://preview.example"));
  assert.ok(listingLinks.length >= 2);
  for (const link of listingLinks) {
    assert.equal(link.searchParams.get("design"), "3");
    assert.equal(link.searchParams.get("hospital"), facility.id);
    assert.equal(link.searchParams.get("tab"), "tests");
  }
  assert.equal(listingLinks.find(link => link.searchParams.get("add") === "1")?.searchParams.get("item"), item.id);
});

test("discovery cards show only available source information and keep selection states explicit", () => {
  const props = { item, selected: false, included: false, onAdd() {}, onDetails() {}, onTests() {} };
  const sparse = renderToStaticMarkup(createElement(HealthDiscoveryCard, props));
  assert.match(text(sparse), /₹0/);
  assert.match(sparse, /lab-tests-v1/);
  assert.match(text(sparse), /Includes 1 test/);
  assert.doesNotMatch(text(sparse), /Report|Fasting|undefined|NaN/);
  const unpriced = renderToStaticMarkup(createElement(HealthDiscoveryCard, { ...props, item: { ...item, price: Number.NaN } }));
  assert.match(unpriced, /disabled=""[^>]*aria-label="Add A long laboratory test name/);
  assert.match(text(unpriced), /Price not listed/);
  const selected = renderToStaticMarkup(createElement(HealthDiscoveryCard, { ...props, selected: true }));
  assert.match(selected, /aria-pressed="true"[^>]*aria-label="Remove/);
  const included = renderToStaticMarkup(createElement(HealthDiscoveryCard, { ...props, included: true }));
  assert.match(included, /disabled=""[^>]*aria-label="[^"]*is included in your package"/);
});

test("discovery search groups image cards and retains selection without comparison controls", () => {
  const packageItem = { ...item, id: "package", kind: "package", name: "Thyroid health package" };
  const testItem = { ...item, id: "lab", name: "Thyroid function test" };
  const noop = () => {};
  const props = { cities: [{ value: "bangalore", label: "Bangalore" }], facilities: [facility], facility,
    facilityOpen: false, onOpenFacility: noop, onCloseFacility: noop, onFacility: noop,
    catalog: [packageItem, testItem], query: "thyroid", onQuery: noop, tab: "test", onTab: noop,
    category: "All", onCategory: noop, ids: [packageItem.id], includedIds: [],
    onAdd: noop, onDetails: noop };
  const markup = renderToStaticMarkup(createElement(HealthListing3, props));
  assert.match(markup, /<section aria-label="Health packages"/);
  assert.match(markup, /<section aria-label="Lab tests"/);
  assert.match(markup, /aria-label="Remove Thyroid health package from cart"/);
  assert.equal((markup.match(/<img /g) ?? []).length, 2);
  assert.doesNotMatch(markup, /Compare|comparison/);
  const testsOnly = renderToStaticMarkup(createElement(HealthListing3, { ...props, query: "" }));
  assert.doesNotMatch(testsOnly, /<article[^>]*data-kind="package"/);
  assert.match(testsOnly, /<article[^>]*data-kind="test"/);
  assert.doesNotMatch(testsOnly, /Compare|comparison/);
  const noCentre = renderToStaticMarkup(createElement(HealthListing3, { ...props, facility: undefined }));
  assert.match(text(noCentre), /Choose where you’ll visit/);
  assert.doesNotMatch(noCentre, /<article|<select/);
});

test("card pricing never invents a discount and included counts agree with the popup list", async () => {
  const { healthCardContent, healthCategories } = await import("../src/features/health-checkups/healthCardContent.ts");
  const packageItem = { ...item, kind: "package", price: 500, name: "Female health package" };
  for (const originalPrice of [undefined, 0, 500, 400, Infinity]) {
    assert.equal(healthCardContent({ ...packageItem, originalPrice }).originalPrice, undefined);
  }
  const includedTests = [{ name: "Lipid profile", parameters: [{ name: "HDL" }, { name: "LDL" }] }, { name: "Glucose", parameters: [] }];
  const content = healthCardContent({ ...packageItem, originalPrice: 750, includedTests });
  assert.equal(content.originalPrice, 750);
  assert.equal(content.testCount, 2);
  assert.deepEqual(content.groups, includedTests);
  assert.equal(healthCardContent(packageItem).testCount, undefined);
  assert.deepEqual(healthCategories(packageItem), ["women"]);
  assert.deepEqual(healthCategories({ ...packageItem, name: "Male health package" }), ["men"]);
});

test("booked-before status is member-specific and clears on sign-out", async () => {
  const { rememberHealthBooking, clearHealthBookingHistory, getHealthBookingHistory, getServerHealthBookingHistory } = await import("../src/features/health-checkups/healthBookingHistory.ts");
  clearHealthBookingHistory();
  assert.deepEqual(getHealthBookingHistory(), {});
  rememberHealthBooking("member-a", ["test-a", "test-a"]);
  rememberHealthBooking("member-b", ["test-b"]);
  assert.deepEqual(getHealthBookingHistory()["member-a"], ["test-a"]);
  assert.deepEqual(getHealthBookingHistory()["member-b"], ["test-b"]);
  assert.deepEqual(getServerHealthBookingHistory(), {});
  clearHealthBookingHistory();
  assert.deepEqual(getHealthBookingHistory(), {});
});
