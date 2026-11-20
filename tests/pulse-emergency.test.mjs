import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/components/search/NHSearchExperience/pulseEmergency.ts", import.meta.url), "utf8");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { getPulseEmergencyResponse, NH_EMERGENCY_PHONE } = await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);

test("the demo follow-up inherits chest pain from the initial search", () => {
  for (const prompt of ["The pain is really high now", "The chest pain is high now", "It is getting worse", "The pain has increased", "The pain is too much now"]) {
    assert.ok(getPulseEmergencyResponse(prompt, ["chest pain"]), prompt);
  }
});

test("explicit severe chest pain works without previous search context", () => {
  for (const prompt of ["I have severe chest pain", "The pain in my chest is unbearable", "Crushing chest pressure", "My chest pain is worse and I can't breathe"]) {
    assert.ok(getPulseEmergencyResponse(prompt), prompt);
  }
});

test("routine searches and doctor questions keep their usual response", () => {
  for (const prompt of ["Tell me about Dr. Devishree", "Find a cardiologist", "I have chest pain", "What are consultation fees?", "I have high blood pressure"]) {
    assert.equal(getPulseEmergencyResponse(prompt, ["chest pain"]), null, prompt);
  }
});

test("unrelated pain does not inherit a previous chest-pain search", () => {
  assert.equal(getPulseEmergencyResponse("My knee pain is really high now", ["chest pain"]), null);
  assert.equal(getPulseEmergencyResponse("The pain is getting worse", ["chest pain", "My knee pain"]), null);
  assert.equal(getPulseEmergencyResponse("The pain is really high now", ["knee pain"]), null);
});

test("negated severity and resolved symptoms do not trigger the emergency demo", () => {
  for (const prompt of ["The pain is not severe", "The pain isn't very high", "It is not getting worse", "The pain has stopped, it was severe", "No more chest pain, it was severe"]) {
    assert.equal(getPulseEmergencyResponse(prompt, ["chest pain"]), null, prompt);
  }
  assert.equal(getPulseEmergencyResponse("The pain is really high now", ["No chest pain"]), null);
});

test("a worsening update still escalates when another severity word was negated", () => {
  assert.ok(getPulseEmergencyResponse("The chest pain is not severe but getting worse"));
});

test("the emergency response prioritises immediate care and uses the NH navigation number", () => {
  const response = getPulseEmergencyResponse("The pain is really high now", ["chest pain"]);
  assert.match(response.introText, /emergency care now/i);
  assert.match(response.narrative, /do not wait/i);
  assert.match(response.narrative, /drive yourself/i);
  assert.equal(NH_EMERGENCY_PHONE, "18003090309");
});
