import type { NormalizedDoctor } from "@/lib/searchService";
import { advertisedAppointmentTimestamp, indiaAppointmentTimestamp, indiaClock, indiaDate } from "@/features/booking/appointmentTime";

export type ConsultationMode = "hospital" | "video";
export type DoctorSort = "relevance" | "earliest" | "nearest" | "experience" | "fee_asc" | "fee_desc";
export type AvailabilityFilter = "any" | "today" | "tomorrow" | "week";

export interface DoctorPracticeLocation {
  hospital: string;
  city: string;
  /** Design 16 stakeholder sample, not a measured journey distance. */
  distanceKm?: number;
  availability: { hospital?: string; video?: string };
  fee: string;
}

export interface DoctorListingItem {
  id: string;
  name: string;
  speciality: string;
  /** Supplied professional role; never inferred from experience or speciality. */
  designation?: string;
  degrees: string;
  hospital: string;
  hospitals?: readonly string[];
  practiceLocations?: readonly DoctorPracticeLocation[];
  hospitalCount?: string;
  city: string;
  experience: string;
  img: string;
  fee: string;
  rating: number;
  reviews: number;
  isExecutive?: boolean;
  availability: { hospital?: string; video?: string };
  /** null means the source does not tell us whether this mode is offered. */
  modes: Record<ConsultationMode, boolean | null>;
  languages?: readonly string[];
  gender?: string;
  expertise?: readonly string[];
}

export interface DoctorFilters {
  specialties: string[];
  hospitals: string[];
  languages: string[];
  genders: string[];
  expertise: string[];
  availability: AvailabilityFilter;
}

export type DoctorMultiFilterKey = Exclude<keyof DoctorFilters, "availability">;

export function doctorFilterValues(doctor: DoctorListingItem, key: DoctorMultiFilterKey): readonly string[] {
  switch (key) {
    case "specialties": return doctor.speciality.split(/\s*[,|/]\s*/).filter(Boolean);
    case "hospitals": return doctorHospitals(doctor);
    case "languages": return doctor.languages ?? [];
    case "genders": return doctor.gender ? [doctor.gender] : [];
    case "expertise": return doctor.expertise ?? [];
  }
}

/** Counts respect other groups and mode; selections within one group are ORed. */
export function doctorFilterOptions(doctors: readonly DoctorListingItem[], filters: DoctorFilters, mode: ConsultationMode, key: DoctorMultiFilterKey) {
  const candidates = filterDoctors(doctors, { ...filters, [key]: [] }, mode);
  const counts = new Map<string, number>();
  candidates.forEach((doctor) => new Set(doctorFilterValues(doctor, key)).forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1)));
  const values = [...new Set([...doctors.flatMap((doctor) => [...doctorFilterValues(doctor, key)]), ...filters[key]])].filter(Boolean);
  return values.sort((a, b) => a.localeCompare(b)).map((value) => ({ value, count: counts.get(value) ?? 0 }));
}

export const emptyDoctorFilters = (): DoctorFilters => ({
  specialties: [], hospitals: [], languages: [], genders: [], expertise: [], availability: "any",
});

type DirectoryDoctor = Omit<DoctorListingItem, "modes"> & { available?: string };

export function fromDirectoryDoctor(doctor: DirectoryDoctor): DoctorListingItem {
  const hasHospital = Boolean(doctor.availability.hospital?.trim());
  const hasVideo = Boolean(doctor.availability.video?.trim());
  return {
    ...doctor,
    modes: {
      hospital: hasHospital ? true : hasVideo ? false : null,
      video: hasVideo ? true : hasHospital ? false : null,
    },
  };
}

export function fromApiDoctor(doctor: NormalizedDoctor): DoctorListingItem {
  // The search API supplies booking capabilities, not appointment times,
  // qualifications, fees or verified portraits. Do not promote the shared
  // search adapter's demonstration slots/photos into factual listing data.
  return {
    id: String(doctor.id), name: doctor.name, speciality: doctor.speciality,
    hospital: doctor.hospital, degrees: "", city: "", experience: "", img: "",
    fee: "", rating: 0, reviews: 0, availability: {},
    modes: { hospital: doctor.apptEnabled || doctor.walkinEnabled, video: doctor.vcEnabled },
  };
}

export function doctorHospitals(doctor: DoctorListingItem): string[] {
  return [...new Set([doctor.hospital, ...(doctor.hospitals ?? [])].filter(Boolean))];
}

/** Keep the selected affiliation visible and carry it into the Design 3 booking URL. */
export function withSelectedDoctorHospital(doctor: DoctorListingItem, selectedHospitals: readonly string[]): DoctorListingItem {
  const hospitals = doctorHospitals(doctor);
  const hospital = hospitals.find((name) => selectedHospitals.includes(name));
  return hospital && hospital !== doctor.hospital ? { ...doctor, hospital, hospitals } : doctor;
}

