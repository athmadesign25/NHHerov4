import { DEFAULT_MEMBERS } from "../familyMembers";
import type { SavedPatient } from "../design14/patients";
import type { PatientDraft } from "../design7/model";

export type BookingMember = Pick<PatientDraft, "name" | "age" | "gender" | "relation"> & { id: string };
export interface BookingMemberSelection { members: BookingMember[]; selectedId: string | null; confirmed?: boolean }
export function bookingMemberAvatar(member: BookingMember): string | undefined {
  return DEFAULT_MEMBERS.find(entry => member.id === `existing-${entry.relation}` && member.name === entry.name)?.img;
}
const initial: BookingMemberSelection = {
  members: DEFAULT_MEMBERS.map(member => ({ id: `existing-${member.relation}`, name: member.name, age: member.age ?? "", gender: member.gender ?? "", relation: member.relation })),
  selectedId: null,
};
// Session memory only: no names, health details or member IDs in URLs/browser storage.
let state = initial;
const listeners = new Set<() => void>();
const confirmations = new Set<symbol>();
export const getBookingMemberSelection = () => state;
export const getServerBookingMemberSelection = () => initial;
function publish(next: BookingMemberSelection) {
  if (JSON.stringify(next) === JSON.stringify(state)) return;
  state = next;
  listeners.forEach(listener => listener());
}
export function resetBookingMemberSelection() { publish(initial); }
/** Keep the receipt's patient read-only, including while confirmation navigation is pending. */
export function protectConfirmedBookingMember() {
  const owner = Symbol();
  confirmations.add(owner);
  publish({ ...state, confirmed: true });
  return () => {
    confirmations.delete(owner);
    if (!confirmations.size) publish({ ...state, confirmed: false });
  };
}
function clearWhenSignedOut() {
  let loggedIn = false;
  try { loggedIn = localStorage.getItem("isLoggedIn") === "true"; } catch { /* Storage can be unavailable. */ }
  try { loggedIn ||= sessionStorage.getItem("isLoggedIn") === "true"; } catch { /* Use the other store. */ }
  if (!loggedIn) resetBookingMemberSelection();
}
export function subscribeBookingMembers(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1 && typeof window !== "undefined") {
    window.addEventListener("login-state-changed", clearWhenSignedOut);
    window.addEventListener("storage", clearWhenSignedOut);
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size && typeof window !== "undefined") {
      window.removeEventListener("login-state-changed", clearWhenSignedOut);
      window.removeEventListener("storage", clearWhenSignedOut);
    }
  };
}
export function chooseBookingMember(id: string) {
  if (!state.confirmed && state.members.some(member => member.id === id)) publish({ ...state, selectedId: id });
}
export function rememberBookingMembers(patients: SavedPatient[], selectedId?: string | null) {
  const members = [...state.members];
  for (const entry of patients) {
    const { name, age, gender, relation } = entry.patient;
    const member = { id: entry.id, name, age, gender, relation };
    const index = members.findIndex(item => item.id === entry.id);
    if (index === -1) members.push(member); else members[index] = member;
  }
  publish({ ...state, members: members.slice(0, 10), selectedId: selectedId && members.some(member => member.id === selectedId) ? selectedId : state.selectedId });
}
