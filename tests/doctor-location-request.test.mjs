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

const { requestDoctorCity } = await import("../src/features/search/doctorLocation.ts");

async function withBrowser(navigatorValue, run, secure = true) {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  Object.defineProperty(globalThis, "window", { configurable: true, value: { isSecureContext: secure } });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: navigatorValue });
  try { await run(); }
  finally {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else delete globalThis.window;
    if (previousNavigator) Object.defineProperty(globalThis, "navigator", previousNavigator);
    else delete globalThis.navigator;
  }
}

test("unsupported and insecure browsers return a manual city fallback without requesting coordinates", async () => {
  await withBrowser({}, async () => assert.match((await requestDoctorCity()).error, /Choose a city/));
  let requested = false;
  await withBrowser({ geolocation: { getCurrentPosition() { requested = true; } } }, async () => {
    assert.match((await requestDoctorCity()).error, /Choose a city/);
    assert.equal(requested, false);
  }, false);
});

test("a denied permission stays recoverable manually and does not trigger another browser request", async () => {
  let requested = false;
  await withBrowser({
    permissions: { async query() { return { state: "denied" }; } },
    geolocation: { getCurrentPosition() { requested = true; } },
  }, async () => {
    assert.match((await requestDoctorCity()).error, /blocked.*choose a city/i);
    assert.equal(requested, false);
  });
});

test("cancelling while permission is queried prevents the geolocation request", async () => {
  let current = true;
  let requested = false;
  await withBrowser({
    permissions: { async query() { current = false; return { state: "prompt" }; } },
    geolocation: { getCurrentPosition() { requested = true; } },
  }, async () => {
    assert.match((await requestDoctorCity(() => current)).error, /cancelled/);
    assert.equal(requested, false);
  });
});

test("a user-triggered request maps accurate coordinates to a supported city and returns no coordinates", async () => {
  let requestOptions;
  await withBrowser({ geolocation: { getCurrentPosition(success, _failure, options) {
    requestOptions = options;
    success({ coords: { latitude: 12.9716, longitude: 77.5946, accuracy: 50 } });
  } } }, async () => {
    assert.deepEqual(await requestDoctorCity(), { city: "Bangalore" });
    assert.equal(requestOptions.enableHighAccuracy, false);
    assert.ok(requestOptions.timeout > 0 && requestOptions.timeout <= 10000);
  });
});

test("remote or imprecise positions require a city choice instead of inventing a nearby location", async () => {
  for (const coords of [
    { latitude: 18.5204, longitude: 73.8567, accuracy: 50 },
    { latitude: 12.9716, longitude: 77.5946, accuracy: 20000 },
  ]) await withBrowser({ geolocation: { getCurrentPosition(success) { success({ coords }); } } }, async () => {
    const result = await requestDoctorCity();
    assert.equal(result.city, undefined);
    assert.match(result.error, /No nearby city.*Choose a city/);
  });
});

test("permission refusal, timeout and unavailable positions all keep manual city selection possible", async () => {
  for (const code of [1, 2, 3]) await withBrowser({
    geolocation: { getCurrentPosition(_success, failure) { failure({ code }); } },
  }, async () => {
    assert.match((await requestDoctorCity()).error, /choose a city/i);
  });
});

test("unsupported permission inspection falls back to the explicit geolocation request", async () => {
  await withBrowser({
    permissions: { async query() { throw new Error("Unsupported"); } },
    geolocation: { getCurrentPosition(success) { success({ coords: { latitude: 28.6139, longitude: 77.2090, accuracy: 50 } }); } },
  }, async () => assert.deepEqual(await requestDoctorCity(), { city: "Delhi" }));
});
