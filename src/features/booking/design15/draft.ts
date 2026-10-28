import { PREVIEW_TOKEN_HEADER, PREVIEW_TOKEN_STORAGE_KEY, validPreviewToken } from "../design13/draft";
import { parseDesign15Draft, type Design15Draft } from "./model";
import type { AppointmentSelection } from "../design7/model";

export const DESIGN15_DRAFT_MAX_BYTES = 12 * 1024;
const writes = new Map<string, Promise<void>>();
function token(): string {
  const stored = window.sessionStorage.getItem(PREVIEW_TOKEN_STORAGE_KEY);
  if (stored && validPreviewToken(stored)) return stored;
  const next = window.crypto.randomUUID();
  window.sessionStorage.setItem(PREVIEW_TOKEN_STORAGE_KEY, next);
  return next;
}
async function request(doctorId: string, body?: string): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 8000);
  try { return await fetch(`/api/booking-preview/design15?${new URLSearchParams({ doctorId })}`, {
    method: body ? "POST" : "GET", body, mode: "same-origin", credentials: "same-origin", cache: "no-store",
    keepalive: Boolean(body), signal: controller.signal,
    headers: { [PREVIEW_TOKEN_HEADER]: token(), ...(body ? { "Content-Type": "application/json" } : {}) },
  }); } finally { window.clearTimeout(timer); }
}
export async function loadDesign15Draft(doctorId: string, fallbackSelection?: AppointmentSelection): Promise<Design15Draft | null> {
  await writes.get(doctorId);
  const response = await request(doctorId);
  if (!response.ok) throw new Error("Draft recovery is unavailable.");
  const value = await response.json();
  const draft = value.draft === null ? null : parseDesign15Draft(value.draft, doctorId);
  if (value.draft !== null && !draft) throw new Error("Draft recovery is unavailable.");
  if (!fallbackSelection || !value.account) return draft;
  const accountDraft = parseDesign15Draft({ version: 1, doctorId, identity: value.account.identity, patients: value.account.patients,
    selectedPatientId: null, selection: { ...fallbackSelection, time: "" }, payment: "online", failureHold: null, receipt: null, stage: "patient" }, doctorId);
  if (!accountDraft) throw new Error("Draft recovery is unavailable.");
  if (!draft || draft.identity?.method !== accountDraft.identity?.method || draft.identity?.value.toLowerCase() !== accountDraft.identity?.value.toLowerCase()) return accountDraft;
  const selectedExists = !draft.selectedPatientId || accountDraft.patients.some(entry => entry.id === draft.selectedPatientId);
  if (!selectedExists) return accountDraft;
  return { ...draft, identity: accountDraft.identity, patients: accountDraft.patients };
}
export async function saveDesign15Draft(value: Design15Draft): Promise<boolean> {
  const safe = parseDesign15Draft(value, value.doctorId);
  if (!safe) return false;
  const body = JSON.stringify(safe);
  if (new TextEncoder().encode(body).byteLength > DESIGN15_DRAFT_MAX_BYTES) return false;
  const result = (writes.get(value.doctorId) ?? Promise.resolve()).then(async () => {
    try { return (await request(value.doctorId, body)).ok; } catch { return false; }
  });
  const settled = result.then(() => undefined, () => undefined);
  writes.set(value.doctorId, settled);
  void settled.then(() => { if (writes.get(value.doctorId) === settled) writes.delete(value.doctorId); });
  return result;
}
