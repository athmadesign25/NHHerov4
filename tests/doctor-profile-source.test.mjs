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

const { capturedDoctorProfiles, getCapturedDoctorProfile, getCapturedDoctorProfileBySlug, capturedProfileToDoctor, safeDoctorProfileLink, extractAdditionalProfileSections } = await import("../src/features/search/doctorProfileSource.ts");
const { masterDoctor, masterProfile } = await import("../src/features/search/doctorProfileMaster.ts");
const { design20Directory } = await import("../src/features/search/design20Directory.ts");
const archive = path.join(root, "docs/doctor-profile-census");
const manifest = JSON.parse(readFileSync(path.join(archive, "manifest.json"), "utf8"));
const sourceFor = profile => JSON.parse(readFileSync(path.join(archive, "source-profiles", profile.slug + ".json"), "utf8"));
const block = (source, key) => !Array.isArray(source[key]) && source[key] ? source[key] : {};

test("census covers exactly four source-listed doctors in each of five specialties", () => {
  assert.equal(capturedDoctorProfiles.length, 20);
  assert.equal(new Set(capturedDoctorProfiles.map(profile => profile.slug)).size, 20);
  const categories = new Map();
  for (const row of manifest.profiles) {
    categories.set(row.category, (categories.get(row.category) ?? 0) + 1);
    assert.equal(row.status, 200);
    assert.equal(row.listingVerification.nameMatched, true);
    const profile = getCapturedDoctorProfileBySlug(row.slug);
    assert.equal(profile.name, row.name);
    assert.equal(profile.sourceUrl, row.url);
    assert.equal(profile.sourceId, row.listingVerification.listingId);
  }
  assert.equal(categories.size, 5);
  assert.ok([...categories.values()].every(count => count === 4));
});

test("full biography, qualifications, expertise, treatment tags and achievement groups retain source text and order", () => {
  for (const profile of capturedDoctorProfiles) {
    const source = sourceFor(profile); const overview = source.doctorOverview;
    assert.equal(profile.name, overview.name);
    assert.equal(profile.overview.designation, overview.designation);
    assert.deepEqual(profile.overview.qualifications, overview.qualification.value);
    assert.deepEqual(profile.overview.mainSpecialties, overview.specialties.mainSpecialtiy);
    assert.deepEqual(profile.overview.subSpecialties, overview.specialties.subSpecialties);
    assert.deepEqual(profile.overview.locations, overview.locations.value.map(({ name, id, code }) => ({ name, id, code })));
    assert.equal(profile.overview.experience ?? "", overview.experience);
    const about = block(source, "doctorAbout");
    assert.equal(profile.about?.text ?? "", about.full_description ?? "");
    if (profile.about) assert.equal(profile.about.title, about.title);
    assert.deepEqual(profile.treatments?.items ?? [], block(source, "doctorTreatments").list ?? []);
    const groups = block(source, "doctorAchivements").list ?? [];
    assert.deepEqual(profile.achievements?.groups ?? [], groups.map(group => ({ title: group.title,
      items: group.items.map(item => ({ text: item.text, ...(item.link ? { link: item.link } : {}) })),
    })));
    assert.ok(!("rating" in profile.overview) && !("reviews" in profile.overview));
  }
  const arun = getCapturedDoctorProfileBySlug("dr-arunkumar-ullegaddi");
  assert.ok(arun.about.text.includes("Rare/ Unique Skills") && arun.about.text.includes("Key Procedures Performed"));
  const nidhi = getCapturedDoctorProfileBySlug("dr-nidhi-tandon");
  assert.ok(nidhi.achievements.groups[0].items.some(item => item.text === "Editorial Contributions:"));
  assert.equal(getCapturedDoctorProfileBySlug("dr-aditi-singhvi").treatments.items.length, 42);
});

test("all26 videos and27 blogs preserve actual speaker, author, links, dates and available local imagery", () => {
  let videos = 0; let blogs = 0; let portraits = 0;
  for (const profile of capturedDoctorProfiles) {
    const source = sourceFor(profile);
    const sourceVideos = block(source, "doctorVideos").list ?? [];
    assert.equal(profile.videos?.items.length ?? 0, sourceVideos.length);
    for (const [index, item] of (profile.videos?.items ?? []).entries()) {
      const original = sourceVideos[index]; videos += 1;
      assert.equal(item.title, original.subtitle); assert.equal(item.url, original.vdo_link);
      assert.equal(item.speaker, original.name); assert.equal(item.location, original.location);
      assert.ok(existsSync(path.join(root, "public", item.thumbnail)));
    }
    const sourceBlogs = block(source, "doctorBlogs").items ?? [];
    assert.equal(profile.blogs?.items.length ?? 0, sourceBlogs.length);
    for (const [index, item] of (profile.blogs?.items ?? []).entries()) {
      const original = sourceBlogs[index]; blogs += 1;
      assert.equal(item.title, original.title); assert.equal(item.url, "https://www.narayanahealth.org/blog/" + original.slug);
      assert.equal(item.author, original.author); assert.equal(item.date ?? null, original.date ?? null);
      assert.equal(item.alt, original.imgAlt); assert.equal(item.category, original.category);
      assert.equal(Boolean(item.thumbnail), Boolean(original.image));
      if (item.thumbnail) assert.ok(existsSync(path.join(root, "public", item.thumbnail)));
    }
    if (profile.overview.image) { portraits += 1; assert.ok(existsSync(path.join(root, "public", profile.overview.image))); }
  }
  assert.equal(videos, 26); assert.equal(blogs, 27); assert.equal(portraits, 18);
  const undated = getCapturedDoctorProfileBySlug("dr-gopal-krishna-dash").blogs.items[0];
  assert.equal(undated.date, undefined); assert.equal(undated.thumbnail, undefined);
});

