import type { ConsultationType, Gender, PatientRelation } from "../types";

export const HOLD_DURATION_MS = 15 * 60 * 1000;
export const DEMO_VERIFICATION_CODE = "123456";

export interface AppointmentSelection {
  doctorId: string;
  mode: ConsultationType;
  hospital: string;
  date: string;
  time: string;
}

export interface PatientDraft {
  name: string;
  age: string;
  gender: Gender | "";
  relation: PatientRelation;
  phone: string;
  email: string;
}

export const EMPTY_PATIENT: PatientDraft = {
  name: "", age: "", gender: "", relation: "self", phone: "", email: "",
};

export interface SlotHold {
  id: string;
  selection: AppointmentSelection;
  createdAt: number;
  expiresAt: number;
}

export type PaymentChoice = "online" | "hospital";

export interface PreviewReceipt {
  ref: string;
  selection: AppointmentSelection;
  createdAt: number;
  payment: PaymentChoice;
  status: "confirmed" | "cancelled";
}

/** No name, contact information, age, gender or free text belongs in this shape. */
export interface StoredCheckout {
  version: 1;
  selection: AppointmentSelection;
  hold: SlotHold | null;
  receipt: PreviewReceipt | null;
}

export const sameSelection = (a: AppointmentSelection, b: AppointmentSelection): boolean =>
  a.doctorId === b.doctorId && a.mode === b.mode && a.hospital === b.hospital &&
  a.date === b.date && a.time === b.time;

export const holdIsActive = (hold: SlotHold | null, selection: AppointmentSelection, now = Date.now()): boolean =>
  Boolean(hold && sameSelection(hold.selection, selection) && now >= hold.createdAt && now < hold.expiresAt);

/** Re-entering review, retrying and refreshing must never extend an existing hold. */
export function getOrCreateHold(previous: SlotHold | null, selection: AppointmentSelection, now = Date.now()): SlotHold {
  if (previous && sameSelection(previous.selection, selection)) return previous;
  return { id: crypto.randomUUID(), selection: { ...selection }, createdAt: now, expiresAt: now + HOLD_DURATION_MS };
}

export function remainingHoldSeconds(hold: SlotHold | null, now = Date.now()): number {
  return hold ? Math.max(0, Math.ceil((hold.expiresAt - now) / 1000)) : 0;
}

export function createPreviewReceipt(
  hold: SlotHold | null, selection: AppointmentSelection, payment: PaymentChoice,
  gatewaySucceeded: boolean, slotAvailable: boolean, now = Date.now(),
): PreviewReceipt | null {
  if (!slotAvailable || !holdIsActive(hold, selection, now)) return null;
  if (payment === "online" && !gatewaySucceeded) return null;
  if (payment === "hospital" && selection.mode !== "hospital") return null;
  return {
    ref: `NH7-${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`,
    selection: { ...selection }, createdAt: now, payment, status: "confirmed",
  };
}

export function validatePatient(patient: PatientDraft, verifiedPhone: string): Record<string, string> {
  const errors: Record<string, string> = {};
  if (patient.name.trim().length < 2 || patient.name.trim().length > 80) errors.name = "Enter the patient's full name (2–80 characters).";
  if (!/^\d{1,3}$/.test(patient.age) || Number(patient.age) > 120) errors.age = "Enter an age from 0 to 120.";
  if (!["male", "female", "other"].includes(patient.gender)) errors.gender = "Select the patient's gender.";
  if (!["self", "spouse", "child", "parent", "other"].includes(patient.relation)) errors.relation = "Choose who the appointment is for.";
  if (!/^[6-9]\d{9}$/.test(patient.phone)) errors.phone = "Enter a valid 10-digit Indian mobile number.";
  else if (patient.phone !== verifiedPhone) errors.phone = "Complete the demo mobile verification to continue.";
  if (patient.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patient.email.trim())) errors.email = "Enter a valid email address or leave it blank.";
  return errors;
}

const object = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const string = (value: unknown): value is string => typeof value === "string" && value.length <= 500;

function parseSelection(value: unknown): AppointmentSelection | null {
  if (!object(value) || !string(value.doctorId) || !value.doctorId || !string(value.hospital) ||
    !string(value.date) || !string(value.time) || (value.mode !== "hospital" && value.mode !== "video")) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.date) || !/^\d{2}:\d{2} (AM|PM)$/.test(value.time)) return null;
  const [year, month, day] = value.date.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  const [hours, minutes] = value.time.slice(0, 5).split(":").map(Number);
  if (hours < 1 || hours > 12 || minutes > 59) return null;
  return { doctorId: value.doctorId, mode: value.mode, hospital: value.hospital, date: value.date, time: value.time };
}

