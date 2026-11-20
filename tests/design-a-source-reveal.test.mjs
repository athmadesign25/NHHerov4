import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import test from "node:test";
import ts from "typescript";

const sourceUrl = new URL("../src/features/booking/designA/sourceReveal.ts", import.meta.url);
registerHooks({
  load(url, context, nextLoad) {
    if (url === sourceUrl.href) return { format: "module", shortCircuit: true,
      source: ts.transpileModule(readFileSync(sourceUrl, "utf8"), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText };
    return nextLoad(url, context);
  },
});
const { bookingSourceSafeTop, bookingSourceRevealScroll } = await import(sourceUrl.href);

test("a fully visible source keeps its exact scroll position", () => {
  assert.equal(bookingSourceRevealScroll({ top: 240, height: 560 }, 1000, 600, 3000, 220, 16), 600);
});
test("partially hidden sources use the minimum displacement in either direction", () => {
  assert.equal(bookingSourceRevealScroll({ top: 100, height: 560 }, 1000, 600, 3000, 220, 16), 480);
  assert.equal(bookingSourceRevealScroll({ top: 500, height: 560 }, 1000, 600, 3000, 220, 16), 676);
});
test("short viewports use a compact top gutter rather than hide the booking action", () => {
  assert.equal(bookingSourceSafeTop(560, 1000, 16, 204), 220);
  assert.equal(bookingSourceSafeTop(560, 700, 16, 204), 16);
  assert.equal(bookingSourceRevealScroll({ top: -120, height: 700 }, 500, 600, 3000, 16, 16), 464);
});
test("the reveal never overscrolls at the start or end of the document", () => {
  assert.equal(bookingSourceRevealScroll({ top: 50, height: 560 }, 1000, 0, 3000, 220, 16), 0);
  assert.equal(bookingSourceRevealScroll({ top: 700, height: 560 }, 1000, 2900, 3000, 220, 16), 3000);
});
