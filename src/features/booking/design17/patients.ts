import { DEFAULT_MEMBERS } from "../familyMembers";
import type { SavedPatient } from "../design14/patients";
import type { AuthIdentity } from "../design15/auth";
import { patientForIdentity } from "../design15/model";

/** The same presentation fixtures used by Design 16, with account contact applied separately. */
export function design17Patients(identity: AuthIdentity, existing: SavedPatient[] = []): SavedPatient[] {
  const defaults = DEFAULT_MEMBERS.map(member => ({
    id: `existing-${member.relation}`,
    patient: patientForIdentity(identity, { name: member.name, age: member.age ?? "", gender: member.gender ?? "", relation: member.relation, phone: "", email: "" }),
  }));
  const upgraded = existing.map(entry => {
    const legacy = (entry.id === "existing-self" && entry.patient.name === "Alex Morgan") || (entry.id === "existing-child" && entry.patient.name === "Jamie Morgan");
    return legacy ? defaults.find(item => item.id === entry.id)! : entry;
  });
  return [...upgraded, ...defaults.filter(item => !upgraded.some(entry => entry.id === item.id))].slice(0, 10);
}

export function design17PatientAvatar(entry: SavedPatient | undefined): string | undefined {
  return DEFAULT_MEMBERS.find(member => entry?.id === `existing-${member.relation}` && entry.patient.name === member.name)?.img;
}
