import type { NormalizedDoctor } from "@/lib/searchService";

export type ConsultationMode = "hospital" | "video";
export type DoctorSort = "relevance" | "earliest" | "experience" | "fee_asc" | "fee_desc";
export type AvailabilityFilter = "any" | "today" | "tomorrow" | "week";

export interface DoctorListingItem {
  id: string;
  name: string;
  speciality: string;
  degrees: string;
  hospital: string;
  hospitals?: readonly string[];
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

export function nextSlot(doctor: DoctorListingItem, mode: ConsultationMode, now = new Date()): Date | null {
  const text = doctor.availability[mode]?.trim();
  if (!text) return null;
  const time = text.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!time || Number(time[1]) < 1 || Number(time[1]) > 12 || Number(time[2]) > 59) return null;
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (/^tomorrow\b/i.test(text)) date.setDate(date.getDate() + 1);
  else if (!/^today\b/i.test(text)) {
    const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!iso) return null;
    date.setFullYear(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    if (date.getFullYear() !== Number(iso[1]) || date.getMonth() !== Number(iso[2]) - 1 || date.getDate() !== Number(iso[3])) return null;
  }
  const hour = Number(time[1]) % 12 + (time[3].toUpperCase() === "PM" ? 12 : 0);
  date.setHours(hour, Number(time[2]), 0, 0);
  return date;
}

export function filterDoctors(doctors: readonly DoctorListingItem[], filters: DoctorFilters, mode: ConsultationMode, now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(start); tomorrow.setDate(start.getDate() + 1);
  const afterTomorrow = new Date(start); afterTomorrow.setDate(start.getDate() + 2);
  const week = new Date(start); week.setDate(start.getDate() + 7);
  return doctors.filter((doctor) => {
    if (doctor.modes[mode] === false) return false;
    for (const key of ["specialties", "hospitals", "languages", "genders", "expertise"] as const) {
      if (filters[key].length && !doctorFilterValues(doctor, key).some((value) => filters[key].includes(value))) return false;
    }
    if (filters.availability === "any") return true;
    const slot = nextSlot(doctor, mode, now);
    if (!slot) return false;
    if (filters.availability === "today") return slot >= start && slot < tomorrow;
    if (filters.availability === "tomorrow") return slot >= tomorrow && slot < afterTomorrow;
    return slot >= start && slot < week;
  });
}

export function sortDoctors(doctors: readonly DoctorListingItem[], sort: DoctorSort, mode: ConsultationMode, now = new Date()) {
  const number = (text: string) => text.trim() ? Number.parseFloat(text.replace(/[^\d.]/g, "")) : NaN;
  const value = (doctor: DoctorListingItem) => sort === "earliest"
    ? nextSlot(doctor, mode, now)?.getTime() ?? NaN
    : sort === "experience" ? number(doctor.experience) : number(doctor.fee);
  return [...doctors].sort((a, b) => {
    if (sort === "relevance") return 0;
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
    const date = `${slot.getFullYear()}-${String(slot.getMonth() + 1).padStart(2, "0")}-${String(slot.getDate()).padStart(2, "0")}`;
    params.set("date", date);
    params.set("time", `${String(slot.getHours() % 12 || 12).padStart(2, "0")}:${String(slot.getMinutes()).padStart(2, "0")} ${slot.getHours() >= 12 ? "PM" : "AM"}`);
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
  return {
    filters,
    mode: (params.get("mode") === "video" ? "video" : "hospital") as ConsultationMode,
    sort: (["earliest", "experience", "fee_asc", "fee_desc"].includes(sort ?? "") ? sort : "relevance") as DoctorSort,
  };
}
