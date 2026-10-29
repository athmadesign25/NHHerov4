import type { AppointmentSelection, PaymentChoice, PreviewReceipt } from "../design7/model";
import { sameSelection } from "../design7/model";
import type { BookingDoctorSummary } from "../types";
import { appointmentDates, DESIGN16_BOOKING_DAYS } from "../appointmentTime";
import { getDesign3BookingSlots, isDesign3BookingSlotAvailable } from "../design3Availability";
import { confirmDesign15, failureHoldExpired, parseDesign15Draft, patientErrors, type Design15Draft, type Design15Step } from "../design15/model";
import type { AuthIdentity } from "../design15/auth";
import { design17Patients } from "../design17/patients";
import { design17ListingReturnTo } from "@/features/search/design17Navigation";
import { defaultSponsorshipForPatient, design20Pricing, isSponsorshipId, type SponsorshipId } from "./pricing";

export type Design20Phase = "slots" | "auth" | "member";
export interface Design20Draft extends Design15Draft {
  /** undefined: legacy/unselected; null: explicitly no benefit. */
  sponsorshipId?: SponsorshipId | null;
  /** An account-level preference, independent of the selected member. */
  useHealthCredits?: boolean;
}

/** Default only an unanswered member choice; returning bookings keep every explicit choice. */
export function design20DefaultMember(draft: Design20Draft, authenticated: boolean): Design20Draft {
  if (!authenticated || !draft.identity || draft.receipt) return draft;
  const members = draft.patients.filter(entry => Object.keys(patientErrors(entry.patient, draft.identity)).length === 0);
  const chosen = members.find(entry => entry.id === draft.selectedPatientId);
  const member = chosen ?? members.find(entry => entry.id === "existing-self" && entry.patient.relation === "self")
    ?? members.find(entry => entry.patient.relation === "self") ?? members[0];
  if (!member) return draft;
  return { ...draft, selectedPatientId: member.id,
    sponsorshipId: chosen && draft.sponsorshipId !== undefined ? draft.sponsorshipId : defaultSponsorshipForPatient(member),
    stage: draft.stage === "patient" ? "appointment" : draft.stage };
}

/** A new account starts with its own primary member and the online payment default. */
export function design20SignedInDraft(draft: Design20Draft, identity: AuthIdentity): Design20Draft {
  if (draft.receipt) return draft;
  const sameAccount = draft.identity?.method === identity.method && draft.identity.value === identity.value;
  return design20DefaultMember({ ...draft, identity, patients: design17Patients(identity, sameAccount ? draft.patients : []),
    selectedPatientId: sameAccount ? draft.selectedPatientId : null, stage: "patient",
    sponsorshipId: sameAccount ? draft.sponsorshipId : undefined, discountCode: sameAccount ? draft.discountCode : undefined,
    useHealthCredits: sameAccount ? draft.useHealthCredits : undefined, payment: sameAccount ? draft.payment : "online" }, true);
}

/** The restored featured IDs keep their D20 affiliations throughout the booking journey. */
export function design20Available(selection: AppointmentSelection, now = Date.now()): boolean {
  return Boolean(selection.time) && isDesign3BookingSlotAvailable(selection.doctorId, selection.date, selection.time,
    selection.mode, selection.hospital, new Date(now), DESIGN16_BOOKING_DAYS, "d20");
}

export function design20RequestedSelection(doctor: BookingDoctorSummary, params: URLSearchParams, now = Date.now()): AppointmentSelection {
  const locations = doctor.locations ?? [{ name: doctor.hospital, city: doctor.city }];
  const hospital = locations.find(location => location.name === params.get("hospital"))?.name ?? doctor.hospital;
  const mode = params.get("mode") === "video" ? "video" : "hospital";
  const dates = appointmentDates(now, DESIGN16_BOOKING_DAYS);
  const requested = params.get("date");
  const date = requested && dates.includes(requested) ? requested
    : dates.find(day => getDesign3BookingSlots(doctor.id, day, mode, hospital, new Date(now), DESIGN16_BOOKING_DAYS, "d20").some(slot => slot.available)) ?? dates[0];
  return { doctorId: doctor.id, mode, hospital, date, time: "" };
}

