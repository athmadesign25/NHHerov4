import { getDesign3BookingDoctor } from "../doctors";
import { validPreviewToken } from "../design13/draft";
import { parseDesign15Draft, type Design15Draft } from "./model";

export const DESIGN15_DRAFT_MAX_BYTES = 12 * 1024;
export const DESIGN15_DRAFT_TTL_MS = 30 * 60 * 1000;
const CAPACITY = 256;
interface Entry { draft: Design15Draft; expiresAt: number; updatedAt: number }

/** Bounded process memory for the local booking prototype; never browser PII storage. */
export class Design15DraftStore {
  private entries = new Map<string, Entry>();
  private timer: ReturnType<typeof setTimeout> | undefined;
  constructor(private clock: () => number = Date.now, private capacity = CAPACITY) {}
  private key(token: string, doctorId: string) { return `${token.toLowerCase()}:${doctorId}`; }
  private prune() {
    for (const [key, entry] of this.entries) if (this.clock() >= entry.expiresAt) this.entries.delete(key);
  }
  private scheduleCleanup() {
    if (this.timer) clearTimeout(this.timer);
    if (!this.entries.size) { this.timer = undefined; return; }
    const deadline = Math.min(...Array.from(this.entries.values(), entry => entry.expiresAt));
    this.timer = setTimeout(() => { this.prune(); this.scheduleCleanup(); }, Math.max(1, deadline - this.clock()));
    this.timer.unref?.();
  }
  get(token: string, doctorId: string): Design15Draft | null {
    this.prune();
    if (!validPreviewToken(token)) return null;
    const entry = this.entries.get(this.key(token, doctorId));
    return entry ? structuredClone(entry.draft) : null;
  }
  account(token: string): Pick<Design15Draft, "identity" | "patients"> | null {
    this.prune();
    if (!validPreviewToken(token)) return null;
    const prefix = `${token.toLowerCase()}:`;
    let latest: Entry | undefined;
    for (const [key, entry] of this.entries) {
      if (key.startsWith(prefix) && (!latest || (entry.updatedAt ?? 0) >= (latest.updatedAt ?? 0))) latest = entry;
    }
    return latest?.draft.identity ? structuredClone({ identity: latest.draft.identity, patients: latest.draft.patients }) : null;
  }
  put(token: string, doctorId: string, value: unknown): "saved" | "invalid" | "full" {
    this.prune();
    if (!validPreviewToken(token)) return "invalid";
    const draft = parseDesign15Draft(value, doctorId);
    const doctor = getDesign3BookingDoctor(doctorId);
    if (!draft || !doctor) return "invalid";
    const locations = doctor.locations?.map(location => location.name) ?? [doctor.hospital];
    if (!locations.includes(draft.selection.hospital) && !(draft.selection.mode === "video" && draft.selection.hospital === "")) return "invalid";
    const now = this.clock();
    if (draft.failureHold && (draft.failureHold.createdAt <= 0 || draft.failureHold.createdAt > now + 5000)) return "invalid";
    if (draft.receipt && (draft.receipt.createdAt <= 0 || draft.receipt.createdAt > now + 5000)) return "invalid";
    const key = this.key(token, doctorId);
    const existing = this.entries.get(key);
    if (!existing && this.entries.size >= this.capacity) return "full";
    this.entries.set(key, { draft, expiresAt: existing?.expiresAt ?? now + DESIGN15_DRAFT_TTL_MS, updatedAt: now });
    this.scheduleCleanup();
    return "saved";
  }
  delete(token: string, doctorId: string) {
    if (validPreviewToken(token)) this.entries.delete(this.key(token, doctorId));
    this.scheduleCleanup();
  }
  dispose() { if (this.timer) clearTimeout(this.timer); this.timer = undefined; this.entries.clear(); }
}

const serverState = globalThis as typeof globalThis & { __nhDesign15DraftStore?: Design15DraftStore };
export const design15DraftStore = serverState.__nhDesign15DraftStore ??= new Design15DraftStore();
// Preserve active journeys while adopting updated parsers during local hot reload.
if (Object.getPrototypeOf(design15DraftStore) !== Design15DraftStore.prototype) {
  Object.setPrototypeOf(design15DraftStore, Design15DraftStore.prototype);
}
