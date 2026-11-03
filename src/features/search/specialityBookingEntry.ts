import { doctorNavUrl } from "./navigationEntries";

const facets: Record<string, string> = {
  cardiology: "Cardiologist", oncology: "Oncologist", orthopaedics: "Orthopaedician",
  neurology: "Neurologist", gastroenterology: "Gastroenterologist", nephrology: "Nephrologist",
  urology: "Urologist", pulmonology: "Pulmonologist", endocrinology: "Endocrinologist",
  dermatology: "Dermatologist", paediatrics: "Pediatrician", psychiatry: "Psychiatry",
  gynaecology: "Gynecologist", ophthalmology: "Ophthalmology", ent: "ENT Specialist",
};

export function specialityBookingEntry(slug: string, city?: string | null): string {
  const url = new URL(doctorNavUrl(facets[slug] ? "specialty" : undefined, facets[slug]), "https://nh.local");
  if (city && city !== "All") url.searchParams.set("location", city);
  return `${url.pathname}?${url.searchParams}`;
}
