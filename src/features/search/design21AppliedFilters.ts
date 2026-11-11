import { availabilityLabels, type DoctorFilters } from "./doctorListing";

export interface AppliedDoctorFilter {
  key: string;
  label: string;
  remove: () => void;
  accessibleLabel?: string;
}

/** Keep the shared filter actions, but omit selections already represented by smart chips. */
export function design21AppliedFilters(value: DoctorFilters, onChange: (value: DoctorFilters) => void, extras: readonly AppliedDoctorFilter[] = [], representedKeys: readonly string[] = []): AppliedDoctorFilter[] {
  const categories = { specialties: "speciality", expertise: "expertise", hospitals: "hospital", languages: "language", genders: "doctor gender" };
  const chips: AppliedDoctorFilter[] = (["specialties", "expertise", "hospitals", "languages", "genders"] as const).flatMap(key =>
    value[key].map(label => ({ key: `${key}-${label}`, label, accessibleLabel: `Remove ${categories[key]} filter: ${label}`,
      remove: () => onChange({ ...value, [key]: value[key].filter(item => item !== label) }) })));
  if (value.availability !== "any") chips.push({ key: "availability", label: availabilityLabels[value.availability],
    accessibleLabel: `Remove date filter: ${availabilityLabels[value.availability]}`, remove: () => onChange({ ...value, availability: "any" }) });
  const represented = new Set(representedKeys);
  return [...chips, ...extras].filter(chip => !represented.has(chip.key));
}
