import publishedLocations from "./doctorProfileLocationData";
import type { DoctorListingItem } from "./doctorListing";

const key = (name: string) => name.toLowerCase().replace(/^dr[.\s-]*/, "").replace(/[^a-z0-9]/g, "");
const locations = new Map(Object.entries(publishedLocations).map(([name, hospitals]) => [key(name), hospitals]));

/** Accept published profile locations throughout booking, keeping existing preview selections valid. */
export function withPublishedProfileLocations(doctor: DoctorListingItem): DoctorListingItem {
  if (doctor.city && !/^(bangalore|bengaluru)$/i.test(doctor.city.trim())) return doctor;
  const supplied = locations.get(key(doctor.name));
  if (!supplied?.length) return doctor;
  return { ...doctor, hospitals: [...new Set([doctor.hospital, ...(doctor.hospitals ?? []), ...supplied].filter(Boolean))] };
}
