import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import test from "node:test";
import ts from "typescript";

const placementUrl = new URL("../src/features/booking/designA/placement.ts", import.meta.url);
registerHooks({
  load(url, context, nextLoad) {
    if (url === placementUrl.href) {
      return { format: "module", shortCircuit: true, source: ts.transpileModule(readFileSync(placementUrl, "utf8"), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText };
    }
    return nextLoad(url, context);
  },
});

const { expandedBookingPlacement } = await import(placementUrl.href);
const gutter = 16;

test("the first card expands from its left edge without covering the filters", () => {
  const source = { left: 384, top: 160, width: 320, height: 560 };
  const results = { left: 384, width: 1008 };
  const result = expandedBookingPlacement(source, { width: 1440, height: 1000 }, { width: 896, height: 500 }, gutter, results);
  assert.equal(result.left, source.left);
  assert.equal(result.width, 896);
  assert.equal(result.edge, "left");
  assert.equal(result.top, source.top);
  assert.equal(result.height, source.height);
  assert.ok(result.left >= results.left);
  assert.ok(result.left + result.width <= results.left + results.width);
});

test("the rightmost card expands from its right edge", () => {
  const source = { left: 1072, top: 160, width: 320, height: 560 };
  const results = { left: 384, width: 1008 };
  const result = expandedBookingPlacement(source, { width: 1440, height: 900 }, { width: 896, height: 500 }, gutter, results);
  assert.equal(result.left + result.width, source.left + source.width);
  assert.equal(result.edge, "right");
  assert.equal(result.width, 896);
  assert.ok(result.left >= results.left);
});

test("a middle card expands equally left and right around its own centre", () => {
  const source = { left: 728, top: 160, width: 320, height: 560 };
  const results = { left: 384, width: 1008 };
  const result = expandedBookingPlacement(source, { width: 1440, height: 900 }, { width: 896, height: 500 }, gutter, results);
  assert.equal(result.edge, "center");
  assert.equal(result.width, 896);
  assert.equal(result.left, 440);
  assert.equal(source.left - result.left, result.left + result.width - (source.left + source.width));
  assert.equal(result.top, source.top);
  assert.equal(result.height, source.height);

  const shifted = { ...source, left: source.left + 16 };
  const centred = expandedBookingPlacement(shifted, { width: 1440, height: 900 }, { width: 896, height: 500 }, gutter, results);
  assert.equal(centred.edge, "center");
  assert.equal(centred.left, result.left + 16);
  assert.equal(centred.width, result.width);
});

test("interior cards in wider grids remain symmetric and never cross the filter boundary", () => {
  const results = { left: 384, width: 1344 };
  for (const left of [728, 1072]) {
    const source = { left, top: 160, width: 312, height: 560 };
    const result = expandedBookingPlacement(source, { width: 1800, height: 900 }, { width: 1200, height: 500 }, gutter, results);
    assert.equal(result.edge, "center");
    assert.equal(result.left + result.width / 2, source.left + source.width / 2);
    assert.ok(result.left < source.left);
    assert.ok(result.left + result.width > source.left + source.width);
    assert.ok(result.left >= results.left);
    assert.ok(result.left + result.width <= results.left + results.width);
  }
});

test("hospital and video content heights cannot change the top or baseline card height", () => {
  const source = { left: 384, top: 350, width: 320, height: 560 };
  const viewport = { width: 1440, height: 800 };
  const results = { left: 384, width: 1008 };
  const hospital = expandedBookingPlacement(source, viewport, { width: 896, height: 600 }, gutter, results);
  const video = expandedBookingPlacement(source, viewport, { width: 896, height: 400 }, gutter, results);
  assert.deepEqual(hospital, video);
  assert.equal(hospital.top, viewport.height - gutter - source.height);
  assert.equal(hospital.height, source.height);
});

test("a narrow results grid constrains expansion even on a wide viewport", () => {
  const results = { left: 700, width: 500 };
  const source = { left: 700, top: 120, width: 500, height: 560 };
  const result = expandedBookingPlacement(source, { width: 1600, height: 900 }, { width: 896, height: 500 }, gutter, results);
  assert.equal(result.left, results.left);
  assert.equal(result.width, results.width);
  assert.equal(result.edge, "left");
});

test("top and lower-row sources keep close and Continue inside the viewport", () => {
  const viewport = { width: 1024, height: 768 };
  const panel = { width: 896, height: 500 };
  const above = expandedBookingPlacement({ left: 80, top: -400, width: 420, height: 560 }, viewport, panel, gutter);
  const below = expandedBookingPlacement({ left: 80, top: 1800, width: 420, height: 560 }, viewport, panel, gutter);
  assert.equal(above.top, gutter);
  assert.equal(below.top + below.height, viewport.height - gutter);
});

test("mobile and short viewports reserve safe gutters without negative placement", () => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    for (const height of [360, 568, 900]) {
      const viewport = { width, height };
      const result = expandedBookingPlacement({ left: width - 320, top: height - 120, width: 288, height: 560 }, viewport, { width: 896, height: 640 }, gutter);
      assert.ok(result.left >= gutter);
      assert.ok(result.top >= gutter);
      assert.ok(result.left + result.width <= width - gutter);
      assert.ok(result.top + result.height <= height - gutter);
      assert.equal(result.height, Math.min(560, height - gutter * 2));
    }
  }
});

test("results that extend beyond the viewport are intersected with its safe edges", () => {
  const viewport = { width: 375, height: 568 };
  const result = expandedBookingPlacement({ left: -24, top: 80, width: 420, height: 560 }, viewport,
    { width: 896, height: 640 }, gutter, { left: -24, width: 420 });
  assert.equal(result.left, gutter);
  assert.equal(result.width, viewport.width - gutter * 2);
  assert.equal(result.height, viewport.height - gutter * 2);
  assert.equal(result.top, gutter);
});

test("mobile expansion stays docked to the bottom regardless of source scroll position", () => {
  for (const width of [320, 375, 430]) {
    for (const top of [-600, 80, 1600]) {
      const viewport = { width, height: 900 };
      const result = expandedBookingPlacement({ left: 24, top, width: width - 48, height: 560 }, viewport,
        { width: 896, height: 560 }, gutter, { left: 24, width: width - 48 }, { bottomInset: gutter });
      assert.equal(result.left, gutter);
      assert.equal(result.width, width - gutter * 2);
      assert.equal(result.top + result.height, viewport.height - gutter);
    }
  }
});

test("mobile docking reserves home-indicator space and fits short viewports", () => {
  for (const height of [360, 568, 900]) {
    const bottomInset = gutter + 34;
    const result = expandedBookingPlacement({ left: 24, top: 120, width: 327, height: 600 }, { width: 375, height },
      { width: 896, height: 600 }, gutter, undefined, { bottomInset });
    assert.equal(result.top + result.height, height - bottomInset);
    assert.ok(result.top >= gutter);
    assert.equal(result.height, Math.min(600, height - gutter - bottomInset));
  }
});
