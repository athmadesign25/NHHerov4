import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import test from "node:test";
import ts from "typescript";

const leaseUrl = new URL("../src/lib/inertLease.ts", import.meta.url);
registerHooks({
  load(url, context, nextLoad) {
    if (url === leaseUrl.href) {
      return { format: "module", shortCircuit: true, source: ts.transpileModule(readFileSync(leaseUrl, "utf8"), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText };
    }
    return nextLoad(url, context);
  },
});

const { acquireInertLease } = await import(leaseUrl.href);

test("a single dialog restores the background when it closes", () => {
  const page = { inert: false };
  const release = acquireInertLease([page]);
  assert.equal(page.inert, true);
  release();
  assert.equal(page.inert, false);
});

test("browser Back can release booking before login without leaving the page inert", () => {
  const page = { inert: false };
  const bookingLayer = { inert: false };
  const releaseBooking = acquireInertLease([page]);
  const releaseLogin = acquireInertLease([page, bookingLayer]);
  releaseBooking();
  assert.equal(page.inert, true, "login still owns the background");
  assert.equal(bookingLayer.inert, true);
  releaseLogin();
  assert.equal(page.inert, false);
  assert.equal(bookingLayer.inert, false);
});

test("dismissing login first restores booking while keeping the page inactive", () => {
  const page = { inert: false };
  const bookingLayer = { inert: false };
  const releaseBooking = acquireInertLease([page]);
  const releaseLogin = acquireInertLease([page, bookingLayer]);
  releaseLogin();
  assert.equal(page.inert, true, "booking still owns the background");
  assert.equal(bookingLayer.inert, false);
  releaseBooking();
  assert.equal(page.inert, false);
});

test("pre-existing inert elements stay inert after either nested cleanup order", () => {
  for (const outerFirst of [true, false]) {
    const existing = { inert: true };
    const releaseOuter = acquireInertLease([existing]);
    const releaseInner = acquireInertLease([existing]);
    if (outerFirst) { releaseOuter(); releaseInner(); }
    else { releaseInner(); releaseOuter(); }
    assert.equal(existing.inert, true);
  }
});

test("duplicate targets and repeated cleanup cannot release another dialog's ownership", () => {
  const page = { inert: false };
  const releaseOuter = acquireInertLease([page, page]);
  const releaseInner = acquireInertLease([page]);
  releaseOuter();
  releaseOuter();
  assert.equal(page.inert, true);
  releaseInner();
  releaseInner();
  assert.equal(page.inert, false);
});

test("a replacement dialog joins an active lease and the next session reads fresh initial state", () => {
  const page = { inert: false };
  const releaseBooking = acquireInertLease([page]);
  const releaseLogin = acquireInertLease([page]);
  releaseBooking();
  const releaseReplacement = acquireInertLease([page]);
  releaseLogin();
  assert.equal(page.inert, true);
  releaseReplacement();
  assert.equal(page.inert, false);

  page.inert = true;
  const releaseNext = acquireInertLease([page]);
  releaseNext();
  assert.equal(page.inert, true, "completed leases do not retain stale initial state");
});
