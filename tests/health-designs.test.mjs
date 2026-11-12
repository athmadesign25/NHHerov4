import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/features/health-checkups/healthDesigns.ts", import.meta.url), "utf8");
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { HEALTH_DESIGNS, resolveHealthDesign } = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);

test("explicit previews keep Designs 1 and 2 available alongside Design 3", () => {
  assert.deepEqual(HEALTH_DESIGNS.map(design => design.id), ["1", "2", "3"]);
  for (const design of HEALTH_DESIGNS) assert.equal(resolveHealthDesign(design.id), design.id);
});

test("unspecified, unknown and repeated query values resolve to the latest preview", () => {
  for (const value of [undefined, null, "", "0", "4", "old", " 1 ", ["1"], ["1", "2"]]) {
    assert.equal(resolveHealthDesign(value), "3");
  }
});
