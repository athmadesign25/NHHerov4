import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import test from "node:test";
import ts from "typescript";

const sourceUrl = new URL("../src/features/booking/designA/bookingHistoryLease.ts", import.meta.url);
registerHooks({
  load(url, context, nextLoad) {
    if (url === sourceUrl.href) return { format: "module", shortCircuit: true,
      source: ts.transpileModule(readFileSync(sourceUrl, "utf8"), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText };
    return nextLoad(url, context);
  },
});
const { acquireBookingHistoryLease, bookingHistoryEntryState } = await import(sourceUrl.href);

test("source and exiting surface jointly prevent native history restoration", () => {
  globalThis.window = { history: { scrollRestoration: "auto" } };
  const releaseSource = acquireBookingHistoryLease();
  assert.equal(window.history.scrollRestoration, "manual");
  const releaseSurface = acquireBookingHistoryLease();
  releaseSource();
  releaseSource();
  assert.equal(window.history.scrollRestoration, "manual");
  releaseSurface();
  assert.equal(window.history.scrollRestoration, "auto");
  delete globalThis.window;
});

test("a canceled source releases its lease without changing an existing manual policy", () => {
  globalThis.window = { history: { scrollRestoration: "manual" } };
  const release = acquireBookingHistoryLease();
  release();
  assert.equal(window.history.scrollRestoration, "manual");
  delete globalThis.window;
});

test("Forward then panel Close restores the original policy, not inherited manual", () => {
  globalThis.window = { history: { scrollRestoration: "auto", state: null } };
  const releaseSource = acquireBookingHistoryLease();
  const bookingEntry = bookingHistoryEntryState();
  releaseSource();
  assert.equal(window.history.scrollRestoration, "auto");

  // Forward restores the booking entry, including its temporary browser policy.
  window.history.state = bookingEntry;
  window.history.scrollRestoration = "manual";
  const releaseForwardSurface = acquireBookingHistoryLease();
  // The panel was not opened here, so its Close replaces the URL/state.
  window.history.state = null;
  releaseForwardSurface();
  assert.equal(window.history.scrollRestoration, "auto");
  assert.equal(bookingHistoryEntryState(), null);
  delete globalThis.window;
});

test("releasing an owned marker preserves Next state and a preexisting manual policy", () => {
  const nextState = { __NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE: ["tree"], custom: "keep" };
  globalThis.window = { history: { scrollRestoration: "manual", state: nextState,
    replaceState(state) { this.state = state; } } };
  const release = acquireBookingHistoryLease();
  window.history.state = { ...nextState, ...bookingHistoryEntryState() };
  release();
  assert.equal(window.history.scrollRestoration, "manual");
  assert.deepEqual(window.history.state, nextState);
  delete globalThis.window;
});
