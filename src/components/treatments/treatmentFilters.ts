import type { TreatmentProcedureItem } from "@/data/treatmentsProceduresData";

export interface TreatmentFilters {
  specialties: string[];
  classifications: string[];
  letters: string[];
}

export const PROCEDURE_CLASSIFICATIONS = ["Minimally Invasive", "Day Care", "Complex Surgical"] as const;

export function parseTreatmentSelection(value: string | null | undefined): string[] {
  return [...new Set((value ?? "").split(",").map(item => item.trim()).filter(item => item && item !== "All" && item !== "All Types"))];
}

export function toggleTreatmentSelection(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter(item => item !== value) : [...values, value];
}

export function matchesProcedureClassification(item: TreatmentProcedureItem, classification: string): boolean {
  const text = `${item.title} ${item.summary} ${item.overview} ${item.hospitalStay ?? ""}`.toLowerCase();
  const name = classification.toLowerCase();
  if (name.includes("minimally")) return ["minimally", "endovascular", "laparoscopic", "catheter"].some(term => text.includes(term));
  if (name.includes("day care")) return ["day care", "same-day", "same day"].some(term => text.includes(term));
  if (name.includes("complex") || name.includes("surgical")) return ["transplant", "open", "reconstruction", "replacement"].some(term => text.includes(term));
  return false;
}

/** Choices within a group are alternatives; different groups refine each other. */
export function filterTreatments(items: readonly TreatmentProcedureItem[], search: string, filters: TreatmentFilters): TreatmentProcedureItem[] {
  const query = search.trim().toLowerCase();
  return items.filter(item => {
    const matchesSearch = !query || [item.title, item.shortTitle, item.summary, item.overview, item.speciality].some(text => text.toLowerCase().includes(query));
    const matchesSpecialty = !filters.specialties.length || filters.specialties.some(value => value.toLowerCase() === item.speciality.toLowerCase());
    const matchesType = !filters.classifications.length || filters.classifications.some(value => matchesProcedureClassification(item, value));
    const matchesLetter = !filters.letters.length || filters.letters.includes((item.shortTitle || item.title).charAt(0).toUpperCase());
    return matchesSearch && matchesSpecialty && matchesType && matchesLetter;
  });
}
