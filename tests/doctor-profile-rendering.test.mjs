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
    if (context.parentURL?.includes("/node_modules/")) return nextResolve(specifier, context);
    const candidate = specifier.startsWith("@/") ? path.join(root, "src", specifier.slice(2))
      : specifier.startsWith(".") && context.parentURL?.startsWith(pathToFileURL(root).href)
        ? fileURLToPath(new URL(specifier, context.parentURL)) : null;
    if (candidate) {
      for (const extension of ["", ".ts", ".tsx"]) {
        if (existsSync(candidate + extension)) return nextResolve(pathToFileURL(candidate + extension).href, context);
      }
    }
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

const { capturedDoctorProfiles } = await import("../src/features/search/doctorProfileSource.ts");
const { masterProfile } = await import("../src/features/search/doctorProfileMaster.ts");
const { default: SourceSections, getSourceContentSections } = await import("../src/app/doctors/[slug]/design2/DoctorProfileSourceSections2.tsx");

const entities = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00a0", ndash: "–", mdash: "—", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”", hellip: "…", bull: "•", middot: "·", copy: "©", reg: "®", trade: "™" };
const decode = text => text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (whole, code) => code[0] === "#"
  ? String.fromCodePoint(parseInt(code.slice(/^#x/i.test(code) ? 2 : 1), /^#x/i.test(code) ? 16 : 10)) : entities[code.toLowerCase()] ?? whole);
const normalize = text => decode(text).replace(/\s+/g, " ").trim();
const visibleText = markup => normalize(markup.replace(/<[^>]*>/g, " "));
const render = (source, section) => renderToStaticMarkup(createElement(SourceSections, { source, section }));
const renderedSections = markup => [...markup.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map(match => match[1]);
const expectText = (markup, text, context) => assert.ok(visibleText(markup).includes(normalize(text)), context + ": " + text.slice(0, 100));

test("all 20 captured profiles render full biography, clinical terms, credentials and source achievement groups", () => {
  assert.equal(capturedDoctorProfiles.length, 20);
  for (const source of capturedDoctorProfiles) {
    const markup = render(source);
    if (source.about?.text.trim()) expectText(markup, source.about.text, source.slug + " full biography");
    for (const value of [source.overview.designation, ...source.overview.qualifications,
      ...source.overview.mainSpecialties, ...source.overview.subSpecialties, ...(source.treatments?.items ?? [])].filter(value => value.trim())) {
      expectText(markup, value, source.slug + " supplied field");
    }
    for (const group of source.achievements?.groups ?? []) {
      if (!group.items.length) continue;
      expectText(markup, group.title, source.slug + " original achievement heading");
      for (const item of group.items) {
        expectText(markup, item.text, source.slug + " complete citation/item");
        if (item.link) assert.ok(markup.includes(`href="${item.link.replaceAll("&", "&amp;")}"`), source.slug + " citation link");
      }
    }
    for (const section of source.additionalSections) {
      for (const paragraph of section.paragraphs) expectText(markup, paragraph, source.slug + " extra paragraph");
      for (const item of section.items ?? []) expectText(markup, item.text, source.slug + " extra item");
    }
  }
});

test("navigation matches every rendered chapter, uses unique anchors, and targets labelled sections", () => {
  for (const source of [...capturedDoctorProfiles, masterProfile]) {
    const markup = render(source);
    const ids = renderedSections(markup);
    assert.deepEqual(getSourceContentSections(source).map(([id]) => id), ids, source.slug);
    assert.ok(ids.length <= 3, source.slug + " optional fields must stay inside the three content groups");
    assert.ok(ids.every(id => ["profile-overview", "profile-expertise", "profile-background"].includes(id)));
    assert.equal(new Set(ids).size, ids.length, source.slug + " duplicate section IDs");
    const allIds = [...markup.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(allIds).size, allIds.length, source.slug + " duplicate nested anchors");
    for (const match of markup.matchAll(/<section\b[^>]*\baria-labelledby="([^"]+)"/g)) {
      assert.ok(markup.includes(`id="${match[1]}"`), source.slug + " missing labelled heading");
    }
  }
});

const empty = {
  ...capturedDoctorProfiles[0],
  overview: { ...capturedDoctorProfiles[0].overview, designation: "", qualifications: [], mainSpecialties: [], subSpecialties: [] },
  about: null, treatments: null, achievements: null, additionalSections: [],
};

test("missing and whitespace-only clinical content creates neither empty sections nor navigation", () => {
  assert.equal(render(empty), "");
  assert.deepEqual(getSourceContentSections(empty), []);
  const whitespace = { ...empty, about: { title: "About", text: " \n &nbsp; " },
    treatments: { title: "Treatments", items: ["", " \n"] },
    achievements: { title: "Recognition", groups: [{ title: "Empty heading", items: [{ text: " " }] }] },
    additionalSections: [{ id: "empty", title: "Future section", paragraphs: [" \n"] }],
  };
  assert.equal(render(whitespace), "");
  assert.deepEqual(getSourceContentSections(whitespace), []);
  const roleOnly = { ...empty, overview: { ...empty.overview, designation: "Medical Superintendent" } };
  assert.deepEqual(getSourceContentSections(roleOnly), [["profile-background", "Background"]]);
  expectText(render(roleOnly), "Medical Superintendent", "role retained without qualifications");
});

test("long lists and unknown titled sections remain complete, ordered and safely rendered", () => {
  const treatments = Array.from({ length: 120 }, (_, index) => `Clinical item ${String(index + 1).padStart(3, "0")} — retained source detail`);
  const source = { ...empty,
    overview: { ...empty.overview, qualifications: ["Fellowship (Hip, Knee & Shoulder)", "Diploma (2020)", "Diploma (2021)"] },
    treatments: { title: "Treatments &amp; procedures", items: treatments },
    achievements: { title: "Achievements", groups: [{ title: "Memberships &amp; recognition", items: [{ text: "A full citation, with date and journal detail", link: "https://doi.org/10.123/example" }] }] },
    additionalSections: [
      { id: "duplicate", title: "Research &amp; teaching", paragraphs: ["Original heading\nThe complete source explanation.", "&lt;script&gt;alert(1)&lt;/script&gt;"], items: [{ text: "Unsafe link is still readable", link: "javascript:alert(1)" }] },
      { id: "duplicate", title: "Another supplied heading", paragraphs: ["Second section remains independently addressable."] },
    ],
  };
  const markup = render(source);
  const text = visibleText(markup);
  for (const item of treatments) expectText(markup, item, "long treatment list");
  assert.ok(text.indexOf(treatments[0]) < text.indexOf(treatments[119]));
  assert.match(markup, /<details/);
  assert.ok(text.includes("Treatments & procedures") && text.includes("Memberships & recognition"));
  assert.ok(!markup.includes("<script>") && !markup.includes('href="javascript:'));
  assert.ok(text.includes("<script>alert(1)</script>"));
  assert.match(markup, /href="https:\/\/doi\.org\/10\.123\/example" target="_blank" rel="noopener noreferrer"/);
  const ids = renderedSections(markup);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(getSourceContentSections(source).map(([id]) => id), ids);
  const credentials = markup.match(/<ul class="credentials"[\s\S]*?<\/ul>/)?.[0] ?? "";
  assert.equal((credentials.match(/<li>/g) ?? []).length, 3, "every distinct qualification appears exactly once in its list");
});

test("master retains every optional source category within three chapters without borrowing real clinician claims", () => {
  const markup = render(masterProfile);
  for (const item of masterProfile.treatments.items) expectText(markup, item, "master treatments");
  for (const group of masterProfile.achievements.groups) {
    expectText(markup, group.title, "master group");
    for (const item of group.items) expectText(markup, item.text, "master item");
  }
  for (const section of masterProfile.additionalSections) expectText(markup, section.title, "master optional section");
  assert.ok(visibleText(markup).includes("fictional clinician"));
  assert.equal(renderedSections(markup).length, 3);
});

test("independently placed chapters preserve all content once and share navigation presence rules", () => {
  const groups = ["overview", "expertise", "background"];
  for (const source of [...capturedDoctorProfiles, masterProfile, empty]) {
    const combined = groups.map(section => render(source, section)).join("");
    assert.equal(visibleText(combined), visibleText(render(source)), source.slug + " split rendering loses or duplicates content");
    assert.deepEqual(renderedSections(combined), getSourceContentSections(source).map(([id]) => id));
    groups.forEach(section => {
      const markup = render(source, section);
      const ids = renderedSections(markup);
      assert.ok(ids.length <= 1 && ids.every(id => id === `profile-${section}`), source.slug + " group renders unrelated chapters");
    });
  }
});

test("future clinical and professional content remains discoverable without growing the top-level navigation", () => {
  const source = { ...empty, additionalSections: [
    { id: "conditions", title: "Conditions treated", paragraphs: ["A supplied clinical overview."], items: [{ text: "A complete clinical term." }] },
    { id: "future", title: "New source category", paragraphs: ["A future source paragraph."], items: [{ text: "A future published item." }] },
  ] };
  const markup = render(source);
  for (const section of source.additionalSections) {
    expectText(markup, section.title, "retained supplied heading");
    section.paragraphs.forEach(paragraph => expectText(markup, paragraph, "retained supplied paragraph"));
    section.items.forEach(item => expectText(markup, item.text, "retained supplied item"));
  }
  assert.ok(getSourceContentSections(source).length <= 3);
  assert.equal(visibleText(["overview", "expertise", "background"].map(section => render(source, section)).join("")), visibleText(markup));
});
