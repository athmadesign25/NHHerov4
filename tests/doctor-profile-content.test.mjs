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
const { getDoctorProfileVideos } = await import("../src/features/search/doctorProfileMedia.ts");
const { getDesign20DirectoryDoctor } = await import("../src/features/search/design20Directory.ts");

const ashley = getDesign20DirectoryDoctor("dr-ashley");
const abhinandan = getDesign20DirectoryDoctor("d20-dr-abhinandan-s-punit");

test("profile FAQs retain full supplied qualifications and clinical areas", () => {
  const content = getDoctorProfileContent(ashley);
  assert.ok(content.faqs.some(faq => faq.answer.includes("MS (General Surgery)")));
  assert.ok(content.faqs.some(faq => faq.answer.includes("Paediatric Urology & Kidney Transplant")));
  assert.ok(content.faqs.every(faq => faq.question && faq.answer));
  const grouped = getDoctorProfileContent({ ...ashley, degrees: "MBBS; Fellowship (Hip, Knee & Shoulder); MS" });
  assert.deepEqual(grouped.qualifications, ["MBBS", "Fellowship (Hip, Knee & Shoulder)", "MS"]);
});

test("experience FAQs use verified source values and never preview years", () => {
  for (const doctor of [ashley, getDesign20DirectoryDoctor("dr-1")]) {
    const unknown = getDoctorProfileContent({ ...doctor, experience: "99 years experience" });
    assert.equal(unknown.verifiedExperience, null);
    assert.ok(!unknown.faqs.some(faq => /experience|99/.test(faq.answer)));
  }
  const sourced = getDoctorProfileContent({ ...abhinandan, experience: "99 years experience" });
  assert.equal(sourced.verifiedExperience, "17 years in practice");
  assert.ok(sourced.faqs.some(faq => faq.answer.includes("17 years in practice")));
  assert.ok(sourced.faqs.every(faq => !faq.answer.includes("99")));
});

test("doctor-owned videos take precedence and fallback keeps speaker attribution", () => {
  const own = getDoctorProfileVideos(abhinandan);
  assert.equal(own.kind, "doctor");
  assert.equal(own.videos[0].id, "pgqTchwyNfY");
  const fallback = getDoctorProfileVideos(ashley);
  assert.equal(fallback.kind, "speciality");
  assert.equal(fallback.videos[0].id, "lHW7pZy-iTg");
  assert.ok(!fallback.videos[0].doctorIds.includes(ashley.id));
  assert.ok(fallback.videos[0].speaker.includes("Subhadeep"));
  for (const video of [...own.videos, ...fallback.videos]) {
    assert.ok(existsSync(path.join(root, "public", video.thumbnail)));
  }
});

test("video relevance does not match unrelated compound specialties or invent a fallback", () => {
  assert.equal(getDoctorProfileVideos({ id: "new", speciality: "Paediatric Neurosurgery" }).videos.length, 0);
  assert.equal(getDoctorProfileVideos({ id: "new", speciality: "Dermatology" }).videos.length, 0);
  const overlapping = getDoctorProfileVideos({ id: "new", speciality: "Adult Cardiology, Cardiology" });
  assert.equal(overlapping.videos.length, 2);
  assert.equal(new Set(overlapping.videos.map(video => video.id)).size, 2);
});

test("rich source profiles retain clinical, career and research content without search-tag filler", () => {
  const aditi = getDoctorProfileContent(getDesign20DirectoryDoctor("d20-dr-aditi-singhvi"));
  assert.ok(aditi.treatments.some(item => item.includes("HFpEF")));
  assert.ok(aditi.treatments.some(item => item.includes("LVAD")));
  assert.ok(aditi.treatments.some(item => item.includes("CardioMEMS")));
  assert.ok(aditi.treatments.every(item => !["heart", "Cardiac", "Surgery"].includes(item)));
  assert.ok(aditi.hasClinicalDetails && aditi.hasResearch && aditi.hasBackground);
  assert.ok(aditi.editorial.education.some(item => item.institution.includes("Houston Methodist")));
  assert.ok(aditi.editorial.clinicalExperience.some(item => item.hospital.includes("Mount Sinai")));
  assert.ok(aditi.editorial.memberships.includes("Heart Failure Society of America"));
  assert.ok(aditi.publications.some(item => item.url === "https://doi.org/10.3390/jcm8101720"));
  assert.ok(aditi.articles.some(item => item.url.endsWith("/cardiac-cirrhosis-meaning-causes-symptoms-treatment")));
  assert.equal(new Set(aditi.treatments).size, aditi.treatments.length);
});

test("unknown editorial content remains absent instead of borrowing another doctor's history", () => {
  const noHistory = getDoctorProfileContent({ ...ashley, id: "unverified-doctor", degrees: "" });
  assert.equal(noHistory.editorial, undefined);
  assert.equal(noHistory.hasBackground, false);
  assert.equal(noHistory.hasResearch, false);
  assert.deepEqual(noHistory.treatments, []);
  assert.deepEqual(noHistory.publications, []);
  assert.deepEqual(noHistory.articles, []);
});

test("Abhinandan's official six-video collection and linked articles are preserved", () => {
  const content = getDoctorProfileContent(abhinandan);
  assert.ok(content.treatments.includes("Hip arthroscopy"));
  assert.ok(content.treatments.includes("Rotator cuff repair"));
  assert.ok(content.articles.some(item => item.url.endsWith("/posterior-hip-replacement-vs-direct-anterior-hip-replacement")));
  const media = getDoctorProfileVideos(abhinandan);
  assert.equal(media.kind, "doctor");
  assert.equal(media.videos.length, 6);
  assert.equal(new Set(media.videos.map(video => video.id)).size, 6);
  assert.ok(media.videos.some(video => video.id === "sw2Y3p19gMA"));
  assert.ok(media.videos.every(video => existsSync(path.join(root, "public", video.thumbnail))));
});
