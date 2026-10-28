import type { BookingDoctorSummary } from "../types";
import { getDesign3BookingSlots, isDesign3BookingSlotAvailable } from "../design3Availability";
import { appointmentDates } from "../appointmentTime";
import { sameSelection, type AppointmentSelection, type SlotHold } from "../design7/model";
import { safeReturnTo } from "./navigation";
import type { QuickJourneyDesign } from "@/features/design-preview/journeyDesigns";

export type QuickBookingStep = "appointment" | "checkout" | "payment" | "confirmation";

export function readQuickStep(value: string | null): QuickBookingStep {
  return value === "checkout" || value === "payment" || value === "confirmation" ? value : "appointment";
}

/** Every route selection is checked against this doctor's actual preview schedule. */
export function requestedSelection(doctor: BookingDoctorSummary, params: URLSearchParams, now: number): AppointmentSelection {
  const hospitals = doctor.locations ?? [{ name: doctor.hospital, city: doctor.city }];
  const hospital = hospitals.find(item => item.name === params.get("hospital"))?.name ?? doctor.hospital;
  const dates = appointmentDates(now);
  const mode = params.get("mode") === "video" ? "video" : "hospital";
  const requestedDay = params.get("date");
  const day = requestedDay === "today" ? dates[0] : requestedDay === "tomorrow" ? dates[1] : requestedDay;
  const date = day && dates.includes(day) ? day
    : dates.find(date => getDesign3BookingSlots(doctor.id, date, mode, hospital, new Date(now)).some(slot => slot.available)) ?? dates[0];
  const candidate = { doctorId: doctor.id, mode, hospital, date, time: params.get("time") ?? "" } as AppointmentSelection;
  return availableSelection(candidate, now) ? candidate : { ...candidate, time: "" };
}

export function availableSelection(selection: AppointmentSelection, now = Date.now()): boolean {
  return Boolean(selection.time) && isDesign3BookingSlotAvailable(
    selection.doctorId, selection.date, selection.time, selection.mode, selection.hospital, new Date(now),
  );
}

/** A fresh card choice takes priority; resuming never quietly replaces that choice. */
export function shouldResumeSelection(intent: string | null, requested: AppointmentSelection, saved: AppointmentSelection | undefined): boolean {
  if (!saved || saved.doctorId !== requested.doctorId) return false;
  if (intent === "choose") return false;
  if (intent === "slot") return sameSelection(requested, saved);
  return true;
}

export function reusableHold(hold: SlotHold | null, selection: AppointmentSelection): SlotHold | null {
  // Return an expired matching hold too: refresh and Back must not renew it.
  return hold && sameSelection(hold.selection, selection) ? hold : null;
}

/** URLs carry the appointment and navigation state, never patient identity. */
export function quickStepUrl(current: string, selection: AppointmentSelection, step: QuickBookingStep, receipt?: string, variant: QuickJourneyDesign = "d13"): string {
  const url = new URL(current);
  const returnTo = url.searchParams.get("returnTo");
  const city = url.searchParams.get("city");
  url.search = "";
  if (city && city.length <= 100 && !/[\u0000-\u001f\u007f]/.test(city)) url.searchParams.set("city", city);
  if (returnTo) url.searchParams.set("returnTo", safeReturnTo(returnTo, `/search/doctors?design=${variant}`, variant));
  url.searchParams.set("design", variant);
  url.searchParams.set("step", step);
  url.searchParams.set("intent", "resume");
  url.searchParams.set("mode", selection.mode);
  url.searchParams.set("hospital", selection.hospital);
  url.searchParams.set("date", selection.date);
  if (selection.time) url.searchParams.set("time", selection.time); else url.searchParams.delete("time");
  if (receipt) url.searchParams.set("receipt", receipt); else url.searchParams.delete("receipt");
  return `${url.pathname}?${url.searchParams.toString()}`;
}