export function confirmDesign20(draft: Design20Draft, authenticated: boolean, paid: boolean, now = Date.now()): PreviewReceipt | null {
  return authenticated ? confirmDesign15(draft, paid, design20Available(draft.selection, now), now) : null;
}

/** The member page is also the booking summary; no separate review step is needed. */
export function design20PaymentDraft(draft: Design20Draft, payment: PaymentChoice, authenticated: boolean, now = Date.now()): Design20Draft | null {
  const member = draft.patients.find(entry => entry.id === draft.selectedPatientId)?.patient;
  if (!authenticated || !draft.identity || !member || Object.keys(patientErrors(member, draft.identity)).length || draft.receipt ||
    !design20Available(draft.selection, now) || failureHoldExpired(draft.failureHold, draft.selection, now) ||
    (payment === "hospital" && draft.selection.mode !== "hospital")) return null;
  return { ...draft, payment, stage: payment === "online" ? "payment" : "review" };
}

/** A fully covered booking confirms directly, without ever opening the payment gateway. */
export function design20PaymentIntent(draft: Design20Draft, payment: PaymentChoice, fee: string, authenticated: boolean, now = Date.now()) {
  const next = design20PaymentDraft(draft, payment, authenticated, now);
  if (!next) return null;
  const pricing = design20Pricing(fee, next.discountCode, next.sponsorshipId, next.useHealthCredits);
  return { draft: next, destination: pricing.minorUnits.total === 0 ? "covered" as const : payment === "online" ? "gateway" as const : "hospital" as const };
}

export function design20HealthCreditDraft(draft: Design20Draft, enabled: boolean, authenticated: boolean): Design20Draft | null {
  if (!authenticated || !draft.identity || draft.receipt || draft.stage === "payment" || typeof enabled !== "boolean") return null;
  return { ...draft, useHealthCredits: enabled };
}

/** Dismissing payment returns to the same summary; an expired time needs a fresh choice. */
export function design20SummaryDraft(draft: Design20Draft, now = Date.now()): Design20Draft {
  if (draft.receipt) return draft;
  const available = design20Available(draft.selection, now) && !failureHoldExpired(draft.failureHold, draft.selection, now);
  return { ...draft, stage: draft.identity && draft.selectedPatientId ? "appointment" : "patient",
    selection: available ? draft.selection : { ...draft.selection, time: "" },
    failureHold: available ? draft.failureHold : null };
}

/** Save an editor's complete appointment atomically, keeping member and discount choices. */
export function design20SavedAppointment(draft: Design20Draft, selection: AppointmentSelection, authenticated: boolean, now = Date.now()): Design20Draft | null {
  if (!authenticated || !draft.identity || draft.receipt || selection.doctorId !== draft.doctorId || !design20Available(selection, now)) return null;
  const failureHold = draft.failureHold && sameSelection(draft.failureHold.selection, selection) ? draft.failureHold : null;
  if (failureHoldExpired(failureHold, selection, now)) return null;
  return { ...draft, selection: { ...selection }, failureHold,
    stage: draft.selectedPatientId ? "appointment" : "patient", payment: selection.mode === "video" ? "online" : draft.payment };
}

/** Browser Back from the summary restores its edited choices; explicit listing actions keep their own context. */
export function design20CanRestoreSelection(saved: Design15Draft | null, requested: AppointmentSelection, dateExplicit: boolean, resume = false, returnFromSummary = false): boolean {
  return Boolean(saved && saved.doctorId === requested.doctorId && !saved.receipt && (returnFromSummary || (
    saved.selection.mode === requested.mode && saved.selection.hospital === requested.hospital &&
    (resume || !dateExplicit || saved.selection.date === requested.date)
  )));
}

