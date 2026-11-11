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

const { design20Directory, getDesign20ProfileDoctor } = await import("../src/features/search/design20Directory.ts");
const { doctorNameSlug, doctorProfilePath, doctorProfileSlug, doctorProfileQuery, withDoctorProfileSlugs } = await import("../src/features/search/doctorProfileUrl.ts");
const { design17ProfileUrl } = await import("../src/features/search/design17Profile.ts");
const { getDoctorProfileMetadata } = await import("../src/features/search/doctorProfileMetadata.ts");

test("all directory profiles have unique readable URLs resolving to the same doctor", () => {
  const paths = design20Directory.map(doctorProfilePath);
  assert.equal(new Set(paths).size, design20Directory.length);
  for (const doctor of design20Directory) {
    assert.match(doctorProfileSlug(doctor), /^dr-[a-z0-9-]+$/);
    assert.equal(getDesign20ProfileDoctor(doctorProfileSlug(doctor), new URLSearchParams()).id, doctor.id);
  }
});

test("names with punctuation and accents form safe profile paths", () => {
  assert.equal(doctorNameSlug("Dr. Ashley Lucien Joseph D’Cruz"), "dr-ashley-lucien-joseph-d-cruz");
  assert.equal(doctorNameSlug("Dr. José Rao (preview)"), "dr-jose-rao");
  assert.equal(doctorNameSlug("Dr. S / P \"Rao\""), "dr-s-p-rao");
});

test("homonyms retain separate stable paths irrespective of directory ordering", () => {
  const doctors = [{ id: "a", name: "Dr. A Rao", city: "Bangalore" }, { id: "b", name: "Dr. A Rao", city: "Mumbai" }, { id: "c", name: "Dr. A Rao", city: "Mumbai" }];
  const forward = withDoctorProfileSlugs(doctors);
  const backward = withDoctorProfileSlugs([...doctors].reverse());
  assert.equal(new Set(forward.map(doctorProfilePath)).size, 3);
  for (const doctor of forward) assert.equal(doctor.profileSlug, backward.find(item => item.id === doctor.id).profileSlug);
  assert.equal(forward[0].profileSlug, "dr-a-rao-bangalore");
});

test("profile links and legacy resolution retain the hospital, date, mode and booking return", () => {
  const doctor = design20Directory.find(item => item.id === "dr-ashley");
  const hospital = doctor.hospitals[1];
  const selected = getDesign20ProfileDoctor(doctor.id, new URLSearchParams({ hospital }));
  const returnTo = "/search/doctors?design=d21&location=Bangalore&specialties=Paediatric+Surgery";
  const url = new URL(design17ProfileUrl(selected, "hospital", "2026-11-06", false, "d21", returnTo), "https://nh.local");
  assert.equal(url.pathname, "/doctors/dr-ashley-lucien-joseph-d-cruz");
  assert.equal(url.searchParams.get("hospital"), hospital);
  assert.equal(url.searchParams.get("date"), "2026-11-06");
  assert.equal(url.searchParams.get("returnTo"), returnTo);
  const restored = getDesign20ProfileDoctor(url.pathname.split("/").pop(), url.searchParams);
  assert.equal(restored.id, doctor.id);
  assert.equal(restored.hospital, hospital);
  assert.deepEqual(getDesign20ProfileDoctor(doctor.id, url.searchParams), restored);
});

test("canonical redirect queries retain repeated filters and booking resume state", () => {
  const query = doctorProfileQuery({ booking: "dr-1", bookingResume: "1", mode: "video", specialties: ["A", "B"], returnTo: "/search/doctors?design=d21", omitted: undefined });
  assert.deepEqual(query.getAll("specialties"), ["A", "B"]);
  assert.equal(query.get("bookingResume"), "1");
  assert.equal(query.has("omitted"), false);
});

test("metadata is unique, query-free and does not promote preview experience or fees", () => {
  const doctor = design20Directory.find(item => item.id === "dr-1");
  const metadata = getDoctorProfileMetadata(doctor);
  assert.match(metadata.title, /Devi Prasad Shetty/);
  assert.ok(metadata.alternates.canonical.endsWith("/doctors/dr-devi-prasad-shetty"));
  assert.equal(metadata.alternates.canonical.includes("?"), false);
  assert.equal(metadata.description.includes(doctor.experience), false);
  assert.equal(metadata.description.includes(doctor.fee), false);
  assert.equal(metadata.robots.index, false);
  assert.equal(getDoctorProfileMetadata(null).robots.index, false);
});
