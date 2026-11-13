import { DEFAULT_DOCTOR_DESIGN } from "@/features/design-preview/doctorJourney";
import { findDoctorLandingCity } from "@/features/search/doctorLandingPages";

const legacySpecialties: Readonly<Record<string, readonly string[]>> = {
  "cardiac-surgery-adult": ["Cardiac Surgeon"],
  "neuro-sciences": ["Neurologist", "Neurosurgeon"],
  "cancer-care": ["Oncologist"],
  "emergency-medicine": ["Emergency Medicine"],
  "gastro-sciences": ["Gastroenterologist"],
  "orthopaedics-joint-replacement": ["Orthopaedician"],
};

/** Connect the production footer's doctor index to the current local directory. */
export function seoDoctorHref(href: string): string {
  const match = /^\/ocaapp\/doctors\/([a-z-]+)\/([a-z-]+)\/?$/.exec(href);
  if (!match) return href;
  const [, citySlug, specialtySlug] = match;
  const specialties = legacySpecialties[specialtySlug];
  if (!specialties) return href;

  const location = findDoctorLandingCity(citySlug)?.value
    ?? citySlug.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  const params = new URLSearchParams({ design: DEFAULT_DOCTOR_DESIGN, location });
  for (const specialty of specialties) params.append("specialties", specialty);
  return `/search/doctors?${params}`;
}
