import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
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
    if (url.startsWith(pathToFileURL(root).href) && new URL(url).pathname.endsWith(".ts") && !url.includes("/node_modules/")) {
      return { format: "module", shortCircuit: true, source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText };
    }
    return nextLoad(url, context);
  },
});

const client = await import("../src/features/booking/design13/draft.ts");
const { PreviewDraftStore, PREVIEW_DRAFT_TTL_MS, sameOriginPreviewRequest, previewDraftApiEnabled } = await import("../src/features/booking/design13/serverDraftStore.ts");
const api = await import("../src/app/api/booking-preview/draft/route.ts");
const { getDesign3BookingDoctor } = await import("../src/features/booking/doctors.ts");
const { getOrCreateHold } = await import("../src/features/booking/design7/model.ts");
const token = "4f5b084e-e01c-4b5f-92cc-817ec0d513a9";
const otherToken = "624afde1-01e7-4fd6-9e5d-54c2a6ac8491";
const doctor = getDesign3BookingDoctor("dr-1");
const selection = { doctorId: doctor.id, mode: "hospital", hospital: doctor.hospital, date: "2026-10-21", time: "10:30 AM" };
const patient = { name: "Sample Person", age: "32", gender: "other", relation: "self", phone: "9000000000", email: "" };
const draft = (now = Date.now()) => ({ version: 1, selection: { ...selection }, hold: getOrCreateHold(null, selection, now), receipt: null, patient: { ...patient }, verifiedPhone: patient.phone, payment: "online" });
const request = (method, body, extraHeaders = {}, doctorId = doctor.id) => new Request(`http://localhost:3005/api/booking-preview/draft?doctorId=${doctorId}`, {
  method, headers: { origin: "http://localhost:3005", "sec-fetch-site": "same-origin", "x-nh-preview-token": token, ...(body ? { "content-type": "application/json" } : {}), ...extraHeaders }, ...(body ? { body } : {}),
});

test("draft serialization preserves partial form entries and strips every unrecognized field", () => {
  const source = draft();
  source.patient = { ...patient, name: "S", age: "", gender: "", phone: "9", email: "sample@", medicalReport: "not part of this draft" };
  source.verifiedPhone = "";
  source.secret = "not permitted";
  source.selection.patientName = "not permitted";
  const restored = client.parsePreviewDraft(source, doctor.id);
  assert.equal(restored.patient.name, "S");
  assert.equal(restored.patient.email, "sample@");
  assert.deepEqual(Object.keys(restored.patient).sort(), ["age", "email", "gender", "name", "phone", "relation"]);
  assert.equal(JSON.stringify(restored).includes("not permitted"), false);
  assert.equal(JSON.stringify(restored).includes("medicalReport"), false);
});

test("ten saved patients round-trip through the server with only allowlisted fields and detached values", () => {
  const store = new PreviewDraftStore();
  try {
    const savedPatients = Array.from({ length: 10 }, (_, index) => ({
      id: `custom-patient-${index + 1}`,
      patient: { ...patient, name: `Family Member ${index + 1}`, age: String(index + 20), relation: "other", email: `member${index + 1}@example.test` },
    }));
    const value = { ...draft(), savedPatients: savedPatients.map((entry) => ({
      ...entry, internalToken: "remove-this-field", patient: { ...entry.patient, clinicalNotes: "remove-this-field" },
    })) };
    const parsed = client.parsePreviewDraft(value, doctor.id);
    assert.deepEqual(parsed.savedPatients, savedPatients);
    assert.equal(JSON.stringify(parsed).includes("remove-this-field"), false);
    assert.equal(store.put(token, doctor.id, value), "saved");
    const recovered = store.get(token, doctor.id);
    assert.deepEqual(recovered.savedPatients, savedPatients);
    recovered.savedPatients[0].patient.name = "Changed externally";
    recovered.savedPatients.pop();
    value.savedPatients[1].patient.name = "Changed source";
    assert.deepEqual(store.get(token, doctor.id).savedPatients, savedPatients);
  } finally { store.dispose(); }
});

test("saved patients must belong to the same currently verified mobile number", () => {
  const good = draft();
  const saved = { id: "custom-patient-1", patient: { ...patient } };
  const otherPhone = "9111111111";
  for (const value of [
    { ...good, savedPatients: [{ ...saved, patient: { ...patient, phone: otherPhone } }] },
    { ...good, verifiedPhone: "", savedPatients: [saved] },
    { ...good, patient: { ...patient, phone: otherPhone }, verifiedPhone: otherPhone, savedPatients: [saved] },
    { ...good, savedPatients: [saved, { id: "custom-patient-2", patient: { ...patient, phone: otherPhone } }] },
  ]) assert.equal(client.parsePreviewDraft(value, doctor.id), null);
});

