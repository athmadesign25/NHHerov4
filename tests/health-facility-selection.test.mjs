import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/features/health-checkups/healthFacilitySelection.ts", import.meta.url), "utf8");
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { healthCityKey, healthCityOptions, healthFacilityServesCity, resolveHealthFacility } = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
const centres = [
  { id: "prestige", name: "Centre one", city: "Bangalore", unitCode: "6024" },
  { id: "second", name: "Centre two", city: " BANGALORE ", unitCode: "3010" },
  { id: "kolkata", name: "Centre three", city: "Kolkata", unitCode: "4040" },
  { id: "delhi", name: "Centre four", city: "New  Delhi", unitCode: "9090" },
];

test("city choices group source spelling case and whitespace while retaining display labels", () => {
  assert.deepEqual(healthCityOptions(centres), [
    { value: "bangalore", label: "Bangalore" },
    { value: "kolkata", label: "Kolkata" },
    { value: "new delhi", label: "New Delhi" },
  ]);
  assert.equal(centres.filter(centre => healthCityKey(centre.city) === "bangalore").length, 2);
  assert.deepEqual(healthCityOptions([]), []);
});

test("hospital entry URLs resolve either stable IDs or source unit codes", () => {
  assert.equal(resolveHealthFacility(centres, "prestige"), centres[0]);
  assert.equal(resolveHealthFacility(centres, "6024"), centres[0]);
  assert.equal(resolveHealthFacility(centres, " 4040 "), centres[2]);
  assert.equal(resolveHealthFacility(centres, "unknown"), undefined);
  assert.equal(resolveHealthFacility(centres, null), undefined);
  assert.equal(resolveHealthFacility(centres, " "), undefined);
});

test("city clusters reuse the same facility records across canonical and service cities", () => {
  const barasat = { id: "1760", name: "Barasat centre", city: "Barasat", unitCode: "1760", serviceCities: ["Kolkata", " BARASAT "] };
  const howrah = { id: "1764", name: "Howrah centre", city: "Howrah", unitCode: "1764", serviceCities: ["Kolkata", "howrah"] };
  const rtiics = { id: "1751", name: "RTIICS", city: "Kolkata", unitCode: "1751" };
  const cluster = [barasat, howrah, rtiics];
  assert.deepEqual(healthCityOptions(cluster), [
    { value: "barasat", label: "Barasat" },
    { value: "howrah", label: "Howrah" },
    { value: "kolkata", label: "Kolkata" },
  ]);
  const fromKolkata = cluster.filter(centre => healthFacilityServesCity(centre, " KOLKATA "));
  assert.deepEqual(fromKolkata.map(centre => centre.id), ["1760", "1764", "1751"]);
  const fromBarasat = cluster.filter(centre => healthFacilityServesCity(centre, "barasat"));
  assert.equal(fromKolkata[0], fromBarasat[0]);
  assert.equal(resolveHealthFacility(cluster, "1760"), fromBarasat[0]);
  assert.equal(healthFacilityServesCity(howrah, "Bangalore"), false);
  assert.equal(healthFacilityServesCity(howrah, ""), false);
  // Cart identity is the unit ID; changing the search city never creates a clone.
  const selectedFacilityId = fromKolkata[0].id;
  assert.equal(fromBarasat[0].id, selectedFacilityId);
});

test("official cities remain selectable even when their catalogue has no centres", () => {
  const official = [{ label: "Bangalore" }, { label: "Kolar" }, { label: "Davangere" }, { label: " KOLAR " }];
  const options = healthCityOptions(centres, official);
  assert.ok(options.some(city => city.value === "kolar"));
  assert.ok(options.some(city => city.value === "davangere"));
  assert.equal(options.filter(city => city.value === "kolar").length, 1);
  assert.equal(options.find(city => city.value === "bangalore").label, "Bangalore");
  assert.deepEqual(centres.filter(centre => healthFacilityServesCity(centre, "kolar")), []);
  assert.equal(centres[0].id, "prestige");
});

test("every captured official city is included without inventing facility records", () => {
  const official = JSON.parse(readFileSync(new URL("../src/data/health-checkups/cities.json", import.meta.url), "utf8"));
  const options = healthCityOptions([], official);
  assert.equal(options.length, new Set(official.map(city => healthCityKey(city.label))).size);
  for (const city of official) assert.ok(options.some(option => option.value === healthCityKey(city.label)));
});
