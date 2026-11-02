import { PREVIEW_TOKEN_HEADER, validPreviewToken } from "../design13/draft";
import { parseDesign20Draft, type Design20Draft } from "./model";

const TOKEN_KEY = "nh:d20:booking-token";
const memory = new Map<string, Design20Draft>();
const writes = new Map<string, Promise<boolean>>();
let volatileToken: string | undefined;

function token(): string {
  try {
    const stored = sessionStorage.getItem(TOKEN_KEY);
    if (stored && validPreviewToken(stored)) return stored;
    const next = volatileToken ??= crypto.randomUUID();
    sessionStorage.setItem(TOKEN_KEY, next);
    return next;
  } catch { return volatileToken ??= crypto.randomUUID(); }
}

async function request(doctorId: string, draft?: Design20Draft): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8000);
  try {
    return await fetch(`/api/booking-preview/design20?${new URLSearchParams({ doctorId })}`, {
      method: draft ? "POST" : "GET", body: draft ? JSON.stringify(draft) : undefined,
      credentials: "same-origin", mode: "same-origin", cache: "no-store", signal: controller.signal,
      headers: { [PREVIEW_TOKEN_HEADER]: token(), ...(draft ? { "Content-Type": "application/json" } : {}) },
    });
  } finally { window.clearTimeout(timeout); }
}

export function rememberDesign20Draft(draft: Design20Draft): void {
  const safe = parseDesign20Draft(draft);
  if (safe) memory.set(draft.doctorId, safe);
}

/** Only an opaque token enters browser storage, never patient details. */
export async function loadDesign20Draft(doctorId: string): Promise<Design20Draft | null> {
  const cached = memory.get(doctorId);
  if (cached) return cached;
  await writes.get(doctorId);
  try {
    const response = await request(doctorId);
    if (!response.ok) throw new Error("Draft unavailable");
    const value = await response.json();
    const draft = parseDesign20Draft(value.draft, doctorId);
    const current = memory.get(doctorId);
    if (current) return current;
    if (draft) memory.set(doctorId, draft);
    return draft;
  } catch { return memory.get(doctorId) ?? null; }
}

export async function saveDesign20Draft(draft: Design20Draft): Promise<boolean> {
  const safe = parseDesign20Draft(draft);
  if (!safe) return false;
  memory.set(draft.doctorId, safe);
  // Anonymous availability exploration is deliberately not an account draft or a reservation.
  if (!safe.identity) return true;
  const write = (writes.get(draft.doctorId) ?? Promise.resolve(true)).then(async () => {
    try { return (await request(draft.doctorId, safe)).ok; } catch { return false; }
  });
  writes.set(draft.doctorId, write);
  return write;
}
