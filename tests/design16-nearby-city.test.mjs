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

const { getDesign16NearbyCity } = await import("../src/features/search/design16NearbyCity.ts");
const { NH_CITIES } = await import("../src/lib/searchService.ts");

const cityAt = (latitude, longitude, accuracy = 50) =>
  getDesign16NearbyCity({ latitude, longitude, accuracy });

test("serviceable cities resolve to their canonical dropdown value", () => {
  const cases = [
    ["Bangalore", 12.9716, 77.5946], ["Guwahati", 26.1445, 91.7362],
    ["Dharwad", 15.46, 75.01], ["Shimoga", 13.9299, 75.5681],
    ["Ahmedabad", 23.0225, 72.5714], ["Jaipur", 26.9124, 75.7873],
    ["Kolar", 13.13, 78.13], ["Mumbai", 19.0760, 72.8777],
    ["Raipur", 21.25, 81.63], ["Kolkata", 22.5726, 88.3639],
    ["Davangere", 14.46, 75.92], ["Barasat", 22.72, 88.48],
    ["Jamshedpur", 22.80, 86.19], ["Gurugram", 28.46, 77.03],
    ["Howrah", 22.59, 88.34], ["Delhi", 28.6139, 77.2090],
    ["Mysore", 12.2958, 76.6394], ["Katra", 32.99, 74.94],
    ["Jammu", 32.73, 74.86],
  ];
  for (const [city, latitude, longitude] of cases) {
    assert.equal(cityAt(latitude, longitude), city, city);
    assert.ok(NH_CITIES.some(({ value }) => value === city));
  }
});

test("Bangalore outskirts and the empty Hosur directory select Bangalore", () => {
  assert.equal(cityAt(12.818, 77.682), "Bangalore", "Bommasandra");
  assert.equal(cityAt(12.7409, 77.8253), "Bangalore", "Hosur");
});

test("a location outside serviceable cities selects the nearest supported city without a 35 km cutoff", () => {
  assert.equal(cityAt(18.5204, 73.8567), "Mumbai", "Pune");
  assert.equal(cityAt(13.0827, 80.2707), "Kolar", "Chennai");
  assert.equal(cityAt(30.7333, 76.7794), "Delhi", "Chandigarh");
});

test("invalid or unusably imprecise positions never silently select a city", () => {
  for (const position of [
    { latitude: NaN, longitude: 77.59, accuracy: 50 },
    { latitude: 91, longitude: 77.59, accuracy: 50 },
    { latitude: 12.97, longitude: -181, accuracy: 50 },
    { latitude: 12.97, longitude: Infinity, accuracy: 50 },
    { latitude: 12.97, longitude: 77.59, accuracy: -1 },
    { latitude: 12.97, longitude: 77.59, accuracy: 10001 },
  ]) assert.equal(getDesign16NearbyCity(position), null);
});
