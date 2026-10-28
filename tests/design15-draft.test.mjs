import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import test from "node:test";
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
    if (url.startsWith(pathToFileURL(root).href) && new URL(url).pathname.endsWith(".ts") && !url.includes("/node_modules/")) return {
      format: "module", shortCircuit: true, source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText,
    };
    return nextLoad(url, context);
  },
});

const { Design15DraftStore, DESIGN15_DRAFT_TTL_MS } = await import("../src/features/booking/design15/serverDraftStore.ts");
const { patientsForIdentity, holdAfterPaymentFailure } = await import("../src/features/booking/design15/model.ts");
const { getDesign3BookingDoctor } = await import("../src/features/booking/doctors.ts");
const api = await import("../src/app/api/booking-preview/design15/route.ts");
const token = "e08b139e-657c-4f21-a4d9-5cda4fb87381";
const otherToken = "cf04ada9-e27b-4454-a6fb-68499ce87bc9";
const doctor = getDesign3BookingDoctor("dr-1");
const identity = { method: "email", value: "alex@example.test" };
const draft = () => ({ version: 1, doctorId: doctor.id, identity, patients: patientsForIdentity(identity), selectedPatientId: null,
  selection: { doctorId: doctor.id, hospital: doctor.hospital, mode: "hospital", date: "2026-10-23", time: "" },
  payment: "online", failureHold: null, receipt: null, stage: "patient" });
const request = (method, body, extraHeaders = {}) => new Request(`http://localhost:3005/api/booking-preview/design15?doctorId=${doctor.id}`, {
  method, headers: { origin: "http://localhost:3005", "sec-fetch-site": "same-origin", "x-nh-preview-token": token,
    ...(body ? { "content-type": "application/json" } : {}), ...extraHeaders }, ...(body ? { body } : {}),
});

test("email login and patient choices recover before a slot exists, without a mobile number or reservation", () => {
  const store = new Design15DraftStore();
  try {
    const value = draft();
    assert.equal(store.put(token, doctor.id, value), "saved");
    const recovered = store.get(token, doctor.id);
    assert.deepEqual(recovered, value);
    assert.equal(recovered.failureHold, null);
    assert.equal(recovered.selection.time, "");
    assert.equal(recovered.patients[0].patient.phone, "");
    recovered.patients[0].patient.name = "Changed externally";
    assert.notEqual(store.get(token, doctor.id).patients[0].patient.name, "Changed externally");
    assert.equal(store.get(otherToken, doctor.id), null);
    assert.deepEqual(store.account(token), { identity, patients: value.patients });
    assert.equal(store.account(otherToken), null);
    assert.equal(store.put(token, doctor.id, { ...value, selection: { ...value.selection, hospital: "Unknown hospital" } }), "invalid");
  } finally { store.dispose(); }
});

test("failure reservation and draft retention preserve absolute deadlines across saves and reads", () => {
  let now = Date.now();
  const start = now;
  const store = new Design15DraftStore(() => now, 1);
  try {
    const value = draft();
    value.selectedPatientId = value.patients[0].id;
    value.selection.time = "10:30 AM";
    value.stage = "review";
    value.failureHold = holdAfterPaymentFailure(null, value.selection, now);
    assert.equal(store.put(token, doctor.id, value), "saved");
    now += 60000;
    assert.equal(store.put(token, doctor.id, value), "saved");
    assert.equal(store.get(token, doctor.id).failureHold.expiresAt, start + 15 * 60 * 1000);
    assert.equal(store.put(otherToken, doctor.id, value), "full");
    now = start + DESIGN15_DRAFT_TTL_MS;
    assert.equal(store.get(token, doctor.id), null);
    assert.equal(store.account(token), null);
    assert.equal(store.put(otherToken, doctor.id, draft()), "saved");
  } finally { store.dispose(); }
});

test("D15 API bounds data, rejects cross-origin writes, and keeps recovery private to the tab token", async () => {
  const previous = process.env.NH_BOOKING_PREVIEW_DRAFTS;
  process.env.NH_BOOKING_PREVIEW_DRAFTS = "true";
  try {
    const value = draft();
    const saved = await api.POST(request("POST", JSON.stringify(value)));
    assert.equal(saved.status, 200);
    assert.match(saved.headers.get("cache-control"), /no-store/);
    assert.deepEqual((await (await api.GET(request("GET"))).json()).draft, value);
    assert.equal((await (await api.GET(request("GET", undefined, { "x-nh-preview-token": otherToken }))).json()).draft, null);
    assert.equal((await api.POST(request("POST", JSON.stringify(value), { origin: "https://other.example" }))).status, 403);
    assert.equal((await api.POST(request("POST", JSON.stringify({ padding: "a".repeat(13000) })))).status, 400);
    assert.equal((await api.POST(request("POST", "{}", { "content-type": "text/plain" }))).status, 400);
    assert.equal((await api.POST(request("POST", "{invalid"))).status, 400);
    await api.DELETE(request("DELETE"));
    assert.equal((await (await api.GET(request("GET"))).json()).draft, null);
    process.env.NH_BOOKING_PREVIEW_DRAFTS = "false";
    const oldEnvironment = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try { assert.equal((await api.GET(request("GET"))).status, 404); }
    finally { if (oldEnvironment === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = oldEnvironment; }
  } finally {
    if (previous === undefined) delete process.env.NH_BOOKING_PREVIEW_DRAFTS; else process.env.NH_BOOKING_PREVIEW_DRAFTS = previous;
  }
});
