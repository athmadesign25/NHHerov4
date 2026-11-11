import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/features/health-checkups/healthDiscovery.ts", import.meta.url), "utf8");
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { matchesHealthQuery, healthComparisonFacts, healthListingHeading } = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
const packageItem = { name: "Male Health Check-Up", description: "Annual screening", inclusions: ["Complete Blood Count (CBC)", "Liver function"], preparation: "", reportTime: "", kind: "package" };
const labTest = { name: "Complete Blood Count", description: "CBC", inclusions: [], preparation: "", reportTime: "", kind: "test" };

test("discovery heading reflects only the confirmed centre and current service scope", () => {
  assert.equal(healthListingHeading(undefined, "package"), "Health checkups & tests");
  assert.equal(healthListingHeading("  ", "test"), "Health checkups & tests");
  assert.equal(healthListingHeading("Bangalore", "package"), "Health packages in Bangalore");
  assert.equal(healthListingHeading("Bangalore", "test"), "Lab tests in Bangalore");
  assert.equal(healthListingHeading("  New   Delhi  "), "Checkups & tests in New Delhi");
});

test("one query finds published coverage and individual tests across both types", () => {
  const matches = [packageItem, labTest].filter(item => matchesHealthQuery(item, " cBc "));
  assert.equal(matches.length, 2);
  assert.ok(matchesHealthQuery(packageItem, "check up male"));
  assert.ok(matchesHealthQuery(labTest, "blood cou"));
  assert.equal(matchesHealthQuery(labTest, "blood liver"), false);
});
test("search does not confuse male with female or invent medical aliases", () => {
  assert.equal(matchesHealthQuery({ ...packageItem, name: "Female Health Check-Up" }, "male"), false);
  assert.equal(matchesHealthQuery(labTest, "anaemia"), false);
  assert.equal(matchesHealthQuery(packageItem, ""), true);
});
test("missing comparison facts remain unknown, never excluded or zero", () => {
  const facts = healthComparisonFacts(labTest);
  assert.equal(facts["Coverage highlights"], "Not listed");
  assert.equal(facts.Preparation, "Not listed");
  assert.equal(facts["Report availability"], "Not listed");
  assert.equal(healthComparisonFacts(packageItem)["Coverage highlights"], "Complete Blood Count (CBC) · Liver function");
});
