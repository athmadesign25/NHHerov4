import { getCityId, NH_CITIES } from "@/lib/searchService";

export interface DoctorLandingSpeciality {
  slug: string;
  /** Exact directory facet value, distinct from a department such as Cardiology. */
  label: string;
  plural: string;
}

export interface DoctorLandingCity { slug: string; label: string; value: string }
export interface DoctorLandingContext {
  speciality?: DoctorLandingSpeciality;
  city?: DoctorLandingCity;
}

/** Finite, reviewed route vocabulary. Never turn arbitrary search text into a landing URL. */
export const DOCTOR_LANDING_SPECIALITIES: readonly DoctorLandingSpeciality[] = [
  { slug: "cardiologist", label: "Cardiologist", plural: "Cardiologists" },
  { slug: "orthopaedician", label: "Orthopaedician", plural: "Orthopaedicians" },
  { slug: "oncologist", label: "Oncologist", plural: "Oncologists" },
  { slug: "neurologist", label: "Neurologist", plural: "Neurologists" },
  { slug: "pediatrician", label: "Pediatrician", plural: "Pediatricians" },
  { slug: "cardiac-surgeon", label: "Cardiac Surgeon", plural: "Cardiac surgeons" },
  { slug: "general-surgeon", label: "General Surgeon", plural: "General surgeons" },
  { slug: "vascular-surgeon", label: "Vascular Surgeon", plural: "Vascular surgeons" },
  { slug: "plastic-surgeon", label: "Plastic Surgeon", plural: "Plastic surgeons" },
  { slug: "gastroenterologist", label: "Gastroenterologist", plural: "Gastroenterologists" },
  { slug: "pulmonologist", label: "Pulmonologist", plural: "Pulmonologists" },
  { slug: "endocrinologist", label: "Endocrinologist", plural: "Endocrinologists" },
  { slug: "nephrologist", label: "Nephrologist", plural: "Nephrologists" },
  { slug: "urologist", label: "Urologist", plural: "Urologists" },
  { slug: "gynecologist", label: "Gynecologist", plural: "Gynecologists" },
  { slug: "ent-specialist", label: "ENT Specialist", plural: "ENT specialists" },
  { slug: "dermatologist", label: "Dermatologist", plural: "Dermatologists" },
];

export const DOCTOR_LANDING_CITIES: readonly DoctorLandingCity[] = NH_CITIES.map(({ label, value }) => ({
  slug: value.toLowerCase().replace(/\s+/g, "-"), label, value,
}));

export function findDoctorLandingSpeciality(value: string) {
  const normalized = value.trim().toLowerCase();
  return DOCTOR_LANDING_SPECIALITIES.find((speciality) => speciality.slug === normalized || speciality.label.toLowerCase() === normalized);
}

export function findDoctorLandingCity(value: string) {
  const normalized = value.trim().toLowerCase();
  return DOCTOR_LANDING_CITIES.find((city) => city.slug === normalized || city.label.toLowerCase() === normalized)
    ?? DOCTOR_LANDING_CITIES.find((city) => getCityId(value) !== null && getCityId(city.value) === getCityId(value));
}

export function getDoctorLandingPath(specialitySlug?: string, citySlug?: string): string {
  const speciality = specialitySlug ? DOCTOR_LANDING_SPECIALITIES.find((item) => item.slug === specialitySlug) : undefined;
  const city = citySlug ? DOCTOR_LANDING_CITIES.find((item) => item.slug === citySlug) : undefined;
  if ((specialitySlug && !speciality) || (citySlug && !city)) throw new Error("Unsupported doctor landing route");
  const base = "/book-an-appointment";
  if (speciality) return `${base}/${speciality.slug}${city ? `/${city.slug}` : ""}`;
  return city ? `${base}/city/${city.slug}` : base;
}

/** null means this is not a supported landing route, rather than the general directory. */
export function getDoctorLandingContext(pathname: string): DoctorLandingContext | null {
  const path = pathname.replace(/\/$/, "");
  if (path === "/book-an-appointment") return {};
  const match = /^\/book-an-appointment\/([a-z-]+)(?:\/([a-z-]+))?$/.exec(path);
  if (!match) return null;
  const [, first, second] = match;
  if (first === "city") {
    const city = DOCTOR_LANDING_CITIES.find((item) => item.slug === second);
    return city ? { city } : null;
  }
  const speciality = DOCTOR_LANDING_SPECIALITIES.find((item) => item.slug === first);
  const city = second ? DOCTOR_LANDING_CITIES.find((item) => item.slug === second) : undefined;
  if (!speciality || (second && !city)) return null;
  return { speciality, ...(city ? { city } : {}) };
}