test("saved patient IDs must be unique, bounded and valid", () => {
  const good = draft();
  const saved = { id: "custom-patient-1", patient: { ...patient } };
  assert.equal(client.parsePreviewDraft({ ...good, savedPatients: [saved, { ...saved, patient: { ...patient, name: "Another Person" } }] }, doctor.id), null);
  for (const id of ["", "x".repeat(65), "patient/1", "patient.1", "patient 1", "patient\n1", 123, null]) {
    assert.equal(client.parsePreviewDraft({ ...good, savedPatients: [{ id, patient: { ...patient } }] }, doctor.id), null, String(id));
  }
});

test("saved profiles require complete valid patients even when the active draft is incomplete", () => {
  const good = draft();
  const changes = [
    { name: "" }, { name: "A" }, { name: "a".repeat(81) }, { name: "Invalid\nName" },
    { age: "" }, { age: "121" }, { age: "-1" }, { age: "1.5" }, { age: 32 },
    { gender: "" }, { gender: "unknown" }, { relation: "" }, { relation: "sibling" },
    { phone: "" }, { email: "incomplete@" }, { email: "a".repeat(161) }, { email: {} },
  ];
  for (const changed of changes) {
    assert.equal(client.parsePreviewDraft({ ...good, savedPatients: [{ id: "custom-patient-1", patient: { ...patient, ...changed } }] }, doctor.id), null, JSON.stringify(changed));
  }
  const activeIncomplete = { ...good, patient: { ...patient, name: "", age: "", gender: "", email: "part@" }, savedPatients: [{ id: "custom-patient-1", patient: { ...patient } }] };
  assert.deepEqual(client.parsePreviewDraft(activeIncomplete, doctor.id).savedPatients, activeIncomplete.savedPatients);
});

test("saved patients reject malformed entries and arrays above the ten-profile limit", () => {
  const good = draft();
  const entries = Array.from({ length: 11 }, (_, index) => ({ id: `custom-${index}`, patient: { ...patient } }));
  for (const savedPatients of [null, {}, "patients", entries, [null], [[]], [{}], [{ id: "custom-1", patient: null }], [{ id: "custom-1", patient: [] }]]) {
    assert.equal(client.parsePreviewDraft({ ...good, savedPatients }, doctor.id), null);
  }
  assert.deepEqual(client.parsePreviewDraft({ ...good, savedPatients: [] }, doctor.id).savedPatients, []);
});

test("existing D13 drafts keep their original serialized shape when savedPatients is absent", () => {
  const value = draft();
  const parsed = client.parsePreviewDraft(value, doctor.id);
  assert.deepEqual(parsed, value);
  assert.equal(Object.hasOwn(parsed, "savedPatients"), false);
  assert.equal(JSON.stringify(parsed).includes("savedPatients"), false);
  const incomplete = { ...value, patient: { ...patient, name: "S", age: "", gender: "", phone: "9", email: "partial@" }, verifiedPhone: "" };
  assert.deepEqual(client.parsePreviewDraft(incomplete, doctor.id), incomplete);
});

test("draft rejects mismatched identity, hold, payment and malformed or oversized field types", () => {
  const good = draft();
  assert.equal(client.parsePreviewDraft(good, "dr-2"), null);
  for (const invalid of [
    { ...good, patient: { ...patient, gender: ["male"] } },
    { ...good, patient: { ...patient, relation: { toString: () => "self" } } },
    { ...good, patient: { ...patient, name: "a".repeat(81) } },
    { ...good, patient: { ...patient, email: "a\nb" } },
    { ...good, verifiedPhone: "9111111111" },
    { ...good, hold: { ...good.hold, selection: { ...selection, time: "11:30 AM" } } },
    { ...good, selection: { ...selection, date: "2026-02-30" }, hold: null },
    { ...good, selection: { ...selection, time: "" }, hold: null },
    { ...good, selection: { ...selection, mode: "video" }, hold: null, payment: "hospital" },
  ]) assert.equal(client.parsePreviewDraft(invalid, doctor.id), null);
});

test("server drafts are isolated by tab and doctor and returned as detached values", () => {
  const store = new PreviewDraftStore();
  try {
    const value = draft();
    assert.equal(store.put(token, doctor.id, value), "saved");
    assert.equal(store.get(otherToken, doctor.id), null);
    assert.equal(store.get(token, "dr-2"), null);
    const restored = store.get(token, doctor.id);
    assert.equal(restored.hold.expiresAt, value.hold.expiresAt);
    restored.patient.name = "Changed externally";
    assert.equal(store.get(token, doctor.id).patient.name, patient.name);
    assert.equal(store.put(token, doctor.id, { ...value, selection: { ...selection, hospital: "Unknown hospital" }, hold: null }), "invalid");
    assert.equal(store.put(token, "unknown-doctor", { ...value, selection: { ...selection, doctorId: "unknown-doctor" }, hold: null }), "invalid");
  } finally { store.dispose(); }
});

