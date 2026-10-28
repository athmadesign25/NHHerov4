import { emptyDoctorFilters, doctorFilterValues, type ConsultationMode, type DoctorFilters, type DoctorListingItem, type DoctorMultiFilterKey } from "@/features/search/doctorListing";
import type { Design15Variant } from "@/features/design-preview/journeyDesigns";
import { quickBookingHref } from "@/features/booking/design13/navigation";
import { refineDesign7Doctors } from "../d7/directory";

export type AvailabilityChoice = "earliest" | "today" | "tomorrow";
export const FILTER_GROUPS = [
  { key: "specialties", label: "Speciality" }, { key: "hospitals", label: "Hospital" }, { key: "languages", label: "Language" },
] as const;

export function readDesign15Filters(params: URLSearchParams): DoctorFilters {
  const filters = emptyDoctorFilters();
  for (const { key } of FILTER_GROUPS) filters[key] = [...new Set(params.getAll(key).filter(Boolean))];
  const availability = params.get("availability");
  if (availability === "today" || availability === "tomorrow") filters.availability = availability;
  return filters;
}

export function readAvailabilityChoice(params: URLSearchParams): AvailabilityChoice {
  const value = params.get("availability");
  return value === "today" || value === "tomorrow" ? value : "earliest";
}

/** Every quick choice orders genuine future slots first; unknown times remain last. */
export function refineDesign15Doctors(doctors: readonly DoctorListingItem[], filters: DoctorFilters, mode: ConsultationMode, now: Date) {
  const visibleFilters = { ...emptyDoctorFilters(), specialties: filters.specialties, hospitals: filters.hospitals, languages: filters.languages,
    availability: filters.availability === "today" || filters.availability === "tomorrow" ? filters.availability : "any" as const };
  return refineDesign7Doctors(doctors, visibleFilters, mode, "earliest", now);
}

export function design15FilterOptions(doctors: readonly DoctorListingItem[], filters: DoctorFilters, mode: ConsultationMode, now: Date, key: DoctorMultiFilterKey) {
  const candidates = refineDesign15Doctors(doctors, { ...filters, [key]: [] }, mode, now);
  const counts = new Map<string, number>();
  candidates.forEach((doctor) => new Set(doctorFilterValues(doctor, key)).forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1)));
  const values = [...new Set([...doctors.flatMap((doctor) => [...doctorFilterValues(doctor, key)]), ...filters[key]])];
  return values.filter(Boolean).sort((a, b) => a.localeCompare(b)).map((value) => ({ value, count: counts.get(value) ?? 0 }));
}

/** D15 starts with login and choosing a time, never an implicitly selected slot. */
export function design15BookingHref(doctor: DoctorListingItem, mode: ConsultationMode, now: Date, returnTo: string, variant: Design15Variant) {
  return quickBookingHref(doctor, mode, now, returnTo, "choose", variant);
}
