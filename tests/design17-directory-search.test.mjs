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

const { searchDesign17Directory } = await import("../src/features/search/design17DirectorySearch.ts");
const { searchDoctorsData } = await import("../src/app/search/mockDoctors.ts");
const { design3CityDoctors } = await import("../src/features/search/design3CityDoctors.ts");
const { fromDirectoryDoctor, fromApiDoctor } = await import("../src/features/search/doctorListing.ts");
const { getDesign3BookingDoctor } = await import("../src/features/booking/doctors.ts");
const directory = [...searchDoctorsData.map(fromDirectoryDoctor), ...design3CityDoctors];
const shetty = directory.find(doctor => doctor.id === "dr-1");
const ids = doctors => doctors.map(doctor => doctor.id);

test("doctor-name search tolerates case, diacritics, punctuation and repeated whitespace", () => {
  for (const query of ["  DR.   Dévi\tPrasad  SHEṬṬY ", "devi-prasad", "shetty devi", "Shett"]) {
    assert.deepEqual(ids(searchDesign17Directory(directory, query)), [shetty.id], query);
  }
  const accented = { ...shetty, name: "Dr. José Núñez" };
  assert.strictEqual(searchDesign17Directory([accented], "jose nunez")[0], accented);
});

test("all query terms must match across name, speciality, expertise, hospital and city", () => {
  const doctor = { ...shetty, expertise: ["Heart failure"] };
  const query = "shetty cardio heart mazumdar bangalore";
  assert.strictEqual(searchDesign17Directory([doctor], query)[0], doctor);
  assert.deepEqual(searchDesign17Directory([doctor], `${query} neurologist`), []);
  assert.deepEqual(searchDesign17Directory([doctor], "shetty mumbai"), []);
});

test("secondary practice matches preserve the selected hospital, price, slot and object identity", () => {
  const practice = Object.freeze({ hospital: "Secondary Specialist Centre", city: "Kolkata", fee: "₹1,400", availability: Object.freeze({ hospital: "Tomorrow, 11:30 AM" }) });
  const doctor = Object.freeze({ ...shetty, practiceLocations: Object.freeze([practice]) });
  const input = Object.freeze([doctor]);
  const before = JSON.stringify(input);
  const [result] = searchDesign17Directory(input, "specialist kolkata");
  assert.strictEqual(result, doctor);
  assert.strictEqual(result.practiceLocations, doctor.practiceLocations);
  assert.equal(result.hospital, shetty.hospital);
  assert.equal(result.fee, shetty.fee);
  assert.strictEqual(result.availability, shetty.availability);
  assert.equal(JSON.stringify(input), before);
});

test("API records and unknown fixture-like IDs never enter the bookable directory", () => {
  const apiDoctor = fromApiDoctor({ id: 999999, name: shetty.name, speciality: shetty.speciality, hospital: shetty.hospital,
    photo: "", apptEnabled: true, walkinEnabled: false, vcEnabled: true, availability: { hospital: "", video: "" } });
  const unknown = { ...shetty, id: "dr-999999" };
  const input = [apiDoctor, shetty, unknown];
  for (const query of ["", "shetty"]) assert.deepEqual(ids(searchDesign17Directory(input, query)), [shetty.id]);
});

test("blank queries retain directory order and every returned identity resolves in booking", () => {
  const input = Object.freeze([...directory].reverse());
  const results = searchDesign17Directory(input, " \n\t ");
  assert.deepEqual(ids(results), ids(input));
  results.forEach((doctor, index) => {
    assert.strictEqual(doctor, input[index]);
    assert.equal(getDesign3BookingDoctor(doctor.id)?.id, doctor.id);
  });
});

test("unmatched searches stay empty and cannot introduce doctors outside a scoped input", () => {
  const guwahati = directory.filter(doctor => doctor.city === "Guwahati");
  assert.ok(guwahati.length);
  const results = searchDesign17Directory(guwahati, "cardio guwahati");
  assert.ok(results.length);
  assert.ok(results.every(doctor => guwahati.includes(doctor)));
  assert.deepEqual(searchDesign17Directory(guwahati, "shetty"), []);
  assert.deepEqual(searchDesign17Directory(directory, "nonexistent-doctor-name"), []);
});
