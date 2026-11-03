import { appointmentDates, DESIGN16_BOOKING_DAYS, indiaDate } from "@/features/booking/appointmentTime";
import { nextSlot, type ConsultationMode, type DoctorFilters, type DoctorListingItem } from "./doctorListing";
import { refineDesign16Doctors } from "./design16Refinements";

/** An unchecked Video chip means all supported modes; never count one doctor twice. */
export function refineDesign21Doctors(...args: Parameters<typeof refineDesign16Doctors>): DoctorListingItem[] {
  const [doctors, filters, mode, sort, date = "", history = false, booked = new Set<string>(), now = new Date(), units = {}] = args;
  const refine = (type: ConsultationMode) => refineDesign16Doctors(doctors, filters, type, "relevance", date, history, booked, now, units, "d20");
  const hospital = mode === "video" ? [] : refine("hospital").map(doctor => ({ ...doctor, availability: { ...doctor.availability, video: undefined as string | undefined } }));
  const video = refine("video").map(doctor => ({ ...doctor, availability: { ...doctor.availability, hospital: mode === "video" ? doctor.availability.hospital : undefined } }));
  const byId = new Map<string, DoctorListingItem>(hospital.map(doctor => [doctor.id, doctor]));
  for (const doctor of video) {
    const existing = byId.get(doctor.id);
    byId.set(doctor.id, existing ? { ...existing, availability: { ...existing.availability, video: doctor.availability.video } } : doctor);
  }
  // Respect directory relevance, rather than grouping by consultation type.
  const results = doctors.flatMap(doctor => byId.has(doctor.id) ? [byId.get(doctor.id)!] : []);
  if (sort === "earliest") results.sort((a, b) => earliest(a, mode, now) - earliest(b, mode, now));
  return results;
}

function earliest(doctor: DoctorListingItem, mode: ConsultationMode, now: Date) {
  return Math.min(...(mode === "video" ? ["video" as const] : ["hospital" as const, "video" as const])
    .map(type => nextSlot(doctor, type, now)?.getTime() ?? Infinity));
}

/** Booking starts in a mode that actually matches the displayed date constraint. */
export function design21CardMode(doctor: DoctorListingItem, mode: ConsultationMode, now = new Date()): ConsultationMode {
  if (mode === "video" || doctor.modes.hospital === false) return "video";
  const hospital = nextSlot(doctor, "hospital", now)?.getTime() ?? Infinity;
  const video = nextSlot(doctor, "video", now)?.getTime() ?? Infinity;
  return video < hospital ? "video" : "hospital";
}

export function findDesign21NextAvailability(...args: Parameters<typeof refineDesign16Doctors>) {
  const [doctors, filters, mode, , date = "", history = false, booked = new Set<string>(), now = new Date()] = args;
  const last = date || (filters.availability === "tomorrow" ? indiaDate(now, 1) : filters.availability === "week" ? indiaDate(now, 6) : indiaDate(now));
  for (const day of appointmentDates(now.getTime(), DESIGN16_BOOKING_DAYS).filter(day => day > last)) {
    const count = refineDesign21Doctors(doctors, filters, mode, "relevance", day, history, booked, now).length;
    if (count) return { date: day, count };
  }
  return null;
}

/** Common professional terms are search aliases, never inferred diagnoses or expertise. */
export function matchesDesign21Filter(label: string, search: string): boolean {
  const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const query = normalize(search);
  if (!query || normalize(label).includes(query)) return true;
  const aliases: readonly [RegExp, string][] = [
    [/cardio/i, "heart specialist"], [/paediatr|pediatr/i, "child specialist children"],
    [/dermat/i, "skin specialist"], [/ophthalm/i, "eye specialist"],
    [/otolaryng|\bent\b|e\.n\.t/i, "ear nose throat"], [/orthop/i, "bone joint specialist"],
  ];
  return aliases.some(([pattern, words]) => pattern.test(label) && words.includes(query));
}

export function incompatibleHospitalFilters(doctors: readonly DoctorListingItem[], filters: DoctorFilters) {
  const available = new Set(doctors.flatMap(doctor => [doctor.hospital, ...(doctor.hospitals ?? [])]));
  return filters.hospitals.filter(name => !available.has(name));
}

/** Offer one explicit relaxation instead of silently discarding clinical preferences. */
export function design21FilterRecovery(...args: Parameters<typeof refineDesign16Doctors>) {
  const [doctors, filters, mode, sort, date, history, booked, now] = args;
  const labels = { expertise: "expertise", hospitals: "hospital", languages: "language", genders: "doctor gender", specialties: "speciality" };
  for (const key of ["expertise", "hospitals", "languages", "genders", "specialties"] as const) {
    if (!filters[key].length) continue;
    const next = { ...filters, [key]: [] };
    const count = refineDesign21Doctors(doctors, next, mode, sort, date, history, booked, now).length;
    if (count) return { filters: next, count, label: labels[key] };
  }
  return null;
}
