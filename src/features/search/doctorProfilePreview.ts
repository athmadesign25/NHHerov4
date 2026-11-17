import type { DoctorListingItem } from "./doctorListing";
import { getDoctorProfileContent, type DoctorProfileContent } from "./doctorProfileContent";
import type { DoctorProfileEditorial } from "./doctorProfileEditorial";

export type DoctorProfileSampleField = "summary" | "expertise" | "qualifications" | "treatments"
  | "education" | "clinicalExperience" | "awards" | "memberships" | "publications" | "articles"
  | "experience" | "languages" | "faqs";
export type DoctorProfileSampleSection = "overview" | "expertise" | "background" | "research" | "faq";

export type DoctorProfilePreviewContent = DoctorProfileContent & {
  /** UI must label these categories as Sample; never pass them into metadata. */
  sampleFields: readonly DoctorProfileSampleField[];
  sampleSections: readonly DoctorProfileSampleSection[];
  hasSampleContent: boolean;
  displayExperience: string;
  displayLanguages: readonly string[];
};

const sectionFields: Record<DoctorProfileSampleSection, readonly DoctorProfileSampleField[]> = {
  overview: ["summary"],
  expertise: ["expertise", "treatments"],
  background: ["qualifications", "education", "clinicalExperience", "awards", "memberships"],
  research: ["publications", "articles"],
  faq: ["faqs"],
};

/**
 * Opt-in stakeholder fixtures for the Design 2 profile, not the clinical record.
 * NH's source profiles share About, Expertise/Treatments, Qualifications,
 * professional history, recognition/memberships, publications and media.
 * This adapter fills every missing text category to exercise that structure.
 *
 * Verified values always win. Generated categories carry explicit provenance;
 * fabricated qualifications, affiliations, awards or publications are never
 * written back to the directory, factual content model or SEO metadata.
 */
export function getDoctorProfilePreviewContent(doctor: DoctorListingItem): DoctorProfilePreviewContent {
  const source = getDoctorProfileContent(doctor);
  const sampled = new Set<DoctorProfileSampleField>();
  const speciality = doctor.speciality.trim() || "specialist care";
  const mainSpeciality = speciality.split(/[,|]/)[0].trim();
  const seed = [...doctor.id].reduce((value, character) => value + character.charCodeAt(0), 0);

  const fill = <T,>(field: DoctorProfileSampleField, existing: readonly T[] | undefined, sample: readonly T[]): T[] => {
    if (existing?.length) return [...existing];
    sampled.add(field);
    return [...sample];
  };

  const summary = fill("summary", source.editorial?.summary, [
    `${doctor.name}’s listed speciality is ${speciality}${doctor.city ? ` in ${doctor.city}` : ""}. This profile brings together clinical interests, qualifications and appointment information.`,
    `The sample care overview covers understanding a patient’s concerns, discussing an assessment and planning follow-up. ${source.hospitals.length ? `Consultation locations are listed below, including ${source.hospitals[0]}.` : "Available consultation options can be reviewed when booking."}`,
  ]);
  const expertise = fill("expertise", source.expertise, [
    `Sample clinical assessment in ${mainSpeciality}`,
    "Sample care planning and follow-up",
    "Sample patient education and counselling",
  ]);
  const qualifications = fill("qualifications", source.qualifications, [
    `Sample postgraduate qualification in ${mainSpeciality}`,
    "Sample advanced clinical training",
  ]);
  const treatmentExamples = [
    `Sample assessment for ${mainSpeciality.toLocaleLowerCase()}`,
    "Sample diagnostic review",
    "Sample treatment planning",
    "Sample follow-up consultation",
    "Sample long-term care review",
    "Sample prevention and wellbeing counselling",
    "Sample multidisciplinary care planning",
    "Sample rehabilitation and recovery review",
  ];
  const treatments = fill("treatments", source.treatments, treatmentExamples.slice(0, seed % 3 === 0 ? 8 : 4));
  const education = fill("education", source.editorial?.education, [
    { title: "Sample postgraduate clinical training", institution: `Illustrative training programme in ${mainSpeciality.toLocaleLowerCase()}` },
    { title: "Sample continuing professional development", institution: "Illustrative advanced clinical education programme" },
  ]);
  const clinicalExperience = fill("clinicalExperience", source.editorial?.clinicalExperience, [
    { role: "Sample specialist appointment", hospital: "Illustrative tertiary-care hospital" },
    { role: "Sample clinical training appointment", hospital: "Illustrative teaching hospital" },
  ]);
  const awards = fill("awards", source.editorial?.awards, [
    { title: "Sample recognition for clinical education", subtitle: "Illustrative recognition for this profile preview" },
    { title: "Sample contribution to a professional conference", subtitle: "Illustrative professional recognition" },
  ]);
  const memberships = fill("memberships", source.editorial?.memberships, [
    `Sample ${mainSpeciality.toLocaleLowerCase()} professional society`,
    "Sample clinical education association",
  ]);
  const publications = fill("publications", source.publications, [
    { title: `Sample publication: patient-centred care in ${mainSpeciality.toLocaleLowerCase()}`, detail: "Illustrative publication — not a published paper" },
    { title: "Sample publication: continuity of care and patient follow-up", detail: "Illustrative publication — not a published paper" },
  ]);
  // Empty URLs deliberately render as non-interactive text in the preview.
  // Never invent article links, journal links, DOI identifiers or authorship.
  const articles = fill("articles", source.articles, [
    { title: `Sample article: preparing for a ${mainSpeciality.toLocaleLowerCase()} consultation`, url: "" },
    { title: "Sample article: making the most of your follow-up appointment", url: "" },
    { title: "Sample article: questions to discuss with your care team", url: "" },
  ]);

  const editorial: DoctorProfileEditorial = {
    ...source.editorial,
    summary, education, clinicalExperience, awards, memberships, treatments, publications, articles,
    sourceUrl: source.editorial?.sourceUrl ?? "",
    verifiedAt: source.editorial?.verifiedAt ?? "",
  };
  const displayExperience = source.verifiedExperience ?? (doctor.experience.trim() || `${12 + seed % 24} years in practice`);
  if (!source.verifiedExperience) sampled.add("experience");
  const displayLanguages = doctor.languages?.length ? [...doctor.languages] : ["English", "Hindi"];
  if (!doctor.languages?.length) sampled.add("languages");

  // These additions describe the working journey, not unverified clinical facts.
  // Existing doctor-specific clinical answers stay unchanged.
  const faqs = [...source.faqs, {
    question: `How can I book an appointment with ${doctor.name}?`,
    answer: "Choose Book appointment, select your consultation type, location and time, then continue to choose the patient and review the booking.",
  }, {
    question: "Can I review my appointment before payment?",
    answer: "Yes. The booking summary shows your selected patient, doctor, location, date and time. You can edit the appointment before continuing to payment.",
  }];
  const sampleFields = [...sampled];
  const sampleSections = (Object.keys(sectionFields) as DoctorProfileSampleSection[])
    .filter(section => sectionFields[section].some(field => sampled.has(field)));
  return {
    ...source, editorial, qualifications, expertise, treatments, publications, articles, faqs,
    hasClinicalDetails: true, hasBackground: true, hasResearch: true,
    sampleFields, sampleSections, hasSampleContent: sampleFields.length > 0,
    displayExperience, displayLanguages,
  };
}
