import { searchDoctorsData } from "@/app/search/mockDoctors";
import { design3CityDoctors } from "./design3CityDoctors";
import type { DoctorListingItem } from "./doctorListing";

const fixtureIds = new Set([...searchDoctorsData, ...design3CityDoctors].map(doctor => doctor.id));
const combiningMarks = new RegExp("\\p{M}+", "gu");
const separators = new RegExp("[^\\p{L}\\p{N}]+", "gu");

function normalize(value: string): string {
  return value.normalize("NFKD").replace(combiningMarks, "").toLowerCase().replace(separators, " ").trim();
}

/** Search the stakeholder directory without converting API identities into bookable fixtures. */
export function searchDesign17Directory(directory: readonly DoctorListingItem[], query: string, allowedIds: ReadonlySet<string> = fixtureIds): DoctorListingItem[] {
  const terms = normalize(query).split(" ").filter(Boolean);
  return directory.filter(doctor => {
    if (!allowedIds.has(doctor.id)) return false;
    if (!terms.length) return true;
    const searchable = normalize([
      doctor.name, doctor.speciality, ...(doctor.specialityAliases ?? []), doctor.city, doctor.hospital,
      ...(doctor.expertise ?? []), ...(doctor.hospitals ?? []),
      ...(doctor.practiceLocations ?? []).flatMap(practice => [practice.hospital, practice.city]),
    ].join(" "));
    // A partial doctor/speciality name remains useful while every entered term must match.
    return terms.every(term => searchable.includes(term));
  });
}
