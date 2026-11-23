import {
  parseStoredCheckout, validatePatient,
  type AppointmentSelection, type PatientDraft, type PaymentChoice, type PreviewReceipt, type SlotHold,
} from "../design7/model";
import type { SavedPatient } from "../design14/patients";

export interface PreviewDraft {
  version: 1;
  selection: AppointmentSelection;
  hold: SlotHold | null;
  receipt: PreviewReceipt | null;
  patient: PatientDraft;
  verifiedPhone: string;
  payment: PaymentChoice;
  savedPatients?: SavedPatient[];
}

export const PREVIEW_TOKEN_STORAGE_KEY = "nh:booking-preview:tab-token";
export const PREVIEW_TOKEN_HEADER = "x-nh-preview-token";
export const PREVIEW_DRAFT_MAX_BYTES = 8192;
export const validPreviewToken = (value: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
export const validPreviewDoctorId = (value: string): boolean => /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/.test(value);
const object = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown, max: number): value is string =>
  typeof value === "string" && value.length <= max && !/[\u0000-\u001f\u007f]/.test(value);

/** Allows incomplete form values, but only the named fields and a complete slot. */
export function parsePreviewDraft(value: unknown, doctorId: string): PreviewDraft | null {
  if (!validPreviewDoctorId(doctorId) || !object(value) || value.version !== 1 || !object(value.patient)) return null;
  const checkout = parseStoredCheckout(JSON.stringify({
    version: value.version, selection: value.selection, hold: value.hold, receipt: value.receipt,
  }), doctorId);
  if (!checkout || (checkout.hold && checkout.receipt)) return null;
  const p = value.patient;
  if (!text(p.name, 80) || !text(p.age, 3) || !/^\d{0,3}$/.test(p.age) ||
    typeof p.gender !== "string" || !["", "male", "female", "other"].includes(p.gender) ||
    typeof p.relation !== "string" || !["self", "spouse", "child", "parent", "other"].includes(p.relation) ||
    !text(p.phone, 10) || !/^\d{0,10}$/.test(p.phone) || !text(p.email, 160) ||
    !text(value.verifiedPhone, 10) ||
    (value.verifiedPhone !== "" && (!/^[6-9]\d{9}$/.test(value.verifiedPhone) || value.verifiedPhone !== p.phone)) ||
    (value.payment !== "online" && value.payment !== "hospital") ||
    (value.payment === "hospital" && checkout.selection.mode !== "hospital") ||
    (checkout.receipt && checkout.receipt.payment !== value.payment)) return null;
  let savedPatients: SavedPatient[] | undefined;
  if (value.savedPatients !== undefined) {
    if (!Array.isArray(value.savedPatients) || value.savedPatients.length > 10) return null;
    savedPatients = [];
    const ids = new Set<string>();
    for (const entry of value.savedPatients) {
      if (!object(entry) || !text(entry.id, 64) || !/^[a-zA-Z0-9_-]+$/.test(entry.id) || ids.has(entry.id) || !object(entry.patient)) return null;
      const saved = entry.patient;
      if (!text(saved.name, 80) || !text(saved.age, 3) || !text(saved.gender, 6) || !text(saved.relation, 8) ||
        !text(saved.phone, 10) || !text(saved.email, 160) || saved.phone !== value.verifiedPhone) return null;
      const patient: PatientDraft = {
        name: saved.name, age: saved.age, gender: saved.gender as PatientDraft["gender"],
        relation: saved.relation as PatientDraft["relation"], phone: saved.phone, email: saved.email,
      };
      if (Object.keys(validatePatient(patient, value.verifiedPhone)).length) return null;
      savedPatients.push({ id: entry.id, patient });
      ids.add(entry.id);
    }
  }
  return {
    ...checkout,
    patient: {
      name: p.name, age: p.age, gender: p.gender as PatientDraft["gender"],
      relation: p.relation as PatientDraft["relation"], phone: p.phone, email: p.email,
    },
    verifiedPhone: value.verifiedPhone, payment: value.payment,
    ...(savedPatients ? { savedPatients } : {}),
  };
}

function tabToken(): string {
  if (typeof window === "undefined") throw new Error("Preview recovery is unavailable.");
  const previous = window.sessionStorage.getItem(PREVIEW_TOKEN_STORAGE_KEY);
  if (previous && validPreviewToken(previous)) return previous;
  const token = window.crypto.randomUUID();
  window.sessionStorage.setItem(PREVIEW_TOKEN_STORAGE_KEY, token);
  return token;
}

const pendingWrites = new Map<string, Promise<void>>();
function enqueue<T>(doctorId: string, operation: () => Promise<T>): Promise<T> {
  const result = (pendingWrites.get(doctorId) ?? Promise.resolve()).then(operation);
  const settled = result.then(() => undefined, () => undefined);
  pendingWrites.set(doctorId, settled);
  void settled.then(() => { if (pendingWrites.get(doctorId) === settled) pendingWrites.delete(doctorId); });
  return result;
}

async function requestDraft(doctorId: string, method: "GET" | "POST" | "DELETE", body?: string): Promise<Response> {
  if (!validPreviewDoctorId(doctorId)) throw new Error("Preview recovery is unavailable.");
  const token = tabToken();
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 8000);
  try {
    return await fetch(`/api/booking-preview/draft?${new URLSearchParams({ doctorId })}`, {
      method, body, mode: "same-origin", credentials: "same-origin", cache: "no-store",
      keepalive: method !== "GET", signal: controller.signal,
      headers: {
        [PREVIEW_TOKEN_HEADER]: token,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
    });
  } finally { window.clearTimeout(timer); }
}

/** Null means no saved draft. Failures throw without including patient data. */
export async function loadDraft(doctorId: string): Promise<PreviewDraft | null> {
  try {
    await pendingWrites.get(doctorId);
    const response = await requestDraft(doctorId, "GET");
    if (!response.ok) throw new Error();
    const value: unknown = await response.json();
    if (!object(value) || !("draft" in value)) throw new Error();
    if (value.draft === null) return null;
    const draft = parsePreviewDraft(value.draft, doctorId);
    if (!draft) throw new Error();
    return draft;
  } catch { throw new Error("Preview recovery is unavailable. Keep this page open to continue."); }
}

/** Snapshot before queueing so later form changes cannot mutate an older save. */
export async function saveDraft(draft: PreviewDraft): Promise<boolean> {
  try {
    const safe = parsePreviewDraft(draft, draft.selection.doctorId);
    if (!safe) return false;
    const body = JSON.stringify(safe);
    if (new TextEncoder().encode(body).byteLength > PREVIEW_DRAFT_MAX_BYTES) return false;
    return await enqueue(safe.selection.doctorId, async () => {
      try { return (await requestDraft(safe.selection.doctorId, "POST", body)).ok; }
      catch { return false; }
    });
  } catch { return false; }
}

export async function clearDraft(doctorId: string): Promise<void> {
  return enqueue(doctorId, async () => {
    try {
      if (!(await requestDraft(doctorId, "DELETE")).ok) throw new Error();
    } catch { throw new Error("The preview draft could not be cleared."); }
  });
}