test("hot reload refreshes stale store methods without losing entries, holds, capacity or original retention", async () => {
  let now = Date.now();
  const start = now;
  class LegacyDraftStore extends PreviewDraftStore {
    put(token, doctorId, value) {
      const legacyValue = { ...value };
      delete legacyValue.savedPatients;
      return super.put(token, doctorId, legacyValue);
    }
  }
  const previousSingleton = globalThis.__nhPreviewDraftStore;
  const retained = new LegacyDraftStore(() => now, 1);
  const original = draft(now);
  const savedPatients = [{ id: "custom-after-reload", patient: { ...patient, name: "Family Member" } }];
  try {
    assert.equal(retained.put(token, doctor.id, { ...original, savedPatients }), "saved");
    assert.equal(Object.hasOwn(retained.get(token, doctor.id), "savedPatients"), false);
    globalThis.__nhPreviewDraftStore = retained;
    now += 5000;
    const reloaded = await import("../src/features/booking/design13/serverDraftStore.ts?hmr-saved-patients");
    assert.equal(reloaded.previewDraftStore, retained);
    assert.equal(Object.getPrototypeOf(retained), reloaded.PreviewDraftStore.prototype);
    assert.deepEqual(retained.get(token, doctor.id), original);
    assert.equal(retained.put(token, doctor.id, { ...original, savedPatients }), "saved");
    assert.deepEqual(retained.get(token, doctor.id).savedPatients, savedPatients);
    assert.equal(retained.get(token, doctor.id).hold.expiresAt, original.hold.expiresAt);
    assert.equal(retained.put(otherToken, doctor.id, original), "full");
    now = start + PREVIEW_DRAFT_TTL_MS - 1;
    assert.ok(retained.get(token, doctor.id));
    now += 1;
    assert.equal(retained.get(token, doctor.id), null);
  } finally {
    retained.dispose();
    if (previousSingleton === undefined) delete globalThis.__nhPreviewDraftStore;
    else globalThis.__nhPreviewDraftStore = previousSingleton;
  }
});

test("30-minute retention is absolute; updates and reads cannot renew it, and capacity is bounded", () => {
  let now = Date.now();
  const start = now;
  const store = new PreviewDraftStore(() => now, 1);
  try {
    const value = draft(now);
    assert.equal(store.put(token, doctor.id, value), "saved");
    assert.equal(store.put(otherToken, doctor.id, value), "full");
    now = start + PREVIEW_DRAFT_TTL_MS - 1;
    assert.equal(store.put(token, doctor.id, { ...value, patient: { ...patient, name: "Edited sample" } }), "saved");
    assert.ok(store.get(token, doctor.id));
    now += 1;
    assert.equal(store.get(token, doctor.id), null);
    assert.equal(store.put(otherToken, doctor.id, { ...value, hold: null }), "saved");
    store.delete(otherToken, doctor.id);
    assert.equal(store.get(otherToken, doctor.id), null);
  } finally { store.dispose(); }
});

test("request policy rejects cross-origin and same-site requests and permits normal same-origin fetches", () => {
  assert.equal(sameOriginPreviewRequest(request("POST", "{}")), true);
  assert.equal(sameOriginPreviewRequest(request("GET")), true);
  assert.equal(sameOriginPreviewRequest(request("POST", "{}", { origin: "https://other.example" })), false);
  assert.equal(sameOriginPreviewRequest(request("GET", undefined, { "sec-fetch-site": "same-site" })), false);
  assert.equal(sameOriginPreviewRequest(request("GET", undefined, { "sec-fetch-site": "cross-site" })), false);
  assert.equal(sameOriginPreviewRequest(new Request("http://localhost:3005/api/booking-preview/draft", { headers: { "sec-fetch-site": "same-origin" } })), true);
  assert.equal(sameOriginPreviewRequest(new Request("http://localhost:3005/api/booking-preview/draft", { method: "POST" })), false);
  assert.equal(sameOriginPreviewRequest(request("POST", "{}", { origin: "null" })), false);
  assert.equal(sameOriginPreviewRequest(request("POST", "{}", { origin: "http://localhost:3005/unexpected-path" })), false);
});

