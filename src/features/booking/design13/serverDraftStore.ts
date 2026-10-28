import { getDesign3BookingDoctor } from "../doctors";
import { parsePreviewDraft, validPreviewToken, type PreviewDraft } from "./draft";

export const PREVIEW_DRAFT_TTL_MS = 30 * 60 * 1000;
export const PREVIEW_DRAFT_CAPACITY = 256;
interface Entry { draft: PreviewDraft; expiresAt: number }

/** Process memory only: no patient record, database, filesystem or shared cache. */
export class PreviewDraftStore {
  private entries = new Map<string, Entry>();
  private timer: ReturnType<typeof setTimeout> | undefined;
  constructor(
    private clock: () => number = Date.now,
    private capacity = PREVIEW_DRAFT_CAPACITY,
  ) {}

  private key(token: string, doctorId: string) { return `${token.toLowerCase()}:${doctorId}`; }
  private prune() {
    const now = this.clock();
    for (const [key, entry] of this.entries) if (now >= entry.expiresAt) this.entries.delete(key);
  }
  private scheduleCleanup() {
    if (this.timer) clearTimeout(this.timer);
    if (!this.entries.size) { this.timer = undefined; return; }
    const deadline = Math.min(...Array.from(this.entries.values(), value => value.expiresAt));
    this.timer = setTimeout(() => { this.prune(); this.scheduleCleanup(); }, Math.max(1, deadline - this.clock()));
    this.timer.unref?.();
  }

  get(token: string, doctorId: string): PreviewDraft | null {
    this.prune();
    if (!validPreviewToken(token)) return null;
    const entry = this.entries.get(this.key(token, doctorId));
    return entry ? structuredClone(entry.draft) : null;
  }

  put(token: string, doctorId: string, value: unknown): "saved" | "invalid" | "full" {
    this.prune();
    if (!validPreviewToken(token)) return "invalid";
    const draft = parsePreviewDraft(value, doctorId);
    const doctor = getDesign3BookingDoctor(doctorId);
    if (!draft || !doctor) return "invalid";
    const hospitals = doctor.locations?.map(location => location.name) ?? [doctor.hospital];
    if (!hospitals.includes(draft.selection.hospital) && !(draft.selection.mode === "video" && draft.selection.hospital === "")) return "invalid";
    const now = this.clock();
    if (draft.hold && (draft.hold.createdAt <= 0 || draft.hold.createdAt > now + 5000)) return "invalid";
    if (draft.receipt && (draft.receipt.createdAt <= 0 || draft.receipt.createdAt > now + 5000)) return "invalid";
    const key = this.key(token, doctorId);
    const previous = this.entries.get(key);
    if (!previous && this.entries.size >= this.capacity) return "full";
    // Reads and repeated edits do not retain personal data indefinitely.
    this.entries.set(key, { draft, expiresAt: previous?.expiresAt ?? now + PREVIEW_DRAFT_TTL_MS });
    this.scheduleCleanup();
    return "saved";
  }

  delete(token: string, doctorId: string): void {
    if (validPreviewToken(token)) this.entries.delete(this.key(token, doctorId));
    this.scheduleCleanup();
  }

  dispose(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = undefined;
    this.entries.clear();
  }
}

// Reuse the same bounded store across development route recompiles.
const serverGlobal = globalThis as typeof globalThis & { __nhPreviewDraftStore?: PreviewDraftStore };
export const previewDraftStore = serverGlobal.__nhPreviewDraftStore ??= new PreviewDraftStore();
// HMR retains the instance and its entries, but its old methods capture the old
// parser. Refresh only the methods so new fields persist without resetting TTLs.
if (Object.getPrototypeOf(previewDraftStore) !== PreviewDraftStore.prototype) {
  Object.setPrototypeOf(previewDraftStore, PreviewDraftStore.prototype);
}

export function previewDraftApiEnabled(): boolean {
  return process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DESIGN_PREVIEW === "true" ||
    process.env.NH_BOOKING_PREVIEW_DRAFTS === "true";
}

export function sameOriginPreviewRequest(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  const origin = request.headers.get("origin");
  if (site !== null && site !== "same-origin") return false;
  if (origin !== null) {
    try { return origin === new URL(request.url).origin; }
    catch { return false; }
  }
  // Same-origin GET fetches can omit Origin. Writes require it.
  return request.method === "GET" && site === "same-origin";
}