export function getDoctorLandingCopy(context: DoctorLandingContext) {
  const { speciality, city } = context;
  const heading = speciality ? `${speciality.plural}${city ? ` in ${city.label}` : ""}`
    : city ? `Doctors in ${city.label}` : "Find a doctor";
  const subject = speciality ? speciality.plural.toLowerCase().replace(/^ent /, "ENT ") : "doctors";
  const summary = `Explore Narayana Health ${subject}${city ? ` in ${city.label}` : ""}, hospital locations and consultation options.`;
  return { heading, summary };
}

/** Display copy only: keep directory facet values and the SEO route vocabulary intact. */
const DOCTOR_LISTING_SUBJECTS = new Map([
  ["Adult Cardiology", "Adult cardiologists"],
  ["Clinical Psychology", "Clinical psychologists"],
  ["Dermatology", "Dermatologists"],
  ["E.N.T", "ENT specialists"],
  ["Endocrinology", "Endocrinologists"],
  ["Executive Health Checkup", "Doctors for executive health checks"],
  ["Family Medicine", "Family physicians"],
  ["General Medicine", "General physicians"],
  ["Gynaecologic Oncology", "Gynaecologic oncologists"],
  ["Gynaecology", "Gynaecologists"],
  ["Interventional Neurology", "Interventional neurologists"],
  ["Medical Gastroenterology", "Medical gastroenterologists"],
  ["Neurosurgery", "Neurosurgeons"],
  ["Obstetrics & Gynaecology", "Obstetricians & gynaecologists"],
  ["Orthopaedic Surgery", "Orthopaedic surgeons"],
  ["Paediatric Cardiology", "Paediatric cardiologists"],
  ["Paediatric Medicine", "Paediatricians"],
  ["Paediatric Nephrology", "Paediatric nephrologists"],
  ["Paediatric Surgery", "Paediatric surgeons"],
  ["Plastic Surgery", "Plastic surgeons"],
  ["Psychiatry", "Psychiatrists"],
  ["Pulmonology", "Pulmonologists"],
  ["Radiology", "Radiologists"],
  ["Urology", "Urologists"],
].map(([department, subject]) => [department.toLowerCase(), subject]));

/** Listing facets can grow independently of the finite SEO route vocabulary. */
export function getDoctorListingCopy({ specialties, city }: {
  specialties: readonly string[];
  city?: DoctorLandingCity;
}) {
  const selected = [...new Set(specialties.map(value => value.trim()).filter(Boolean))];
  const summary = "Explore doctors and consultation options.";
  if (!selected.length) return { heading: city ? `Doctors in ${city.label}` : "Our doctors", summary };
  const location = city ? ` in ${city.label}` : "";
  if (selected.length === 1) {
    const speciality = findDoctorLandingSpeciality(selected[0]);
    if (speciality) return { ...getDoctorLandingCopy({ speciality, city }), summary };
    // Preserve the full department when there is no reviewed clinician label.
    const subject = DOCTOR_LISTING_SUBJECTS.get(selected[0].toLowerCase()) ?? `${selected[0]} specialists`;
    return {
      heading: `${subject}${location}`,
      summary,
    };
  }
  return {
    heading: city ? `Specialists${location}` : "Our specialists",
    summary,
  };
}

/** Mapping, not availability, determines whether a landing page has doctor content. */
export function hasDoctorLandingDoctors(context: DoctorLandingContext, doctors: readonly { speciality: string; city: string }[]) {
  return doctors.some((doctor) => (!context.city || getCityId(doctor.city) === getCityId(context.city.value))
    && (!context.speciality || doctor.speciality.split(/\s*[,|/]\s*/).some((value) => value.toLowerCase() === context.speciality?.label.toLowerCase())));
}

/** Fixtures never count towards indexing. A verified publishing source must explicitly approve each page. */
export function canIndexDoctorLanding({ approved, verifiedDoctorCount }: { approved: boolean; verifiedDoctorCount: number }) {
  return approved && Number.isInteger(verifiedDoctorCount) && verifiedDoctorCount > 0;
}
