import type { DoctorListingItem } from "./doctorListing";

export interface Design20CardContentOptions {
  specialties?: readonly string[];
  focusTerms?: readonly string[];
  languages?: readonly string[];
}

export interface Design20CardContent {
  speciality: string;
  additionalSpecialties: string[];
  focus: string[];
  fullExpertise: string[];
  language: string | null;
  experienceValue: string | null;
  experienceLabel: string;
}

const normalized = (value: string) => value.trim().toLocaleLowerCase();
const conciseLength = 60;

function distinctSourceTerms(values: readonly string[]): string[] {
  const seen = new Set<string>();
  return values.map(value => value.trim()).filter(value => {
    const key = normalized(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function matchRank(value: string, terms: readonly string[]): number {
  const key = normalized(value);
  if (terms.includes(key)) return 2;
  return terms.some(term => key.includes(term) || term.includes(key)) ? 1 : 0;
}

/** Select source content for the card without changing clinical names or filling unknown facts. */
export function getDesign20CardContent(
  doctor: DoctorListingItem,
  options: Design20CardContentOptions = {},
): Design20CardContent {
  const specialties = distinctSourceTerms(doctor.speciality.split(/\s*[,|/]\s*/));
  const selectedSpecialties = distinctSourceTerms(options.specialties ?? []).map(normalized);
  const focusTerms = distinctSourceTerms(options.focusTerms ?? []).map(normalized);
  const matchedSpecialty = specialties.find(value => selectedSpecialties.includes(normalized(value)))
    ?? specialties.find(value => matchRank(value, focusTerms) === 2)
    ?? specialties.find(value => matchRank(value, focusTerms) === 1);
  const speciality = matchedSpecialty ?? specialties[0] ?? "";
  const specialtyKeys = new Set(specialties.map(normalized));
  const sourceExpertise = distinctSourceTerms(doctor.expertise ?? []);
  const specificExpertise = sourceExpertise.filter(value => !specialtyKeys.has(normalized(value)));
  // Prefer specific clinical areas, but retain NH's published broad expertise
  // when it is all the source supplies instead of making a populated record blank.
  const expertise = specificExpertise.length ? specificExpertise : sourceExpertise;
  // Relevance takes precedence. Within each rank, prefer concise supplied terms,
  // preserving their source order instead of shortening a clinical description.
  const fullExpertise = expertise.map((value, index) => ({ value, index, rank: matchRank(value, focusTerms) }))
    .sort((a, b) => b.rank - a.rank
      || Number(a.value.length > conciseLength) - Number(b.value.length > conciseLength)
      || a.index - b.index)
    .map(entry => entry.value);
  const rankedFocus = fullExpertise.slice(0, 2);
  const focus = rankedFocus.join(" · ").length > conciseLength ? rankedFocus.slice(0, 1) : rankedFocus;
  const selectedLanguages = distinctSourceTerms(options.languages ?? []).map(normalized);
  const language = distinctSourceTerms(doctor.languages ?? [])
    .find(value => selectedLanguages.includes(normalized(value))) ?? null;
  const experience = /^(\d+(?:\.\d+)?\+?)\s*(?:years?|yrs?)(?:\s+(in practice|(?:of )?experience))?$/i.exec(doctor.experience.trim());
  const experienceValue = experience
    ? `${experience[1]} ${experience[1] === "1" ? "year" : "years"}` : null;

  return {
    speciality,
    additionalSpecialties: specialties.filter(value => value !== speciality),
    focus,
    fullExpertise,
    language,
    experienceValue,
    experienceLabel: experience?.[2]?.toLocaleLowerCase() === "in practice" ? "in practice" : "experience",
  };
}
