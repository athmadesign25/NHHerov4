import { normalizeAuthIdentity, type AuthIdentity } from "./auth";
import type { SavedPatient } from "../design14/patients";
import { defaultExistingPatients } from "../design14/patients";
import { EMPTY_PATIENT, getOrCreateHold, holdIsActive, parseStoredCheckout, sameSelection, type AppointmentSelection, type PatientDraft, type PaymentChoice, type PreviewReceipt, type SlotHold } from "../design7/model";

export type Design15Step = "patient" | "appointment" | "review" | "payment" | "confirmation";
export interface Design15Draft {
  version: 1;
  doctorId: string;
  identity: AuthIdentity | null;
  patients: SavedPatient[];
  selectedPatientId: string | null;
  selection: AppointmentSelection;
  payment: PaymentChoice;
  failureHold: SlotHold | null;
  receipt: PreviewReceipt | null;
  stage: Design15Step;
  discountCode?: string;
}

const object = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const boundedText = (value: unknown, max: number): value is string => typeof value === "string" && value.length <= max && !/[\u0000-\u001f\u007f]/.test(value);
export function parseIdentity(value: unknown): AuthIdentity | null {
  if (!object(value) || !boundedText(value.value, 160)) return null;
  return value.method === "mobile" || value.method === "email" ? normalizeAuthIdentity(value.method, value.value) : null;
}

export function patientForIdentity(identity: AuthIdentity, patient: PatientDraft = EMPTY_PATIENT): PatientDraft {
  return { ...patient, ...(identity.method === "mobile" ? { phone: identity.value } : { email: identity.value }) };
}
export function patientsForIdentity(identity: AuthIdentity): SavedPatient[] {
  return defaultExistingPatients(identity.method === "mobile" ? identity.value : "").map(entry => ({ ...entry, patient: patientForIdentity(identity, entry.patient) }));
}
export function patientErrors(patient: PatientDraft, identity: AuthIdentity | null): Record<string, string> {
  const errors: Record<string, string> = {};
  if (patient.name.trim().length < 2 || patient.name.trim().length > 80) errors.name = "Enter the patient’s full name.";
  if (!/^\d{1,3}$/.test(patient.age) || Number(patient.age) > 120) errors.age = "Enter an age from 0 to 120.";
  if (!["female", "male", "other"].includes(patient.gender)) errors.gender = "Select a gender.";
  if (!["self", "spouse", "child", "parent", "other"].includes(patient.relation)) errors.relation = "Choose a relationship.";
  if (patient.phone && !/^[6-9]\d{9}$/.test(patient.phone)) errors.phone = "Enter a valid mobile number.";
  if (patient.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patient.email)) errors.email = "Enter a valid email address.";
  if (!identity || (identity.method === "mobile" ? patient.phone !== identity.value : patient.email.toLowerCase() !== identity.value.toLowerCase())) errors.identity = "Log in to continue.";
  return errors;
}

/** Personal data is rebuilt field by field and belongs only in ephemeral server memory. */
export function parseDesign15Draft(value: unknown, doctorId: string): Design15Draft | null {
  if (!object(value) || value.version !== 1 || value.doctorId !== doctorId || !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/.test(doctorId) ||
    !object(value.selection) || !Array.isArray(value.patients) || value.patients.length > 10 ||
    (value.selectedPatientId !== null && !boundedText(value.selectedPatientId, 64)) ||
    (value.payment !== "online" && value.payment !== "hospital") ||
    typeof value.stage !== "string" || !["patient", "appointment", "review", "payment", "confirmation"].includes(value.stage)) return null;
  if (value.discountCode !== undefined && (!boundedText(value.discountCode, 32) || !/^[A-Z0-9_-]+$/.test(value.discountCode))) return null;
  const identity = value.identity === null ? null : parseIdentity(value.identity);
  if (value.identity !== null && !identity) return null;
  const emptyTime = value.selection.time === "";
  if (emptyTime && (value.failureHold !== null || value.receipt !== null)) return null;
  const checkout = parseStoredCheckout(JSON.stringify({ version: 1, selection: { ...value.selection, time: emptyTime ? "12:00 AM" : value.selection.time }, hold: value.failureHold, receipt: value.receipt }), doctorId);
  if (!checkout || (checkout.hold && checkout.receipt) || (value.payment === "hospital" && checkout.selection.mode !== "hospital") ||
    (checkout.receipt && checkout.receipt.payment !== value.payment)) return null;
  const patients: SavedPatient[] = [];
  const ids = new Set<string>();
  for (const entry of value.patients) {
    if (!object(entry) || !boundedText(entry.id, 64) || !/^[a-zA-Z0-9_-]+$/.test(entry.id) || ids.has(entry.id) || !object(entry.patient)) return null;
    const p = entry.patient;
    if (!boundedText(p.name, 80) || !boundedText(p.age, 3) || !boundedText(p.gender, 6) || !boundedText(p.relation, 8) || !boundedText(p.phone, 10) || !boundedText(p.email, 160)) return null;
    const patient = { name: p.name, age: p.age, gender: p.gender, relation: p.relation, phone: p.phone, email: p.email } as PatientDraft;
    if (Object.keys(patientErrors(patient, identity)).length) return null;
    patients.push({ id: entry.id, patient }); ids.add(entry.id);
  }
  if (value.selectedPatientId !== null && !ids.has(value.selectedPatientId)) return null;
  if (!identity && (patients.length || value.selectedPatientId || checkout.hold || checkout.receipt || !emptyTime)) return null;
  if (value.stage !== "patient" && (!identity || !value.selectedPatientId)) return null;
  if (["review", "payment", "confirmation"].includes(String(value.stage)) && emptyTime) return null;
  if (value.stage === "confirmation" && !checkout.receipt) return null;
  if (checkout.receipt && value.stage !== "confirmation") return null;
  if (value.stage === "payment" && value.payment !== "online") return null;
  return { version: 1, doctorId, identity, patients, selectedPatientId: value.selectedPatientId,
    selection: { ...checkout.selection, time: emptyTime ? "" : checkout.selection.time }, payment: value.payment,
    failureHold: checkout.hold, receipt: checkout.receipt, stage: value.stage as Design15Step,
    ...(typeof value.discountCode === "string" ? { discountCode: value.discountCode } : {}) };
}

/** Only a failed payment calls this. Repeated failures never extend the deadline. */
export function holdAfterPaymentFailure(previous: SlotHold | null, selection: AppointmentSelection, now = Date.now()): SlotHold {
  return getOrCreateHold(previous, selection, now);
}
export function failureHoldExpired(hold: SlotHold | null, selection: AppointmentSelection, now = Date.now()): boolean {
  return Boolean(hold && (!sameSelection(hold.selection, selection) || !holdIsActive(hold, selection, now)));
}
export function confirmDesign15(draft: Design15Draft, paid: boolean, available: boolean, now = Date.now()): PreviewReceipt | null {
  const patient = draft.patients.find(entry => entry.id === draft.selectedPatientId)?.patient;
  if (draft.payment === "online" ? draft.stage !== "payment" : draft.stage !== "review") return null;
  if (draft.receipt || !draft.identity || !patient || Object.keys(patientErrors(patient, draft.identity)).length || !available || !draft.selection.time ||
    failureHoldExpired(draft.failureHold, draft.selection, now) || (draft.payment === "online" && !paid) ||
    (draft.payment === "hospital" && draft.selection.mode !== "hospital")) return null;
  return { ref: `NH7-${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`, selection: { ...draft.selection }, createdAt: now, payment: draft.payment, status: "confirmed" };
}
