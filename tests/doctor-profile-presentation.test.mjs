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
    if (url.startsWith(pathToFileURL(root).href) && url.endsWith(".json") && !url.includes("/node_modules/")) {
      return { format: "module", shortCircuit: true, source: "export default " + readFileSync(fileURLToPath(url), "utf8") + ";" };
    }
    if (url.startsWith(pathToFileURL(root).href) && url.endsWith(".ts") && !url.includes("/node_modules/")) {
      return { format: "module", shortCircuit: true, source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText };
    }
    return nextLoad(url, context);
  },
});

const { capturedDoctorProfiles, capturedProfileToDoctor, getCapturedDoctorProfileBySlug } = await import("../src/features/search/doctorProfileSource.ts");
const { getDoctorProfilePresentation, youtubeId } = await import("../src/features/search/doctorProfilePresentation.ts");
const { masterDoctor, masterProfile } = await import("../src/features/search/doctorProfileMaster.ts");
const { getDesign20DirectoryDoctor, getDesign20BookingDoctor, getDesign20ProfileDoctor } = await import("../src/features/search/design20Directory.ts");
const { design20RequestedSelection } = await import("../src/features/booking/design20/model.ts");

test("sparse live profiles do not inherit fabricated history, media or experience", () => {
  const source = getCapturedDoctorProfileBySlug("dr-arun-b-s");
  const result = getDoctorProfilePresentation({ ...capturedProfileToDoctor(source), experience: "99 years experience", languages: ["Invented language"] }, source);
  assert.equal(result.content.displayExperience, "");
  assert.deepEqual(result.content.displayLanguages, []);
  assert.deepEqual(result.content.sampleFields, []);
  assert.deepEqual(result.content.articles, []);
  assert.equal(result.content.hasSampleContent, false);
  assert.equal(result.media.kind, "speciality");
  assert.ok(result.media.videos.every(video => video.speaker !== source.name));
});

test("published profiles preserve complete clinical and media lists in the presentation model", () => {
  for (const source of capturedDoctorProfiles) {
    const doctor = getDesign20DirectoryDoctor(source.slug) ?? capturedProfileToDoctor(source);
    const result = getDoctorProfilePresentation(doctor, source);
    assert.deepEqual(result.content.qualifications, source.overview.qualifications);
    assert.deepEqual(result.content.treatments, source.treatments?.items ?? []);
    assert.deepEqual(result.content.articles, source.blogs?.items ?? []);
    if (source.videos?.items.length) {
      assert.equal(result.media.videos.length + result.linkedVideos.length, source.videos.items.length);
      assert.equal(result.media.kind, "doctor");
    }
  }
});

test("every published hospital remains selected through slot entry and booking summary lookup", () => {
  let checked = 0;
  for (const source of capturedDoctorProfiles) {
    const doctor = getDesign20DirectoryDoctor(source.slug);
    if (!doctor) continue;
    const booking = getDesign20BookingDoctor(doctor.id);
    for (const location of source.overview.locations) {
      const query = new URLSearchParams({ hospital: location.name, mode: "hospital" });
      assert.ok(booking.locations.some(item => item.name === location.name));
      assert.equal(design20RequestedSelection(booking, query).hospital, location.name);
      assert.equal(getDesign20ProfileDoctor(doctor.id, query).hospital, location.name);
      checked++;
    }
  }
  assert.ok(checked >= 20);
});

test("the master keeps real media attribution and fictional clinical content separate", () => {
  const result = getDoctorProfilePresentation(masterDoctor, masterProfile);
  assert.equal(result.content.hasSampleContent, true);
  assert.equal(result.media.kind, "speciality");
  assert.ok(result.media.videos.every(video => video.speaker !== masterDoctor.name && !video.doctorIds.length));
  assert.ok(result.content.articles.every(article => article.author !== masterDoctor.name));
});

test("profile portraits prefer supplied NH imagery and never promote illustrative avatars", () => {
  const source = getCapturedDoctorProfileBySlug("dr-aditi-singhvi");
  const doctor = capturedProfileToDoctor(source);
  assert.equal(getDoctorProfilePresentation({ ...doctor, img: "/images/misc/doctor_avatar_female_v2.png" }, source).doctor.img, source.overview.image);
  assert.equal(getDoctorProfilePresentation({ ...doctor, img: "/doctors/verified-profile.webp" }, source).doctor.img, source.overview.image);
  const missingPortrait = { ...source, overview: { ...source.overview, image: "" } };
  assert.equal(getDoctorProfilePresentation({ ...doctor, img: "/doctors/verified-profile.webp" }, missingPortrait).doctor.img, "/doctors/verified-profile.webp");
  assert.equal(getDoctorProfilePresentation({ ...doctor, img: "/images/misc/doctor_avatar_female_v2.png" }, missingPortrait).doctor.img, "");
});

test("unsupported video URLs stay accessible without embedding arbitrary origins", () => {
  assert.equal(youtubeId("https://www.youtube.com/embed/XBd2xuiyp3M"), "XBd2xuiyp3M");
  for (const url of ["javascript:alert(1)", "https://youtube.com.attacker.test/embed/XBd2xuiyp3M", "https://example.com/video.mp4"]) assert.equal(youtubeId(url), null);
  const source = { ...masterProfile, videos: { title: "Videos", items: [{ title: "Supplied video", url: "https://www.narayanahealth.org/video/example" }] } };
  const result = getDoctorProfilePresentation(masterDoctor, source);
  assert.equal(result.linkedVideos.length, 1);
});