test("draft endpoint is disabled in ordinary production and explicitly enabled for previews", () => {
  const previous = [process.env.NODE_ENV, process.env.NEXT_PUBLIC_DESIGN_PREVIEW, process.env.NH_BOOKING_PREVIEW_DRAFTS];
  try {
    process.env.NODE_ENV = "production";
    delete process.env.NEXT_PUBLIC_DESIGN_PREVIEW; delete process.env.NH_BOOKING_PREVIEW_DRAFTS;
    assert.equal(previewDraftApiEnabled(), false);
    process.env.NH_BOOKING_PREVIEW_DRAFTS = "true";
    assert.equal(previewDraftApiEnabled(), true);
    delete process.env.NH_BOOKING_PREVIEW_DRAFTS;
    process.env.NODE_ENV = "development";
    assert.equal(previewDraftApiEnabled(), true);
  } finally {
    ["NODE_ENV", "NEXT_PUBLIC_DESIGN_PREVIEW", "NH_BOOKING_PREVIEW_DRAFTS"].forEach((key, index) => {
      if (previous[index] === undefined) delete process.env[key]; else process.env[key] = previous[index];
    });
  }
});

test("API saves, recovers and deletes allowlisted drafts with no-store and validates request bounds", async () => {
  const previous = process.env.NH_BOOKING_PREVIEW_DRAFTS;
  process.env.NH_BOOKING_PREVIEW_DRAFTS = "true";
  try {
    const value = draft();
    const saved = await api.POST(request("POST", JSON.stringify(value)));
    assert.equal(saved.status, 200);
    assert.match(saved.headers.get("cache-control"), /no-store/);
    assert.deepEqual(await saved.json(), { saved: true });
    const recovered = await api.GET(request("GET"));
    assert.deepEqual((await recovered.json()).draft, value);
    assert.equal((await api.GET(request("GET", undefined, { "x-nh-preview-token": "not-a-token" }))).status, 400);
    assert.equal((await api.POST(request("POST", JSON.stringify(value), { origin: "https://other.example" }))).status, 403);
    assert.equal((await api.POST(request("POST", JSON.stringify({ padding: "漢".repeat(4000) })))).status, 400);
    assert.equal((await api.POST(request("POST", "{}", { "content-type": "text/plain" }))).status, 400);
    assert.equal((await api.POST(request("POST", "{invalid-json"))).status, 400);
    await api.DELETE(request("DELETE"));
    assert.deepEqual(await (await api.GET(request("GET"))).json(), { draft: null });
  } finally {
    if (previous === undefined) delete process.env.NH_BOOKING_PREVIEW_DRAFTS; else process.env.NH_BOOKING_PREVIEW_DRAFTS = previous;
  }
});

test("client persists only a random tab token and serializes snapshots before recovery or deletion", async () => {
  const oldWindow = globalThis.window;
  const oldFetch = globalThis.fetch;
  const savedStorage = new Map();
  const requests = [];
  let releaseFirst;
  let count = 0;
  globalThis.window = { crypto: globalThis.crypto, setTimeout, clearTimeout, sessionStorage: { getItem: key => savedStorage.get(key) ?? null, setItem: (key, value) => savedStorage.set(key, value) } };
  globalThis.fetch = async (url, options) => {
    requests.push({ url, ...options });
    if (options.method === "POST" && count++ === 0) await new Promise(resolve => { releaseFirst = resolve; });
    return Response.json(options.method === "GET" ? { draft: null } : { saved: true });
  };
  try {
    const firstValue = draft();
    const first = client.saveDraft(firstValue);
    firstValue.patient.name = "Mutated after enqueue";
    const second = client.saveDraft({ ...draft(), patient: { ...patient, name: "Latest sample" } });
    const loading = client.loadDraft(doctor.id);
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.equal(requests.length, 1);
    releaseFirst();
    assert.equal(await first, true);
    assert.equal(await second, true);
    assert.equal(await loading, null);
    assert.deepEqual(requests.map(value => value.method), ["POST", "POST", "GET"]);
    assert.equal(JSON.parse(requests[0].body).patient.name, patient.name);
    assert.equal(JSON.parse(requests[1].body).patient.name, "Latest sample");
    assert.equal(requests[0].keepalive, true);
    assert.equal(requests[0].cache, "no-store");
    assert.ok(requests.every(value => !value.url.includes(patient.name) && !value.url.includes(patient.phone)));
    assert.deepEqual([...savedStorage.keys()], [client.PREVIEW_TOKEN_STORAGE_KEY]);
    assert.ok(client.validPreviewToken(savedStorage.get(client.PREVIEW_TOKEN_STORAGE_KEY)));
    assert.equal(JSON.stringify([...savedStorage]).includes(patient.phone), false);
    await client.clearDraft(doctor.id);
    assert.equal(requests.at(-1).method, "DELETE");
    globalThis.fetch = async () => { throw new Error("network"); };
    assert.equal(await client.saveDraft(draft()), false);
    await assert.rejects(client.loadDraft(doctor.id), /Preview recovery is unavailable/);
    await assert.rejects(client.clearDraft(doctor.id), /could not be cleared/);
  } finally { globalThis.fetch = oldFetch; if (oldWindow === undefined) delete globalThis.window; else globalThis.window = oldWindow; }
});
