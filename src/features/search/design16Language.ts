import { getCityId, NH_CITIES } from "@/lib/searchService";
import { filterDoctors, type ConsultationMode, type DoctorFilters, type DoctorListingItem } from "./doctorListing";
import { CITY_CONSULTATION_LANGUAGES } from "./cityLanguages";

export interface Design16LanguageShortcut {
  value: string;
  count: number;
  selected: boolean;
}

/**
 * Doctors are the current city/query source. matchingDoctors additionally carries
 * date/history constraints, before language filtering. Suggestions never apply a filter.
 */
export function getDesign16LanguageShortcut(
  doctors: readonly DoctorListingItem[],
  filters: DoctorFilters,
  mode: ConsultationMode,
  location: string,
  now = new Date(),
  matchingDoctors: readonly DoctorListingItem[] = doctors,
): Design16LanguageShortcut | null {
  const city = NH_CITIES.find((item) => item.id === getCityId(location));
  const regional = city ? CITY_CONSULTATION_LANGUAGES[city.value] : undefined;
  // The suggestion follows the city even when another language is already applied.
  // Without a city, an explicit selection stays removable. Never silently substitute Hindi.
  const supported = doctors.flatMap(doctor => doctor.languages ?? []);
  const value = regional
    ? supported.find(language => language.trim().toLowerCase() === regional.toLowerCase()) ?? regional
    : filters.languages.find(language => Boolean(language.trim()));
  if (!value) return null;
  const matching = filterDoctors(matchingDoctors, { ...filters, languages: [] }, mode, now);
  return { value, selected: filters.languages.includes(value), count: matching.filter((doctor) => doctor.languages?.includes(value)).length };
}

export function toggleDesign16Language(filters: DoctorFilters, value: string): DoctorFilters {
  return { ...filters, languages: filters.languages.includes(value)
    ? filters.languages.filter((language) => language !== value)
    : [...filters.languages, value] };
}
