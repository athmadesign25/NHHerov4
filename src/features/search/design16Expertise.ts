import {
  doctorFilterValues,
  filterDoctors,
  type ConsultationMode,
  type DoctorFilters,
  type DoctorListingItem,
} from "./doctorListing";

export interface Design16ExpertiseShortcut {
  value: string;
  count: number;
  selected: boolean;
}

const normalize = (value: string) => value.normalize("NFKD").replace(/\p{M}/gu, "")
  .toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const containsPhrase = (text: string, phrase: string) => Boolean(phrase) && ` ${text} `.includes(` ${phrase} `);
const generalWords = new Set(["care", "health", "treatment", "treatments", "doctor", "doctors", "surgery", "specialist", "specialists", "clinic", "hospital"]);

function queryHasFocus(query: string, specialty: string, values: readonly string[]) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return false;
  const specialtyWords = new Set(normalize(specialty).split(" "));
  const queryWords = new Set(normalizedQuery.split(" "));
  return values.some((value) => {
    const focus = normalize(value);
    if (containsPhrase(normalizedQuery, focus)) return true;
    return focus.split(" ").some((word) => !specialtyWords.has(word) && !generalWords.has(word) && queryWords.has(word));
  });
}

/**
 * Source doctors precede facet filtering so shortcuts do not jump between selections.
 * Optional matchingDoctors applies date/history constraints, before expertise filtering.
 */
export function getDesign16ExpertiseShortcuts(
  doctors: readonly DoctorListingItem[],
  filters: DoctorFilters,
  mode: ConsultationMode,
  query: string,
  now = new Date(),
  matchingDoctors: readonly DoctorListingItem[] = doctors,
): Design16ExpertiseShortcut[] {
  const selectedSpecialties = [...new Set(filters.specialties)];
  if (selectedSpecialties.length > 1) return [];
  const specialties = [...new Set(doctors.flatMap((doctor) => [...doctorFilterValues(doctor, "specialties")]))];
  const querySpecialties = selectedSpecialties.length ? []
    : specialties.filter((value) => containsPhrase(normalize(query), normalize(value)));
  const specialty = selectedSpecialties[0] ?? (querySpecialties.length === 1 ? querySpecialties[0] : undefined);
  if (!specialty) return [];

  const scoped = doctors.filter((doctor) => doctorFilterValues(doctor, "specialties").includes(specialty));
  const sourceCounts = new Map<string, number>();
  for (const doctor of scoped) {
    for (const value of new Set(doctor.expertise ?? [])) {
      if (value.trim()) sourceCounts.set(value, (sourceCounts.get(value) ?? 0) + 1);
    }
  }
  const values = [...sourceCounts.keys()].sort((a, b) => sourceCounts.get(b)! - sourceCounts.get(a)! || a.localeCompare(b));
  const selected = values.filter((value) => filters.expertise.includes(value));
  if (values.length < 2 && !selected.length) return [];

  // At most three suggestions. Any additional active source values stay removable.
  const suggestions = queryHasFocus(query, specialty, values) ? [] : values.slice(0, 3);
  const visible = [...new Set([...suggestions, ...selected])];
  if (!visible.length) return [];
  const matchingScope = matchingDoctors.filter((doctor) => doctorFilterValues(doctor, "specialties").includes(specialty));
  const matching = filterDoctors(matchingScope, { ...filters, expertise: [] }, mode, now);
  return visible.map((value) => ({
    value,
    count: matching.filter((doctor) => doctor.expertise?.includes(value)).length,
    selected: filters.expertise.includes(value),
  }));
}

export function toggleDesign16Expertise(filters: DoctorFilters, value: string): DoctorFilters {
  return {
    ...filters,
    expertise: filters.expertise.includes(value)
      ? filters.expertise.filter((item) => item !== value)
      : [...filters.expertise, value],
  };
}
