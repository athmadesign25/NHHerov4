import { appointmentDates, DESIGN16_BOOKING_DAYS } from "../appointmentTime";
import { getDesign3BookingSlots, isDesign3BookingSlotAvailable } from "../design3Availability";
import type { BookingDoctorSummary } from "../types";
import type { AppointmentSelection, PreviewReceipt } from "../design7/model";
import { confirmDesign15, failureHoldExpired, type Design15Draft, type Design15Step } from "../design15/model";
import { design17ListingReturnTo, type Design17Variant } from "@/features/search/design17Navigation";

export function design17Available(selection: AppointmentSelection, now = Date.now()): boolean {
  return Boolean(selection.time) && isDesign3BookingSlotAvailable(selection.doctorId, selection.date, selection.time,
    selection.mode, selection.hospital, new Date(now), DESIGN16_BOOKING_DAYS);
}

export function design17RequestedSelection(doctor: BookingDoctorSummary, params: URLSearchParams, now = Date.now()): AppointmentSelection {
  const locations = doctor.locations ?? [{ name: doctor.hospital, city: doctor.city }];
  const hospital = locations.find(location => location.name === params.get("hospital"))?.name ?? doctor.hospital;
  const mode = params.get("mode") === "video" ? "video" : "hospital";
  const dates = appointmentDates(now, DESIGN16_BOOKING_DAYS);
  const requested = params.get("date");
  const date = requested && dates.includes(requested) ? requested
    : dates.find(day => getDesign3BookingSlots(doctor.id, day, mode, hospital, new Date(now), DESIGN16_BOOKING_DAYS).some(slot => slot.available)) ?? dates[0];
  // A card entry never silently selects or reserves a time, even if a URL supplies one.
  return { doctorId: doctor.id, mode, hospital, date, time: "" };
}

export function design17SafeStep(requested: string | null, draft: Design15Draft, authenticated: boolean, now = Date.now()): Design15Step {
  if (!authenticated || !draft.identity || !draft.selectedPatientId) return "patient";
  if (draft.receipt) return "confirmation";
  if (requested === "patient") return "patient";
  if (!design17Available(draft.selection, now) || failureHoldExpired(draft.failureHold, draft.selection, now) || requested === "appointment") return "appointment";
  return requested === "payment" && draft.payment === "online" ? "payment" : "review";
}

export function confirmDesign17(draft: Design15Draft, authenticated: boolean, paid: boolean, now = Date.now()): PreviewReceipt | null {
  return authenticated ? confirmDesign15(draft, paid, design17Available(draft.selection, now), now) : null;
}

export function design17FlowUrl(draft: Design15Draft, design: Design17Variant, returnTo: string): string {
  const selection = draft.selection;
  const params = new URLSearchParams({ design, returnTo: design17ListingReturnTo(returnTo, design),
    mode: selection.mode, hospital: selection.hospital, date: selection.date });
  if (draft.receipt) {
    params.set("ref", draft.receipt.ref);
    return `/doctors/${encodeURIComponent(draft.doctorId)}/book/confirmation?${params}`;
  }
  params.set("step", draft.stage);
  return `/doctors/${encodeURIComponent(draft.doctorId)}/book?${params}`;
}
