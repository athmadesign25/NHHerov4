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


const { getDoctorProfileContent } = await import("../src/features/search/doctorProfileContent.ts");
const { getDoctorProfilePreviewContent } = await import("../src/features/search/doctorProfilePreview.ts");
const { design20Directory, getDesign20DirectoryDoctor } = await import("../src/features/search/design20Directory.ts");

test("every directory doctor has complete preview text sections and marked samples", () => {
  assert.ok(design20Directory.length > 100);
  for (const doctor of design20Directory) {
    const content = getDoctorProfilePreviewContent(doctor);
    assert.ok(content.editorial.summary.length, doctor.id + " summary");
    for (const field of ["expertise", "qualifications", "treatments", "publications", "articles", "faqs"]) {
      assert.ok(content[field].length, doctor.id + " " + field);
    }
    for (const field of ["education", "clinicalExperience", "awards", "memberships"]) {
      assert.ok(content.editorial[field].length, doctor.id + " " + field);
    }
    assert.ok(content.hospitals.length, doctor.id + " locations");
    assert.ok(content.displayExperience && content.displayLanguages.length, doctor.id + " hero facts");
    assert.ok(content.hasClinicalDetails && content.hasBackground && content.hasResearch);
    assert.equal(content.hasSampleContent, content.sampleFields.length > 0);
    assert.equal(new Set(content.sampleFields).size, content.sampleFields.length);
  }
  console.log(`Preview structure covered ${design20Directory.length} doctors.`);
});

test("preview preserves verified values and does not mutate source or directory records", () => {
  for (const doctor of design20Directory) {
    const beforeDoctor = JSON.stringify(doctor);
    const verified = getDoctorProfileContent(doctor);
    const beforeContent = JSON.stringify(verified);
    const preview = getDoctorProfilePreviewContent(doctor);
    for (const field of ["qualifications", "expertise", "treatments", "publications", "articles"]) {
      if (verified[field].length) {
        assert.deepEqual(preview[field], verified[field], doctor.id + " " + field);
        assert.ok(!preview.sampleFields.includes(field));
      } else assert.ok(preview.sampleFields.includes(field));
    }
    for (const field of ["summary", "education", "clinicalExperience", "awards", "memberships"]) {
      if (verified.editorial?.[field]?.length) {
        assert.deepEqual(preview.editorial[field], verified.editorial[field], doctor.id + " " + field);
        assert.ok(!preview.sampleFields.includes(field));
      } else assert.ok(preview.sampleFields.includes(field));
    }
    assert.deepEqual(preview.faqs.slice(0, verified.faqs.length), verified.faqs);
    assert.equal(preview.verifiedExperience, verified.verifiedExperience);
    assert.equal(JSON.stringify(doctor), beforeDoctor);
    assert.equal(JSON.stringify(getDoctorProfileContent(doctor)), beforeContent);
  }
});

test("sample recognition and research are visibly illustrative and never acquire fabricated links", () => {
  const doctor = getDesign20DirectoryDoctor("dr-ashley");
  const preview = getDoctorProfilePreviewContent(doctor);
  assert.ok(preview.sampleFields.includes("awards"));
  assert.ok(preview.editorial.awards.every(item => item.title.startsWith("Sample ")));
  assert.ok(preview.editorial.memberships.every(item => item.startsWith("Sample ")));
  assert.ok(preview.publications.every(item => item.title.startsWith("Sample ") && !item.url));
  assert.ok(preview.articles.every(item => item.title.startsWith("Sample ") && item.url === ""));
  assert.ok(preview.sampleSections.includes("research"));
  assert.equal(getDoctorProfileContent(doctor).hasResearch, false);
});

test("sample generation is stable, handles sparse data, and does not contaminate clinical FAQs", () => {
  const original = getDesign20DirectoryDoctor("dr-ashley");
  const sparse = { ...original, id: "preview-missing", degrees: "", expertise: [], experience: "", languages: [] };
  const preview = getDoctorProfilePreviewContent(sparse);
  assert.deepEqual(getDoctorProfilePreviewContent(sparse), preview);
  assert.ok(preview.sampleFields.includes("qualifications"));
  assert.ok(preview.sampleFields.includes("experience"));
  assert.ok(preview.sampleFields.includes("languages"));
  assert.equal(preview.verifiedExperience, null);
  assert.ok(preview.faqs.every(item => !/Sample |years in practice|years experience/.test(item.answer)));
  assert.equal(getDoctorProfileContent(sparse).editorial, undefined);
});
