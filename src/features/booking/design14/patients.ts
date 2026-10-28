import type { PatientDraft } from "../design7/model";

export interface SavedPatient {
  id: string;
  patient: PatientDraft;
}

/** Local fixture identities; the contact number belongs to the current account. */
export function defaultExistingPatients(phone: string): SavedPatient[] {
  return [
    { id: "existing-self", patient: { name: "Alex Morgan", age: "32", gender: "other", relation: "self", phone, email: "" } },
    { id: "existing-child", patient: { name: "Jamie Morgan", age: "8", gender: "other", relation: "child", phone, email: "" } },
  ];
}

/** Account contact is applied at selection time, separately from patient identity. */
export function samePatientDetails(a: PatientDraft, b: PatientDraft): boolean {
  return a.name.trim() === b.name.trim() && a.age === b.age && a.gender === b.gender &&
    a.relation === b.relation && a.email.trim().toLowerCase() === b.email.trim().toLowerCase();
}
