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
  const card = renderToStaticMarkup(createElement(HealthDiscoveryCard, { item: sparse, selected: false, included: false, onAdd: () => {}, onDetails: () => {}, onTests: () => {} }));
  assert.doesNotMatch(text(card), /Infinity|NaN/);
  assert.match(card, /disabled/);
  assert.match(card, /aria-label="View (included tests for|details for)/);
});

test("test detail content uses supplied description and preparation without losing centre pricing", () => {
  const markup = render({ ...item, description: "Source description of this test.", preparation: "Source preparation instructions.", price: 650 });
  assert.match(text(markup), /What is this test\?/);
  assert.match(text(markup), /How to prepare/);
  assert.equal(text(markup).split("Source description of this test.").length - 1, 1);
  assert.match(text(markup), /Source preparation instructions/);
  assert.match(text(markup), /Where to book.*A long hospital and clinic name.*Test price ₹650/);
  assert.match(markup, /id="where-to-book"/);
  assert.match(markup, /google\.com\/maps\/dir\//);
});

test("package links require explicit membership at the same centre", () => {
  const included = { ...item, id: "package-a", kind: "package", name: "Included package", price: 1200, includedTestIds: [item.id] };
  const otherCentre = { ...included, id: "package-b", name: "Wrong centre package", facilityId: "another-centre" };
  const unrelated = { ...included, id: "package-c", name: "Unrelated package", includedTestIds: [] };
  const markup = renderToStaticMarkup(createElement(HealthDetail, { item, facility, design: "4", relatedPackages: [included, otherCentre, unrelated] }));
  assert.match(text(markup), /Packages that include this test/);
  assert.match(markup, /href="\/health-checkups\/package-a\?design=4&amp;item=package-a"/);
  assert.doesNotMatch(text(markup), /Wrong centre package|Unrelated package/);
  assert.doesNotMatch(text(render(item)), /Packages that include this test/);
});

test("test titles expose direct detail links with the facility identity", () => {
  const entry = { ...item, slug: "test-name", unitCode: "1014", code: "TEST01" };
  const markup = renderToStaticMarkup(createElement(HealthDiscoveryCard, { item: entry, selected: false, included: false, onAdd() {}, onDetails() {}, onTests() {} }));
  assert.match(markup, /<h3[^>]*><a href="\/health-checkups\/test-name\?design=4&amp;unitCode=1014&amp;code=TEST01&amp;item=test"/);
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
  for (const design of ["4"]) {
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
    assert.equal(link.searchParams.get("design"), "4");
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

test("unified search includes both types while browse shortcuts retain cart selection", () => {
  const packageItem = { ...item, id: "package", kind: "package", name: "Thyroid health package" };
  const testItem = { ...item, id: "lab", name: "Thyroid function test" };
  const noop = () => {};
  const props = { cities: [{ value: "bangalore", label: "Bangalore" }], facilities: [facility], facility,
    facilityOpen: false, onOpenFacility: noop, onCloseFacility: noop, onFacility: noop,
    catalog: [packageItem, testItem], query: "thyroid", onQuery: noop, tab: "test", onTab: noop,
    category: "All", onCategory: noop, ids: [packageItem.id], includedIds: [],
    onAdd: noop, onDetails: noop };
  const markup = renderToStaticMarkup(createElement(HealthListing3, props));
  assert.match(markup, /role="combobox"/);
  assert.doesNotMatch(markup, /role="tablist"|role="tabpanel"/);
  assert.match(markup, /<article[^>]*data-kind="package"/);
  assert.match(markup, /<article[^>]*data-kind="test"/);
  const cards = markup.match(/<article\b[\s\S]*?<\/article>/g) ?? [];
  assert.equal(cards.length, 2);
  for (const card of cards) assert.equal((card.match(/<img /g) ?? []).length, 1);
  const packagesOnly = renderToStaticMarkup(createElement(HealthListing3, { ...props, tab: "package" }));
  assert.match(packagesOnly, /aria-label="Remove Thyroid health package from cart"/);
  assert.match(packagesOnly, /<article[^>]*data-kind="test"/);
  assert.doesNotMatch(markup, /Compare|comparison/);
  const testsOnly = renderToStaticMarkup(createElement(HealthListing3, { ...props, query: "" }));
  assert.doesNotMatch(testsOnly, /<article[^>]*data-kind="package"/);
  assert.match(testsOnly, /<article[^>]*data-kind="test"/);
  assert.doesNotMatch(testsOnly, /Compare|comparison/);
  const noCentre = renderToStaticMarkup(createElement(HealthListing3, { ...props, facility: undefined }));
  assert.match(text(noCentre), /Where would you like to visit?/);
  assert.doesNotMatch(noCentre, /<article|<select|role="tablist"|id="health-discovery-search"/);
  const otherMatches = renderToStaticMarkup(createElement(HealthListing3, { ...props, tab: "package", catalog: [testItem] }));
  assert.match(otherMatches, /<article[^>]*data-kind="test"/);
  assert.doesNotMatch(otherMatches, /<article[^>]*data-kind="package"/);
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

test("card facts retain source samples and distinguish test groups from their parameters", async () => {
  const { healthCardContent } = await import("../src/features/health-checkups/healthCardContent.ts");
  const content = healthCardContent({ ...item, id: "source-6024-pkg037822", kind: "package" });
  assert.deepEqual(content.samples, ["Blood", "Urine"]);
  assert.equal(content.testCount, 26);
  assert.equal(content.preparation, "");
  assert.equal(content.reportTime, "");
  assert.ok(content.highlights.every(name => content.groups.some(group => group.name === name)));
  const fallback = healthCardContent({ ...item, details: { profileTestGroups: [], testGroups: [{ name: "Thyroid profile", parameters: ["T3", "T4", "TSH"] }], sampleRequired: [" Blood ", "", "Blood"] } });
  assert.deepEqual(fallback.samples, ["Blood"]);
  assert.equal(fallback.testCount, 1);
  assert.deepEqual(healthCardContent(item).samples, []);
});

test("packages without captured inclusions open details instead of an empty included-tests dialog", () => {
  const markup = renderToStaticMarkup(createElement(HealthDiscoveryCard, { item: { ...item, kind: "package", requiresSlot: true }, selected: false, included: false, onAdd() {}, onDetails() {}, onTests() {} }));
  assert.match(text(markup), /View details/);
  assert.match(text(markup), /Choose a time at checkout/);
  assert.doesNotMatch(markup, /aria-haspopup="dialog"/);
  assert.doesNotMatch(text(markup), /Sample|Reports|Preparation|Includes 0/);
});

const { withHealthDemoContent, researchProfileFor } = await import("../src/features/health-checkups/content/withHealthDemoContent.ts");

test("researched demo content covers the catalogue without changing prices or inclusions", () => {
  const items = JSON.parse(readFileSync(new URL("../src/data/health-checkups/items.json", import.meta.url), "utf8"));
  for (const entry of items) {
    const result = withHealthDemoContent(entry);
    assert.ok(result.details.about.some(Boolean), entry.name);
    assert.ok(result.details.instructions.some(Boolean) || result.details.instructionGroups?.length, entry.name);
    if (entry.kind === "test") assert.ok(researchProfileFor(entry), entry.name);
    for (const key of ["price", "originalPrice", "testCount", "includedTestIds", "inclusions", "reportTime", "requiresSlot", "facilityId"])
      assert.deepEqual(result[key], entry[key], `${entry.name}: ${key}`);
    for (const source of result.details.editorial?.sources ?? []) assert.equal(new URL(source).protocol, "https:");
    assert.deepEqual(withHealthDemoContent(result), result, entry.name);
  }
});

test("demo adapter preserves supplied clinical fields and structured instructions", () => {
  const details = { about: ["Approved clinical content"], sampleRequired: ["Specified sample"], instructions: ["Approved preparation"], testGroups: [{ name: "Source group", parameters: [] }] };
  const populated = withHealthDemoContent({ ...item, name: "Hba 1c", details });
  for (const key of Object.keys(details)) assert.deepEqual(populated.details[key], details[key]);
  assert.equal(populated.details.editorial, undefined);
  const grouped = withHealthDemoContent({ ...item, details: { instructionGroups: [{ title: "On arrival", items: ["Specific instruction"] }] } });
  assert.deepEqual(grouped.details.instructions, []);
  assert.deepEqual(grouped.details.instructionGroups, [{ title: "On arrival", items: ["Specific instruction"] }]);
});

test("similar medical names do not cross clinical families", () => {
  for (const [name, expected] of [["Crp (c -reactive Protein ) Hs", "inflammation"], ["Procalcitonin (pct )", "inflammation"], ["Thiopurine Methyltransferase (tpmt )", "drug-monitoring"], ["Anti -tpo Antibody", "thyroid-antibody"], ["Serum Immunoglobulin", "protein-immunity"], ["24 Hours Urine For Cortisol", "urine-timed"]])
    assert.equal(researchProfileFor({ kind: "test", name })?.id, expected, name);
  const service = withHealthDemoContent({ ...item, name: "Nebulisation" });
  assert.match(text(render(service)), /About this service/);
  assert.doesNotMatch(text(render(service)), /What is this test/);
});