export function nextSlot(doctor: DoctorListingItem, mode: ConsultationMode, now = new Date()): Date | null {
  if (doctor.modes[mode] === false) return null;
  const text = doctor.availability[mode]?.trim();
  if (!text) return null;
  const timestamp = advertisedAppointmentTimestamp(text, now);
  return timestamp !== null && timestamp > now.getTime() ? new Date(timestamp) : null;
}

export function filterDoctors(doctors: readonly DoctorListingItem[], filters: DoctorFilters, mode: ConsultationMode, now = new Date()) {
  const start = indiaAppointmentTimestamp(indiaDate(now), "12:00 AM")!;
  const tomorrow = start + 24 * 60 * 60 * 1000;
  const afterTomorrow = tomorrow + 24 * 60 * 60 * 1000;
  const week = start + 7 * 24 * 60 * 60 * 1000;
  return doctors.filter((doctor) => {
    if (doctor.modes[mode] === false) return false;
    for (const key of ["specialties", "hospitals", "languages", "genders", "expertise"] as const) {
      if (filters[key].length && !doctorFilterValues(doctor, key).some((value) => filters[key].includes(value))) return false;
    }
    if (filters.availability === "any") return true;
    const slot = nextSlot(doctor, mode, now)?.getTime();
    if (slot === undefined) return false;
    if (filters.availability === "today") return slot >= start && slot < tomorrow;
    if (filters.availability === "tomorrow") return slot >= tomorrow && slot < afterTomorrow;
    return slot >= start && slot < week;
  });
}

export function sortDoctors(doctors: readonly DoctorListingItem[], sort: DoctorSort, mode: ConsultationMode, now = new Date()) {
  const number = (text: string) => text.trim() ? Number.parseFloat(text.replace(/[^\d.]/g, "")) : NaN;
  const value = (doctor: DoctorListingItem) => sort === "earliest"
    ? nextSlot(doctor, mode, now)?.getTime() ?? NaN
    : sort === "nearest" ? doctor.practiceLocations?.find((unit) => unit.hospital === doctor.hospital)?.distanceKm ?? NaN
    : sort === "experience" ? number(doctor.experience) : number(doctor.fee);
  return [...doctors].sort((a, b) => {
    if (sort === "relevance" || (sort === "nearest" && mode !== "hospital")) return 0;
    const av = value(a); const bv = value(b);
    // Unknown prices/experience/times always follow known values, in either direction.
    if (!Number.isFinite(av)) return Number.isFinite(bv) ? 1 : 0;
    if (!Number.isFinite(bv)) return -1;
    return sort === "experience" || sort === "fee_desc" ? bv - av : av - bv;
  });
}

export function bookingUrl(doctor: DoctorListingItem, mode: ConsultationMode, includeSlot = false, now = new Date()) {
  const params = new URLSearchParams({ mode });
  if (doctor.city) params.set("city", doctor.city);
  if (mode === "hospital" && doctor.hospital) params.set("hospital", doctor.hospital);
  const slot = includeSlot ? nextSlot(doctor, mode, now) : null;
  if (slot) {
    params.set("date", indiaDate(slot));
    params.set("time", indiaClock(slot));
  }
  return `/doctors/${encodeURIComponent(doctor.id)}/book?${params}`;
}

export const availabilityLabels: Record<AvailabilityFilter, string> = {
  any: "Any date", today: "Today", tomorrow: "Tomorrow", week: "Next 7 days",
};

export function activeFilterCount(filters: DoctorFilters) {
  return filters.specialties.length + filters.hospitals.length + filters.languages.length +
    filters.genders.length + filters.expertise.length + Number(filters.availability !== "any");
}

export function readListingParams(params: URLSearchParams) {
  const filters = emptyDoctorFilters();
  for (const key of ["specialties", "hospitals", "languages", "genders", "expertise"] as const) {
    filters[key] = [...new Set(params.getAll(key).filter(Boolean))];
  }
  const availability = params.get("availability");
  if (availability && Object.hasOwn(availabilityLabels, availability)) filters.availability = availability as AvailabilityFilter;
  const sort = params.get("sort");
  const nearest = sort === "nearest" && ["d16", "d17", "d17-lite", "d18", "d19"].includes(params.get("design") ?? "") && params.get("mode") !== "video";
  return {
    filters,
    mode: (params.get("mode") === "video" ? "video" : "hospital") as ConsultationMode,
    sort: (["earliest", "experience", "fee_asc", "fee_desc"].includes(sort ?? "") || nearest ? sort : "relevance") as DoctorSort,
  };
}
