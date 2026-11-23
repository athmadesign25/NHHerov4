import { availabilityLabels, doctorFilterOptions, emptyDoctorFilters, filterDoctors, type AvailabilityFilter, type ConsultationMode, type DoctorFilters, type DoctorListingItem, type DoctorMultiFilterKey } from "./doctorListing";
import { matchesDesign21Filter } from "./design21Filters";

/** A category match reveals its options; a value match keeps its category context. */
export function matchesFilterOption(category: string, value: string, query: string): boolean {
  return matchesDesign21Filter(category, query) || matchesDesign21Filter(value, query);
}

export function matchingAvailabilityOptions(query: string, enabled: boolean, selected: AvailabilityFilter, customDateLabel?: string) {
  const dates = (["today", "tomorrow", "week"] as const).filter(date =>
    (enabled || (!customDateLabel && selected === date)) && matchesFilterOption("Availability", availabilityLabels[date], query));
  const custom = Boolean(customDateLabel && matchesFilterOption("Availability", customDateLabel, query));
  return { dates, custom, hasMatches: dates.length > 0 || custom };
}

/** Shared facet source for browsing and search, including selected zero-result values. */
export function design21FilterOptions(doctors: readonly DoctorListingItem[], matchingDoctors: readonly DoctorListingItem[] | undefined, filters: DoctorFilters, mode: ConsultationMode | "all", key: DoctorMultiFilterKey) {
  const counts = matchingDoctors ? new Map(doctorFilterOptions(matchingDoctors, filters, mode, key).map(option => [option.value, option.count])) : null;
  const source = key === "expertise" && filters.specialties.length
    ? filterDoctors(doctors, { ...emptyDoctorFilters(), specialties: filters.specialties }, "all") : doctors;
  return doctorFilterOptions(source, filters, mode, key).map(option => counts ? { ...option, count: counts.get(option.value) ?? 0 } : option);
}

export interface FilterSearchOption { id: string; label: string; selected: boolean; nextFilters: DoctorFilters; clearCustomDate?: boolean }
export interface FilterSearchGroup { key: string; label: string; options: FilterSearchOption[] }

export function design21FilterSearchGroups({ doctors, matchingDoctors, value, mode = "all", availabilityEnabled = true, showAvailability = true, customDateLabel }: {
  doctors: readonly DoctorListingItem[]; matchingDoctors?: readonly DoctorListingItem[]; value: DoctorFilters;
  mode?: ConsultationMode | "all"; availabilityEnabled?: boolean; showAvailability?: boolean; customDateLabel?: string;
}, query: string): FilterSearchGroup[] {
  if (!query.trim()) return [];
  const categories = [
    ["specialties", "Speciality"], ["expertise", "Expertise"], ["hospitals", "Hospital"],
    ["languages", "Language"], ["genders", "Doctor gender"],
  ] as const;
  const groups: FilterSearchGroup[] = categories.map(([key, label]) => ({ key, label,
    options: design21FilterOptions(doctors, matchingDoctors, value, mode, key)
      .filter(option => (option.count > 0 || value[key].includes(option.value)) && matchesFilterOption(label, option.value, query))
      .map(option => {
        const selected = value[key].includes(option.value);
        return { id: `${key}:${option.value}`, label: option.value, selected,
          nextFilters: { ...value, [key]: selected ? value[key].filter(item => item !== option.value) : [...value[key], option.value] } };
      }),
  }));
  if (showAvailability) {
    const matches = matchingAvailabilityOptions(query, availabilityEnabled, value.availability, customDateLabel);
    const options: FilterSearchOption[] = matches.dates.map(date => ({ id: `availability:${date}`, label: availabilityLabels[date],
      selected: !customDateLabel && value.availability === date,
      nextFilters: { ...value, availability: !customDateLabel && value.availability === date ? "any" : date } }));
    if (matches.custom && customDateLabel) options.unshift({ id: "availability:custom", label: customDateLabel, selected: true, nextFilters: { ...value, availability: "any" }, clearCustomDate: true });
    groups.splice(3, 0, { key: "availability", label: "Availability", options });
  }
  return groups.filter(group => group.options.length > 0);
}