/** Rebuild the allowlisted shape; extra fields can never be copied into storage. */
export function parseStoredCheckout(raw: string | null, doctorId: string): StoredCheckout | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!object(value) || value.version !== 1) return null;
    const selection = parseSelection(value.selection);
    if (!selection || selection.doctorId !== doctorId) return null;
    let hold: SlotHold | null = null;
    if (value.hold !== null) {
      if (!object(value.hold)) return null;
      const h = value.hold;
      const heldSelection = parseSelection(h.selection);
      if (!heldSelection || !sameSelection(selection, heldSelection) || !string(h.id) ||
        typeof h.createdAt !== "number" || !Number.isFinite(h.createdAt) ||
        typeof h.expiresAt !== "number" || !Number.isFinite(h.expiresAt) ||
        h.expiresAt - h.createdAt !== HOLD_DURATION_MS) return null;
      hold = { id: h.id, selection: heldSelection, createdAt: h.createdAt, expiresAt: h.expiresAt };
    }
    let receipt: PreviewReceipt | null = null;
    if (value.receipt !== null) {
      if (!object(value.receipt)) return null;
      const r = value.receipt;
      const receiptSelection = parseSelection(r.selection);
      if (!receiptSelection || !sameSelection(selection, receiptSelection) ||
        !string(r.ref) || !/^NH7-[A-F0-9]{8}$/.test(r.ref) ||
        typeof r.createdAt !== "number" || !Number.isFinite(r.createdAt) ||
        (r.payment !== "online" && r.payment !== "hospital") ||
        (r.status !== "confirmed" && r.status !== "cancelled") ||
        (r.payment === "hospital" && selection.mode !== "hospital")) return null;
      receipt = { ref: r.ref, selection: receiptSelection, createdAt: r.createdAt, payment: r.payment, status: r.status };
    }
    return { version: 1, selection, hold, receipt };
  } catch { return null; }
}

// Keep the original key: all visual journeys share one deadline and receipt.
export const checkoutStorageKey = (doctorId: string) => `nh:d7:checkout:${doctorId}`;

export function readCheckout(doctorId: string): StoredCheckout | null {
  try { return parseStoredCheckout(window.sessionStorage.getItem(checkoutStorageKey(doctorId)), doctorId); }
  catch { return null; }
}

export function storeCheckout(checkout: StoredCheckout): boolean {
  try {
    const safe = parseStoredCheckout(JSON.stringify(checkout), checkout.selection.doctorId);
    if (!safe) return false;
    window.sessionStorage.setItem(checkoutStorageKey(safe.selection.doctorId), JSON.stringify(safe));
    return true;
  } catch { return false; }
}

export function clearCheckout(doctorId: string): void {
  try { window.sessionStorage.removeItem(checkoutStorageKey(doctorId)); } catch { /* In-memory flow still works. */ }
}

/** An explicitly labelled preview event. It contains no patient identity. */
export function receiptCalendar(receipt: PreviewReceipt, doctorName: string): string {
  const [time, period] = receipt.selection.time.split(" ");
  const [hours, minutes] = time.split(":").map(Number);
  const [year, month, day] = receipt.selection.date.split("-").map(Number);
  // NH appointments use India time. UTC prevents calendar apps interpreting
  // a floating start time in the viewer's own timezone.
  const start = new Date(Date.UTC(year, month - 1, day, hours % 12 + (period === "PM" ? 12 : 0) - 5, minutes - 30))
    .toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const escape = (value: string) => value.replaceAll("\\", "\\\\").replaceAll("\n", "\\n").replaceAll(",", "\\,").replaceAll(";", "\\;");
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Narayana Health//Appointment Preview//EN", "BEGIN:VEVENT",
    `UID:${receipt.ref}@preview.narayanahealth.org`, `DTSTAMP:${new Date(receipt.createdAt).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}`,
    `DTSTART:${start}`, "DURATION:PT30M", `SUMMARY:${escape(`PREVIEW ONLY — ${doctorName}`)}`,
    `LOCATION:${escape(receipt.selection.mode === "video" ? "Video consultation preview" : receipt.selection.hospital)}`,
    "DESCRIPTION:Design preview only. No real appointment has been booked.", "STATUS:TENTATIVE", "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}
