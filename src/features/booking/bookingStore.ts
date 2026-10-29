// ─── BOOKING — MOCK PERSISTENCE LAYER ────────────────────────────────────────
// Stand-in for the booking API. A booking is created once, gets a stable
// reference, and the confirmation page looks it up by that reference — so the
// URL carries only `?ref=NH-XXXXXX` (no patient data) and a refresh shows the
// same booking.
//
// Storage is sessionStorage (tab-scoped, cleared when the tab closes) and holds
// only what the confirmation page needs. Free-text symptoms ("reason"), age and
// gender are deliberately NOT stored. Swap `saveBooking` / `readBooking*` for
// real API calls when the backend exists.

import type { ConsultationType, PatientRelation } from "./types";

export interface BookingRecord {
  ref: string;
  createdAt: string; // ISO timestamp
  doctorSlug: string;
  doctorName: string;
  speciality: string;
  consultationType: ConsultationType;
  hospital: string; // "" for video consultations
  date: string; // "YYYY-MM-DD"
  time: string; // "09:15 AM"
  patientName: string;
  relation: PatientRelation;
  fee: string;
}

const KEY_PREFIX = "nh:booking:";
// Unambiguous alphabet — no 0/O or 1/I/L.
const REF_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const REF_PATTERN = /^NH-[A-HJKMNP-Z2-9]{6}$/;

export function generateBookingRef(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return `NH-${Array.from(bytes, (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join("")}`;
}

export function saveBooking(input: Omit<BookingRecord, "ref" | "createdAt">): BookingRecord {
  const record: BookingRecord = {
    ...input,
    ref: generateBookingRef(),
    createdAt: new Date().toISOString(),
  };
  try {
    window.sessionStorage.setItem(KEY_PREFIX + record.ref, JSON.stringify(record));
  } catch {
    // Storage unavailable (private mode / quota) — confirmation will show the
    // "booking not found" state rather than crash.
  }
  return record;
}

/** Raw JSON for a booking ref, or null. Returns a string so it is a stable snapshot. */
export function readBookingRaw(ref: string): string | null {
  if (!REF_PATTERN.test(ref)) return null;
  try {
    return window.sessionStorage.getItem(KEY_PREFIX + ref);
  } catch {
    return null;
  }
}

const isString = (v: unknown): v is string => typeof v === "string";

export function parseBooking(raw: string | null): BookingRecord | null {
  if (!raw) return null;
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return null;
    const r = data as Record<string, unknown>;
    const ok =
      isString(r.ref) &&
      REF_PATTERN.test(r.ref) &&
      isString(r.createdAt) &&
      isString(r.doctorSlug) &&
      isString(r.doctorName) &&
      isString(r.speciality) &&
      (r.consultationType === "hospital" || r.consultationType === "video") &&
      isString(r.hospital) &&
      isString(r.date) &&
      isString(r.time) &&
      isString(r.patientName) &&
      isString(r.relation) &&
      isString(r.fee);
    return ok ? (data as BookingRecord) : null;
  } catch {
    return null;
  }
}
