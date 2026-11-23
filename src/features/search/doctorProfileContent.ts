import { doctorHospitals, type DoctorListingItem } from "./doctorListing";
import { getDesign20CardContent } from "./design20CardContent";
import { doctorProfileEditorial } from "./doctorProfileEditorial";
import { design20DirectorySource } from "./design20DirectoryData";

/** Split supplied credentials without splitting commas inside a qualification. */
function qualificationsFrom(value: string): string[] {
  const items: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < value.length; index++) {
    if (value[index] === "(") depth++;
    if (value[index] === ")") depth = Math.max(0, depth - 1);
    if (!depth && /[,;|\n]/.test(value[index])) {
      items.push(value.slice(start, index).trim());
      start = index + 1;
    }
  }
  items.push(value.slice(start).trim());
  return [...new Set(items.filter(Boolean))];
}

/** One content model drives both section visibility and the navigation anchors. */
export function getDoctorProfileContent(doctor: DoctorListingItem) {
  const editorial = doctorProfileEditorial[doctor.id];
  // Experience is deliberately read from the verified snapshot, never from
  // the directory's stakeholder-preview fallback.
  const verifiedSource = design20DirectorySource.doctors.find(entry => `d20-${entry.id}` === doctor.id);
  const verifiedExperience = verifiedSource?.experienceLabel ?? null;
  const qualifications = qualificationsFrom(doctor.degrees);
  const credentialSummary = [...new Set(qualifications.map(value => value.split("(")[0].trim()).filter(Boolean))].join(" · ");
  const expertise = getDesign20CardContent(doctor).fullExpertise;
  const hospitals = doctorHospitals(doctor);
  const treatments = editorial?.treatments ?? [];
  const publications = editorial?.publications ?? [];
  const articles = editorial?.articles ?? [];
  const hasClinicalDetails = expertise.length > 0 || treatments.length > 0;
  const hasResearch = publications.length > 0 || articles.length > 0;
  const hasBackground = qualifications.length > 0 || !!editorial?.education?.length
    || !!editorial?.clinicalExperience?.length || !!editorial?.awards?.length || !!editorial?.memberships?.length;
  const faqs: { question: string; answer: string }[] = [];
  if (qualifications.length) faqs.push({
    question: `What are ${doctor.name}’s qualifications?`,
    answer: `${doctor.name} holds ${qualifications.join("; ")}.`,
  });
  if (verifiedExperience) faqs.push({
    question: `How much experience does ${doctor.name} have?`,
    answer: `${doctor.name} has ${verifiedExperience}.`,
  });
  if (expertise.length) faqs.push({
    question: `What are ${doctor.name}’s areas of expertise?`,
    answer: `${doctor.name}’s clinical areas include ${expertise.join("; ")}.`,
  });
  if (doctor.modes.video === true) faqs.push({
    question: "Is video consultation available?",
    answer: "Yes. Open Book appointment and choose Video consultation to see available dates and times for this doctor.",
  });
  if (doctor.modes.hospital === true && hospitals.length > 1) faqs.push({
    question: "Can I choose which hospital to visit?",
    answer: "Yes. The locations above show where this doctor consults. Choose your preferred hospital in Book appointment, then select an available date and time for that location.",
  });
  if (doctor.modes.hospital === true && hospitals.length === 1) faqs.push({
    question: "Where will my hospital appointment take place?",
    answer: `At ${hospitals[0]}. Use the directions link in Locations & availability to plan your visit. Your chosen hospital will also appear in your booking summary.`,
  });
  return { editorial, qualifications, credentialSummary, expertise, hospitals, treatments, publications, articles, hasClinicalDetails, hasResearch, hasBackground, faqs, verifiedExperience };
}

export type DoctorProfileContent = ReturnType<typeof getDoctorProfileContent>;