test("sparse profiles remain empty-safe and fallback routes introduce no booking facts", () => {
  const sparse = getCapturedDoctorProfileBySlug("dr-akshay-shetty-t");
  assert.equal(sparse.about, null); assert.equal(sparse.achievements, null);
  assert.equal(sparse.treatments, null); assert.equal(sparse.videos, null); assert.equal(sparse.blogs, null);
  assert.equal(sparse.overview.image, ""); assert.deepEqual(sparse.faqs, []);
  const doctor = capturedProfileToDoctor(sparse);
  assert.equal(doctor.name, sparse.name); assert.equal(doctor.profileSlug, sparse.slug);
  assert.equal(doctor.fee, ""); assert.equal(doctor.experience, ""); assert.deepEqual(doctor.availability, {});
  assert.deepEqual(doctor.modes, { hospital: null, video: null });
  assert.equal(doctor.rating, 0); assert.equal(doctor.reviews, 0); assert.equal(doctor.languages, undefined);
  assert.deepEqual(getCapturedDoctorProfileBySlug("dr-aditya-h-kumar").overview.languages, ["English", "Kannada", "Hindi", "Tamil"]);
});

test("lookup binds content to the correct doctor and does not reuse a same-name foreign-city profile", () => {
  const profile = getCapturedDoctorProfileBySlug("dr-aditi-singhvi");
  const doctor = capturedProfileToDoctor(profile);
  assert.equal(getCapturedDoctorProfile(doctor), profile);
  assert.equal(getCapturedDoctorProfileBySlug("d20-dr-aditi-singhvi"), profile);
  assert.equal(getCapturedDoctorProfile({ ...doctor, name: "Dr. Another Person" }), null);
  assert.equal(getCapturedDoctorProfile({ ...doctor, id: "unrelated", profileSlug: undefined, city: "Mumbai" }), null);
  assert.equal(getCapturedDoctorProfileBySlug("not-a-doctor"), null);
  const matched = capturedDoctorProfiles.filter(item => design20Directory.some(doctor => getCapturedDoctorProfile(doctor)?.slug === item.slug));
  console.log(`Current directory matches ${matched.length}/20 captured profiles.`);
  console.log("Captured-only routes:", capturedDoctorProfiles.filter(item => !matched.includes(item)).map(item => item.slug).join(", "));
});

test("future doctor content keeps titled sections while executable links and configuration are excluded", () => {
  const sections = extractAdditionalProfileSections({
    doctorNews: { title: "News & media", description: "Published paragraph.", items: [{ text: "Named article", link: "https://www.narayanahealth.org/blog/example" }, { text: "Unsafe link remains plain text", link: "javascript:alert(1)" }] },
    doctorTraining: { title: "Advanced training", list: ["One source entry", "Another entry"] },
    doctorSeo: { title: "SEO configuration", description: "Do not display" },
    meta: { title: "Metadata", text: "Do not display" },
    doctorUnknown: { title: "An empty future section" },
    doctorAbout: { title: "About", full_description: "Already handled" },
  });
  assert.deepEqual(sections.map(section => section.title), ["News & media", "Advanced training"]);
  assert.equal(sections[0].items[1].link, undefined);
  assert.equal(sections[0].items[1].text, "Unsafe link remains plain text");
  assert.deepEqual(sections[1].items.map(item => item.text), ["One source entry", "Another entry"]);
  for (const invalid of ["javascript:alert(1)", "data:text/html,x", "//bad.example", "/assets/../private", "https://user:secret@example.com", "https://example.com\nattack", null, ""]) assert.equal(safeDoctorProfileLink(invalid), undefined);
  assert.equal(safeDoctorProfileLink("https://doi.org/10.3390/jcm8101720"), "https://doi.org/10.3390/jcm8101720");
  assert.equal(safeDoctorProfileLink("/assets/doctor-profile-source/example.webp"), "/assets/doctor-profile-source/example.webp");
});

test("master is explicitly fictional, comprehensive and does not claim real media authorship", () => {
  assert.equal(masterDoctor.name, "Dr. Aarav Mehta"); assert.equal(masterProfile.isSample, true);
  assert.equal(masterDoctor.img, ""); assert.equal(masterProfile.sourceUrl, "");
  assert.equal(masterDoctor.fee, ""); assert.deepEqual(masterDoctor.modes, { hospital: null, video: null });
  assert.ok(masterProfile.overview.qualifications.every(item => item.startsWith("Sample ")));
  assert.equal(masterProfile.treatments.items.length, 44); assert.equal(masterProfile.videos.items.length, 7);
  assert.equal(masterProfile.blogs.items.length, 5); assert.ok(masterProfile.faqs.length >= 5);
  assert.ok(masterProfile.additionalSections.some(section => section.title === "News & media"));
  assert.ok(masterProfile.additionalSections.some(section => section.title === "Clinical trials"));
  assert.ok(masterProfile.videos.items.every(item => item.speaker && item.speaker !== masterDoctor.name));
  assert.ok(masterProfile.blogs.items.every(item => item.author && item.author !== masterDoctor.name));
  assert.ok(!capturedDoctorProfiles.some(profile => profile.name === masterDoctor.name));
});
