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
    const candidate = specifier.startsWith("@/") ? path.join(root, "src", specifier.slice(2))
      : specifier.startsWith(".") && context.parentURL?.startsWith(pathToFileURL(root).href)
        ? fileURLToPath(new URL(specifier, context.parentURL)) : null;
    if (candidate) {
      for (const extension of ["", ".ts", ".tsx"]) {
        if (existsSync(candidate + extension)) return nextResolve(pathToFileURL(candidate + extension).href, context);
      }
    }
    if (specifier === "next/link" || specifier === "next/image") return nextResolve(specifier + ".js", context);
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
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
  for (const design of ["1", "2"]) {
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