/** Guest choices are kept in application memory; account details use the server draft store. */
export function parseDesign20Draft(value: unknown, expectedDoctorId?: string): Design20Draft | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.doctorId !== "string" || (expectedDoctorId !== undefined && raw.doctorId !== expectedDoctorId)) return null;
  const sponsorshipId = raw.sponsorshipId;
  if (sponsorshipId !== undefined && sponsorshipId !== null && !isSponsorshipId(sponsorshipId)) return null;
  if (sponsorshipId && (!raw.identity || !raw.selectedPatientId)) return null;
  const useHealthCredits = raw.useHealthCredits;
  if (useHealthCredits !== undefined && typeof useHealthCredits !== "boolean") return null;
  if (useHealthCredits && !raw.identity) return null;
  if (raw.identity) {
    const safe = parseDesign15Draft(raw, raw.doctorId);
    return safe ? { ...safe, ...(sponsorshipId !== undefined ? { sponsorshipId } : {}), ...(useHealthCredits !== undefined ? { useHealthCredits } : {}) } : null;
  }
  if (raw.stage !== "patient" || !Array.isArray(raw.patients) || raw.patients.length || raw.selectedPatientId || raw.failureHold || raw.receipt ||
    typeof raw.selection !== "object" || raw.selection === null || Array.isArray(raw.selection)) return null;
  const selection = raw.selection as Record<string, unknown>;
  const time = selection.time;
  if (typeof time !== "string" || (time && !/^(0[1-9]|1[0-2]):[0-5]\d [AP]M$/.test(time))) return null;
  const safe = parseDesign15Draft({ ...raw, selection: { ...selection, time: "" } }, raw.doctorId);
  return safe ? { ...safe, selection: { ...safe.selection, time } } : null;
}

export function design20ListingReturnTo(returnTo: string): string {
  const safe = new URL(design17ListingReturnTo(returnTo, "d17-lite"), "https://nh.local");
  safe.searchParams.set("design", "d20");
  safe.searchParams.delete("booking");
  safe.searchParams.delete("bookingMode");
  safe.searchParams.delete("bookingResume");
  safe.searchParams.delete("hospital");
  safe.searchParams.delete("date");
  safe.searchParams.delete("step");
  safe.searchParams.delete("ref");
  safe.searchParams.delete("time");
  return `${safe.pathname}?${safe.searchParams}`;
}

export function design20InlineUrl(draft: Design15Draft, returnTo: string): string {
  const url = new URL(design20ListingReturnTo(returnTo), "https://nh.local");
  url.searchParams.set("booking", draft.doctorId);
  // The summary can edit this appointment after the listing history entry was
  // created. On Back, prefer the saved draft over the entry's older context.
  url.searchParams.set("bookingResume", "1");
  // The directory's consultation filter and the selected card's choice are
  // independent. Returning from review must not refilter neighbouring cards.
  url.searchParams.set("bookingMode", draft.selection.mode);
  url.searchParams.set("hospital", draft.selection.hospital);
  url.searchParams.set("date", draft.selection.date);
  return `${url.pathname}?${url.searchParams}`;
}

export function design20FlowUrl(draft: Design15Draft, returnTo: string): string {
  const params = new URLSearchParams({ design: "d20", returnTo: design20ListingReturnTo(returnTo),
    mode: draft.selection.mode, hospital: draft.selection.hospital, date: draft.selection.date });
  if (draft.receipt) {
    params.set("ref", draft.receipt.ref);
    return `/doctors/${encodeURIComponent(draft.doctorId)}/book/confirmation?${params}`;
  }
  params.set("step", draft.stage);
  return `/doctors/${encodeURIComponent(draft.doctorId)}/book?${params}`;
}

/** A time click never authenticates. Only the explicit continuation asks for sign-in. */
export function design20ContinuePhase(draft: Design15Draft, authenticated: boolean, now = Date.now()): Design20Phase {
  if (!design20Available(draft.selection, now) || failureHoldExpired(draft.failureHold, draft.selection, now)) return "slots";
  return authenticated ? "member" : "auth";
}

export function design20SafeStep(requested: string | null, draft: Design15Draft, authenticated: boolean, now = Date.now()): Design15Step {
  if (!authenticated || !draft.identity || !draft.selectedPatientId) return "patient";
  if (draft.receipt) return "confirmation";
  if (requested === "patient") return "patient";
  if (!design20Available(draft.selection, now) || failureHoldExpired(draft.failureHold, draft.selection, now) || requested === "appointment") return "appointment";
  return requested === "payment" && draft.payment === "online" ? "payment" : "review";
}

/** Context changes must not silently transfer a time between hospitals or consultation modes. */
export function design20ChangedSelection(current: AppointmentSelection, incoming: AppointmentSelection): AppointmentSelection {
  const contextChanged = current.doctorId !== incoming.doctorId || current.hospital !== incoming.hospital || current.mode !== incoming.mode || current.date !== incoming.date;
  return { ...incoming, time: contextChanged ? "" : incoming.time };
}
