import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/features/health-checkups/normalizeHealthDetails.ts", import.meta.url), "utf8");
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { normalizeHealthDetails, healthSourceText } = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);

test("source instruction headings and nested descriptions survive normalization", () => {
  const result = normalizeHealthDetails({ healthData: { cmsInfo: { data: [{
    AboutTheTest: "<p>First paragraph</p><p>Second paragraph</p>",
    SampleRequired: [{ Description: "Blood" }, { Description: "Urine" }],
    HealthCheckupInstruction: { Title: "Instructions", Description: "Instructions", InstructionList: [
      { Title: "Reporting time", DescriptionList: [{ Title: "Morning visit", Description: "Arrive before your appointment." }] },
      { Title: "Medicines", Description: "Bring your prescription.", DescriptionList: [{ Description: "Speak to your clinician." }] },
    ] },
  }] } } });
  assert.deepEqual(result.about, ["First paragraph", "Second paragraph"]);
  assert.deepEqual(result.sampleRequired, ["Blood", "Urine"]);
  assert.equal(result.instructionGroups.length, 2);
  assert.deepEqual(result.instructionGroups[0], { title: "Reporting time", paragraphs: [], items: ["Morning visit: Arrive before your appointment."] });
  assert.deepEqual(result.instructions, ["Morning visit: Arrive before your appointment.", "Bring your prescription.", "Speak to your clinician."]);
});

test("highlight tests and detailed profile parameters remain distinct, with descriptions", () => {
  const result = normalizeHealthDetails({ TestHighlights: [{ Title: "Heart health", Description: "A source description", TestList: [{ Title: "Lipid profile", Description: "Blood lipids" }, { Title: "ECG" }] }], profile_tests: [{ Name: "ECG", TestList: [] }, { Name: "Lipid profile", TestList: [{ Title: "HDL", Description: "A parameter description" }] }, { Name: "Another source test", TestList: [] }] });
  assert.equal(result.testGroups[0].itemLabel, "tests");
  assert.equal(result.testGroups[0].parameterDetails[0].description, "Blood lipids");
  assert.equal(result.profileTestGroups.length, 2);
  assert.equal(result.profileTestGroups[0].itemLabel, "parameters");
  assert.equal(result.profileTestGroups[0].parameterDetails[0].description, "A parameter description");
});

test("sparse data omits unsupported sections and never creates clinical claims", () => {
  assert.deepEqual(normalizeHealthDetails({}), { about: [], sampleRequired: [], testGroups: [], instructions: [] });
  const result = normalizeHealthDetails({ Subtitle: "A source age description", KeyFeatures: [{ Description: "Source benefit" }], UnitDescription: "Source centre information", BasicToDo: { Title: "Preparation", DescriptionList: [{ Description: "Source preparation note" }] } });
  assert.equal(result.subtitle, "A source age description");
  assert.equal(result.audience, undefined);
  assert.equal(result.benefits[0].description, "Source benefit");
  assert.equal(result.sections.length, 2);
});

test("plain text conversion safely retains useful source text and entities", () => {
  assert.equal(healthSourceText('<p>Blood &amp; urine</p><script>bad()</script><p>Visit<br>instructions &#8377;100</p>'), "Blood & urine\nVisit\ninstructions ₹100");
  assert.equal(healthSourceText(null), "");
});


test("captured live Male Enhanced package preserves every source group and instruction", () => {
  const records = JSON.parse(readFileSync(new URL("../src/data/health-checkups/source-details.json", import.meta.url), "utf8"));
  const captured = records.find(entry => entry.sourceUrl.includes("PKG037822"));
  assert.ok(captured, "The verified public source fixture must remain available");
  const raw = captured.detailsData.healthData.cmsInfo.data[0];
  const normalized = normalizeHealthDetails(captured.detailsData);
  assert.equal(normalized.testGroups.length, raw.TestHighlights.length);
  assert.equal(normalized.testGroups.length, 6);
  assert.equal(normalized.testGroups.reduce((sum, group) => sum + group.parameters.length, 0), 31);
  assert.equal(normalized.instructionGroups.length, 7);
  assert.equal(normalized.instructions.length, 11);
  assert.deepEqual(normalized.sampleRequired, ["Blood", "Urine"]);
  assert.deepEqual(normalized.benefits.map(benefit => benefit.description), raw.KeyFeatures.map(entry => entry.Description));
  assert.equal(normalized.testGroups[0].description, raw.TestHighlights[0].Description);
  // Detailed source tests are retained unless their exact name is already in highlights.
  const highlightedNames = new Set(raw.TestHighlights.flatMap(group => [group.Title, ...group.TestList.map(test => test.Title)]).map(value => value.trim().toLowerCase()));
  const distinctSourceNames = raw.profile_tests.filter(group => group.TestList.length || !highlightedNames.has(group.Name.trim().toLowerCase())).map(group => group.Name);
  assert.deepEqual(normalized.profileTestGroups.map(group => group.name), distinctSourceNames);
});
